package com.library.dto;

public class UserPreferenceDto {
    private String preferredGenres;
    private String favoriteAuthors;

    public UserPreferenceDto() {}

    public UserPreferenceDto(String preferredGenres, String favoriteAuthors) {
        this.preferredGenres = preferredGenres;
        this.favoriteAuthors = favoriteAuthors;
    }

    public String getPreferredGenres() { return preferredGenres; }
    public void setPreferredGenres(String preferredGenres) { this.preferredGenres = preferredGenres; }

    public String getFavoriteAuthors() { return favoriteAuthors; }
    public void setFavoriteAuthors(String favoriteAuthors) { this.favoriteAuthors = favoriteAuthors; }
}
