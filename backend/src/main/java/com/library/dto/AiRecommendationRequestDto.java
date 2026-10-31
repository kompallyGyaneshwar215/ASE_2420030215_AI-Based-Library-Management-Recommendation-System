package com.library.dto;

import java.util.List;

public class AiRecommendationRequestDto {
    private Long userId;
    private List<Long> borrowedBookIds;
    private List<String> preferredGenres;
    private List<String> favoriteAuthors;
    private Integer limit = 6;

    public AiRecommendationRequestDto() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<Long> getBorrowedBookIds() { return borrowedBookIds; }
    public void setBorrowedBookIds(List<Long> borrowedBookIds) { this.borrowedBookIds = borrowedBookIds; }

    public List<String> getPreferredGenres() { return preferredGenres; }
    public void setPreferredGenres(List<String> preferredGenres) { this.preferredGenres = preferredGenres; }

    public List<String> getFavoriteAuthors() { return favoriteAuthors; }
    public void setFavoriteAuthors(List<String> favoriteAuthors) { this.favoriteAuthors = favoriteAuthors; }

    public Integer getLimit() { return limit; }
    public void setLimit(Integer limit) { this.limit = limit; }
}
