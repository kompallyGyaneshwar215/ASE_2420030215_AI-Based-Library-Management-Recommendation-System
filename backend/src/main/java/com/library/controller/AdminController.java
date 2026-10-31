package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.dto.LibrarySettingDto;
import com.library.dto.RegisterRequest;
import com.library.dto.UserProfileDto;
import com.library.entity.LibrarySetting;
import com.library.entity.User;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.LibrarySettingRepository;
import com.library.repository.UserRepository;
import com.library.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final LibrarySettingRepository librarySettingRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    public AdminController(UserRepository userRepository,
                           LibrarySettingRepository librarySettingRepository,
                           PasswordEncoder passwordEncoder,
                           AuthService authService) {
        this.userRepository = userRepository;
        this.librarySettingRepository = librarySettingRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers(@RequestParam(required = false) String role) {
        List<User> users;
        if (role != null && !role.isBlank()) {
            try {
                User.Role userRole = User.Role.valueOf(role.toUpperCase());
                users = userRepository.findByRole(userRole);
            } catch (IllegalArgumentException e) {
                users = userRepository.findAll();
            }
        } else {
            users = userRepository.findAll();
        }

        List<UserProfileDto> dtos = users.stream()
                .map(u -> authService.getCurrentUserProfile(u.getEmail()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PostMapping("/librarians")
    public ResponseEntity<ApiResponse<UserProfileDto>> createLibrarian(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User librarian = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                User.Role.LIBRARIAN,
                request.getPhone()
        );
        User saved = userRepository.save(librarian);
        return ResponseEntity.ok(ApiResponse.success("Librarian account created successfully",
                authService.getCurrentUserProfile(saved.getEmail())));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserProfileDto>> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        String newStatus = payload.getOrDefault("status", "ACTIVE".equals(user.getStatus()) ? "INACTIVE" : "ACTIVE");
        user.setStatus(newStatus.toUpperCase());
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("User status updated to " + user.getStatus(),
                authService.getCurrentUserProfile(user.getEmail())));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<LibrarySettingDto>> getSettings() {
        LibrarySetting setting = librarySettingRepository.findAll().stream().findFirst()
                .orElse(new LibrarySetting(14, 5.0, 3));
        LibrarySettingDto dto = new LibrarySettingDto(
                setting.getLoanDurationDays(),
                setting.getFinePerDay(),
                setting.getMaxBorrowLimit()
        );
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<LibrarySettingDto>> updateSettings(@Valid @RequestBody LibrarySettingDto dto) {
        LibrarySetting setting = librarySettingRepository.findAll().stream().findFirst()
                .orElse(new LibrarySetting());

        setting.setLoanDurationDays(dto.getLoanDurationDays());
        setting.setFinePerDay(dto.getFinePerDay());
        setting.setMaxBorrowLimit(dto.getMaxBorrowLimit());

        LibrarySetting saved = librarySettingRepository.save(setting);
        return ResponseEntity.ok(ApiResponse.success("Library settings updated",
                new LibrarySettingDto(saved.getLoanDurationDays(), saved.getFinePerDay(), saved.getMaxBorrowLimit())));
    }
}
