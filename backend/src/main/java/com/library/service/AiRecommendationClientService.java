package com.library.service;

import com.library.dto.AiRecommendationRequestDto;
import com.library.dto.BookDto;
import com.library.dto.RecommendationDto;
import com.library.entity.Book;
import com.library.entity.BorrowRecord;
import com.library.entity.UserPreference;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.UserPreferenceRepository;
import com.library.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiRecommendationClientService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final WishlistRepository wishlistRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.recommendation.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public AiRecommendationClientService(BookRepository bookRepository,
                                        BorrowRecordRepository borrowRecordRepository,
                                        UserPreferenceRepository userPreferenceRepository,
                                        WishlistRepository wishlistRepository) {
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.wishlistRepository = wishlistRepository;
        this.restTemplate = new RestTemplate();
    }

    public List<RecommendationDto> getPersonalizedRecommendations(Long userId, int limit) {
        // Collect user reading profile
        List<BorrowRecord> history = borrowRecordRepository.findByUserIdOrderByRequestDateDesc(userId);
        Set<Long> borrowedBookIds = history.stream().map(r -> r.getBook().getId()).collect(Collectors.toSet());
        List<String> borrowedGenres = history.stream().map(r -> r.getBook().getGenre()).distinct().collect(Collectors.toList());

        UserPreference preference = userPreferenceRepository.findByUserId(userId).orElse(null);
        List<String> preferredGenres = new ArrayList<>();
        List<String> favoriteAuthors = new ArrayList<>();

        if (preference != null) {
            if (preference.getPreferredGenres() != null && !preference.getPreferredGenres().isBlank()) {
                preferredGenres = Arrays.stream(preference.getPreferredGenres().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
            }
            if (preference.getFavoriteAuthors() != null && !preference.getFavoriteAuthors().isBlank()) {
                favoriteAuthors = Arrays.stream(preference.getFavoriteAuthors().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
            }
        }

        // Try calling the FastAPI AI service
        try {
            String url = aiServiceUrl + "/api/recommendations/personalized";
            AiRecommendationRequestDto requestPayload = new AiRecommendationRequestDto();
            requestPayload.setUserId(userId);
            requestPayload.setBorrowedBookIds(new ArrayList<>(borrowedBookIds));
            requestPayload.setPreferredGenres(preferredGenres);
            requestPayload.setFavoriteAuthors(favoriteAuthors);
            requestPayload.setLimit(limit);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<AiRecommendationRequestDto> entity = new HttpEntity<>(requestPayload, headers);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
                List<RecommendationDto> result = new ArrayList<>();
                for (Map<String, Object> item : response.getBody()) {
                    Long bookId = ((Number) item.get("bookId")).longValue();
                    bookRepository.findById(bookId).ifPresent(book -> {
                        RecommendationDto rec = mapToRecDto(book, userId);
                        if (item.containsKey("similarityScore")) {
                            rec.setSimilarityScore(((Number) item.get("similarityScore")).doubleValue());
                        }
                        if (item.containsKey("reason")) {
                            rec.setReason((String) item.get("reason"));
                        }
                        result.add(rec);
                    });
                }
                if (!result.isEmpty()) {
                    return result;
                }
            }
        } catch (Exception e) {
            // Log fallback trigger
            System.out.println("AI Service unavailable or timed out: " + e.getMessage() + ". Engaging built-in Content-Based Recommendation Engine.");
        }

        // Built-in Content-Based & Preference-Based Fallback Recommendation Engine
        return computeIntelligentFallbackRecommendations(userId, borrowedBookIds, borrowedGenres, preferredGenres, favoriteAuthors, limit);
    }

    public List<RecommendationDto> getSimilarBooks(Long bookId, Long currentUserId, int limit) {
        Book targetBook = bookRepository.findById(bookId).orElse(null);
        if (targetBook == null) return Collections.emptyList();

        try {
            String url = aiServiceUrl + "/api/recommendations/similar/" + bookId;
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
                List<RecommendationDto> result = new ArrayList<>();
                for (Map<String, Object> item : response.getBody()) {
                    Long id = ((Number) item.get("bookId")).longValue();
                    bookRepository.findById(id).ifPresent(b -> {
                        RecommendationDto rec = mapToRecDto(b, currentUserId);
                        rec.setSimilarityScore(((Number) item.get("similarityScore")).doubleValue());
                        rec.setReason((String) item.get("reason"));
                        result.add(rec);
                    });
                }
                if (!result.isEmpty()) return result;
            }
        } catch (Exception ignored) {}

        // Fallback similarity calculation
        List<Book> candidates = bookRepository.findAll().stream()
                .filter(b -> !b.getId().equals(bookId))
                .collect(Collectors.toList());

        List<RecommendationDto> scored = new ArrayList<>();
        for (Book b : candidates) {
            double score = 40.0;
            String reason = "Similar general reading material in the catalog.";

            if (b.getGenre().equalsIgnoreCase(targetBook.getGenre())) {
                score += 35.0;
                reason = "Highly related genre: " + b.getGenre();
            }
            if (b.getCategory() != null && targetBook.getCategory() != null &&
                b.getCategory().getId().equals(targetBook.getCategory().getId())) {
                score += 15.0;
            }
            if (b.getAuthor().equalsIgnoreCase(targetBook.getAuthor())) {
                score += 9.0;
                reason = "By the same author: " + b.getAuthor();
            }

            RecommendationDto dto = mapToRecDto(b, currentUserId);
            dto.setSimilarityScore(Math.min(98.5, score));
            dto.setReason(reason);
            scored.add(dto);
        }

        scored.sort((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()));
        return scored.stream().limit(limit).collect(Collectors.toList());
    }

    public List<RecommendationDto> getPopularRecommendations(Long currentUserId, int limit) {
        List<Book> popular = bookRepository.findMostPopularBooks(org.springframework.data.domain.PageRequest.of(0, limit));
        if (popular.isEmpty()) {
            popular = bookRepository.findAll(org.springframework.data.domain.PageRequest.of(0, limit)).getContent();
        }

        List<RecommendationDto> result = new ArrayList<>();
        int rank = 1;
        for (Book b : popular) {
            RecommendationDto dto = mapToRecDto(b, currentUserId);
            dto.setSimilarityScore(Math.max(70.0, 99.0 - (rank * 3.5)));
            dto.setReason("Popular in the library: Highly borrowed by fellow students this month.");
            result.add(dto);
            rank++;
        }
        return result;
    }

    private List<RecommendationDto> computeIntelligentFallbackRecommendations(Long userId,
                                                                             Set<Long> borrowedBookIds,
                                                                             List<String> borrowedGenres,
                                                                             List<String> preferredGenres,
                                                                             List<String> favoriteAuthors,
                                                                             int limit) {
        List<Book> allBooks = bookRepository.findAll();
        List<RecommendationDto> scoredList = new ArrayList<>();

        for (Book book : allBooks) {
            if (borrowedBookIds.contains(book.getId())) {
                continue; // Exclude already borrowed books
            }

            double score = 50.0;
            List<String> reasons = new ArrayList<>();

            // Match preferred genres
            for (String prefGenre : preferredGenres) {
                if (book.getGenre().toLowerCase().contains(prefGenre.toLowerCase()) ||
                    (book.getDescription() != null && book.getDescription().toLowerCase().contains(prefGenre.toLowerCase()))) {
                    score += 25.0;
                    reasons.add("Matches your registered interest in " + prefGenre);
                    break;
                }
            }

            // Match past borrowed genres
            for (String bGenre : borrowedGenres) {
                if (book.getGenre().equalsIgnoreCase(bGenre)) {
                    score += 20.0;
                    reasons.add("You previously borrowed books in " + bGenre);
                    break;
                }
            }

            // Match favorite authors
            for (String author : favoriteAuthors) {
                if (book.getAuthor().toLowerCase().contains(author.toLowerCase())) {
                    score += 15.0;
                    reasons.add("Written by your favorite author " + book.getAuthor());
                    break;
                }
            }

            // Availability bonus
            if (book.getAvailableCopies() > 0) {
                score += 5.0;
            }

            String finalReason = reasons.isEmpty()
                    ? "Curated selection matching foundational library curriculum."
                    : String.join("; ", reasons);

            RecommendationDto dto = mapToRecDto(book, userId);
            dto.setSimilarityScore(Math.min(99.0, score));
            dto.setReason(finalReason);
            scoredList.add(dto);
        }

        // Sort descending by similarity score
        scoredList.sort((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()));

        if (scoredList.isEmpty()) {
            return getPopularRecommendations(userId, limit);
        }

        return scoredList.stream().limit(limit).collect(Collectors.toList());
    }

    private RecommendationDto mapToRecDto(Book book, Long currentUserId) {
        RecommendationDto dto = new RecommendationDto();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setIsbn(book.getIsbn());
        dto.setGenre(book.getGenre());
        if (book.getCategory() != null) {
            dto.setCategoryName(book.getCategory().getCategoryName());
        }
        dto.setDescription(book.getDescription());
        dto.setAvailableCopies(book.getAvailableCopies());
        dto.setCoverImageUrl(book.getCoverImageUrl());
        if (currentUserId != null) {
            dto.setInWishlist(wishlistRepository.existsByUserIdAndBookId(currentUserId, book.getId()));
        }
        return dto;
    }
}
