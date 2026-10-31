package com.library.service;

import com.library.dto.AuthResponse;
import com.library.dto.LoginRequest;
import com.library.dto.RegisterRequest;
import com.library.dto.UserProfileDto;
import com.library.entity.User;
import com.library.entity.UserPreference;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.FineRepository;
import com.library.repository.UserPreferenceRepository;
import com.library.repository.UserRepository;
import com.library.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final FineRepository fineRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final NotificationService notificationService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       UserPreferenceRepository userPreferenceRepository,
                       BorrowRecordRepository borrowRecordRepository,
                       FineRepository fineRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       NotificationService notificationService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.fineRepository = fineRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.notificationService = notificationService;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Your account has been deactivated. Please contact the administrator.");
        }

        String token = tokenProvider.generateTokenFromEmail(user.getEmail(), user.getRole().name(), user.getId());

        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), user.getPhone());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User.Role role = User.Role.STUDENT;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                role = User.Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        User user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                role,
                request.getPhone()
        );
        user = userRepository.save(user);

        // Save preferences if provided
        if ((request.getPreferredGenres() != null && !request.getPreferredGenres().isBlank()) ||
            (request.getFavoriteAuthors() != null && !request.getFavoriteAuthors().isBlank())) {
            UserPreference preference = new UserPreference(
                    user,
                    request.getPreferredGenres() != null ? request.getPreferredGenres() : "",
                    request.getFavoriteAuthors() != null ? request.getFavoriteAuthors() : ""
            );
            userPreferenceRepository.save(preference);
        }

        // Welcome notification
        notificationService.createNotification(
                user,
                "Welcome to AI Library Management System, " + user.getFullName() + "! Explore our catalog and personalized AI recommendations.",
                "REGISTRATION_WELCOME"
        );

        String token = tokenProvider.generateTokenFromEmail(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), user.getPhone());
    }

    public UserProfileDto getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setPhone(user.getPhone());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());

        userPreferenceRepository.findByUserId(user.getId()).ifPresent(pref -> {
            dto.setPreferredGenres(pref.getPreferredGenres());
            dto.setFavoriteAuthors(pref.getFavoriteAuthors());
        });

        dto.setActiveLoansCount(borrowRecordRepository.countActiveBorrowsByUserId(user.getId()));
        Double unpaidFines = fineRepository.sumUnpaidFinesByUserId(user.getId());
        dto.setPendingFinesAmount(unpaidFines != null ? unpaidFines : 0.0);

        return dto;
    }
}
