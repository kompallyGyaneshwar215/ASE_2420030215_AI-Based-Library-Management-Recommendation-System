package com.library.dto;

import java.time.LocalDateTime;

public class UserProfileDto {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String phone;
    private String status;
    private String preferredGenres;
    private String favoriteAuthors;
    private LocalDateTime createdAt;
    private long activeLoansCount;
    private double pendingFinesAmount;

    public UserProfileDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPreferredGenres() { return preferredGenres; }
    public void setPreferredGenres(String preferredGenres) { this.preferredGenres = preferredGenres; }

    public String getFavoriteAuthors() { return favoriteAuthors; }
    public void setFavoriteAuthors(String favoriteAuthors) { this.favoriteAuthors = favoriteAuthors; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public long getActiveLoansCount() { return activeLoansCount; }
    public void setActiveLoansCount(long activeLoansCount) { this.activeLoansCount = activeLoansCount; }

    public double getPendingFinesAmount() { return pendingFinesAmount; }
    public void setPendingFinesAmount(double pendingFinesAmount) { this.pendingFinesAmount = pendingFinesAmount; }
}
