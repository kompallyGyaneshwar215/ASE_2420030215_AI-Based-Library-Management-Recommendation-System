package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.dto.RecommendationDto;
import com.library.dto.UserPreferenceDto;
import com.library.security.SecurityUtil;
import com.library.service.AiRecommendationClientService;
import com.library.service.PreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final AiRecommendationClientService recommendationService;
    private final PreferenceService preferenceService;
    private final SecurityUtil securityUtil;

    public RecommendationController(AiRecommendationClientService recommendationService,
                                    PreferenceService preferenceService,
                                    SecurityUtil securityUtil) {
        this.recommendationService = recommendationService;
        this.preferenceService = preferenceService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<RecommendationDto>>> getMyRecommendations(
            @RequestParam(defaultValue = "8") int limit) {
        Long userId = securityUtil.getCurrentUserId();
        List<RecommendationDto> recommendations = recommendationService.getPersonalizedRecommendations(userId, limit);
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }

    @GetMapping("/similar/{bookId}")
    public ResponseEntity<ApiResponse<List<RecommendationDto>>> getSimilarBooks(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "4") int limit) {
        Long currentUserId = securityUtil.getOptionalCurrentUserId();
        List<RecommendationDto> similar = recommendationService.getSimilarBooks(bookId, currentUserId, limit);
        return ResponseEntity.ok(ApiResponse.success(similar));
    }

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<RecommendationDto>>> getPopularBooks(
            @RequestParam(defaultValue = "8") int limit) {
        Long currentUserId = securityUtil.getOptionalCurrentUserId();
        List<RecommendationDto> popular = recommendationService.getPopularRecommendations(currentUserId, limit);
        return ResponseEntity.ok(ApiResponse.success(popular));
    }

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferenceDto>> getPreferences() {
        Long userId = securityUtil.getCurrentUserId();
        UserPreferenceDto dto = preferenceService.getUserPreferences(userId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferenceDto>> updatePreferences(
            @RequestBody UserPreferenceDto dto) {
        Long userId = securityUtil.getCurrentUserId();
        UserPreferenceDto updated = preferenceService.updatePreferences(userId, dto);
        return ResponseEntity.ok(ApiResponse.success("Preferences updated", updated));
    }
}
