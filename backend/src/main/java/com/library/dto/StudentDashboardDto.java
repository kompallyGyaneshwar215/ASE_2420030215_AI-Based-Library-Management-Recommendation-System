package com.library.dto;

import java.util.List;

public class StudentDashboardDto {
    private long totalBooksBorrowed;
    private long currentlyBorrowed;
    private long upcomingReturns;
    private long overdueBooks;
    private double outstandingFines;
    private List<BorrowRecordDto> activeBorrows;
    private List<BorrowRecordDto> recentActivity;
    private List<RecommendationDto> recommendedBooks;
    private List<NotificationDto> recentNotifications;

    public StudentDashboardDto() {}

    public long getTotalBooksBorrowed() { return totalBooksBorrowed; }
    public void setTotalBooksBorrowed(long totalBooksBorrowed) { this.totalBooksBorrowed = totalBooksBorrowed; }

    public long getCurrentlyBorrowed() { return currentlyBorrowed; }
    public void setCurrentlyBorrowed(long currentlyBorrowed) { this.currentlyBorrowed = currentlyBorrowed; }

    public long getUpcomingReturns() { return upcomingReturns; }
    public void setUpcomingReturns(long upcomingReturns) { this.upcomingReturns = upcomingReturns; }

    public long getOverdueBooks() { return overdueBooks; }
    public void setOverdueBooks(long overdueBooks) { this.overdueBooks = overdueBooks; }

    public double getOutstandingFines() { return outstandingFines; }
    public void setOutstandingFines(double outstandingFines) { this.outstandingFines = outstandingFines; }

    public List<BorrowRecordDto> getActiveBorrows() { return activeBorrows; }
    public void setActiveBorrows(List<BorrowRecordDto> activeBorrows) { this.activeBorrows = activeBorrows; }

    public List<BorrowRecordDto> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<BorrowRecordDto> recentActivity) { this.recentActivity = recentActivity; }

    public List<RecommendationDto> getRecommendedBooks() { return recommendedBooks; }
    public void setRecommendedBooks(List<RecommendationDto> recommendedBooks) { this.recommendedBooks = recommendedBooks; }

    public List<NotificationDto> getRecentNotifications() { return recentNotifications; }
    public void setRecentNotifications(List<NotificationDto> recentNotifications) { this.recentNotifications = recentNotifications; }
}
