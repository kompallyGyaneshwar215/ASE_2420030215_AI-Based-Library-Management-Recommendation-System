package com.library.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "preferred_genres", columnDefinition = "TEXT")
    private String preferredGenres;

    @Column(name = "favorite_authors", columnDefinition = "TEXT")
    private String favoriteAuthors;

    public UserPreference() {}

    public UserPreference(User user, String preferredGenres, String favoriteAuthors) {
        this.user = user;
        this.preferredGenres = preferredGenres;
        this.favoriteAuthors = favoriteAuthors;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPreferredGenres() { return preferredGenres; }
    public void setPreferredGenres(String preferredGenres) { this.preferredGenres = preferredGenres; }

    public String getFavoriteAuthors() { return favoriteAuthors; }
    public void setFavoriteAuthors(String favoriteAuthors) { this.favoriteAuthors = favoriteAuthors; }
}
