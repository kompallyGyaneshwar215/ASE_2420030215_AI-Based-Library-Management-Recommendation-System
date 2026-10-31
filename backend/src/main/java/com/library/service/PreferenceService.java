package com.library.service;

import com.library.dto.UserPreferenceDto;
import com.library.entity.User;
import com.library.entity.UserPreference;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.UserPreferenceRepository;
import com.library.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PreferenceService {

    private final UserPreferenceRepository userPreferenceRepository;
    private final UserRepository userRepository;

    public PreferenceService(UserPreferenceRepository userPreferenceRepository, UserRepository userRepository) {
        this.userPreferenceRepository = userPreferenceRepository;
        this.userRepository = userRepository;
    }

    public UserPreferenceDto getUserPreferences(Long userId) {
        return userPreferenceRepository.findByUserId(userId)
                .map(p -> new UserPreferenceDto(p.getPreferredGenres(), p.getFavoriteAuthors()))
                .orElse(new UserPreferenceDto("", ""));
    }

    @Transactional
    public UserPreferenceDto updatePreferences(Long userId, UserPreferenceDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        UserPreference preference = userPreferenceRepository.findByUserId(userId)
                .orElse(new UserPreference(user, "", ""));

        preference.setPreferredGenres(dto.getPreferredGenres());
        preference.setFavoriteAuthors(dto.getFavoriteAuthors());
        UserPreference saved = userPreferenceRepository.save(preference);

        return new UserPreferenceDto(saved.getPreferredGenres(), saved.getFavoriteAuthors());
    }
}
