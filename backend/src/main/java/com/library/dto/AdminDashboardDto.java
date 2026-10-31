package com.library.dto;

import java.util.List;

public class AdminDashboardDto {
    private long totalRegisteredUsers;
    private long totalLibrarians;
    private long totalStudents;
    private long totalBooks;
    private long totalTransactions;
    private long overdueTransactions;
    private double totalFinesCollected;
    private double totalFinesPending;
    private List<ChartDataDto> userDistribution;
    private List<ChartDataDto> categoryDistribution;
    private List<ChartDataDto> borrowingTrends;
    private List<BorrowRecordDto> recentTransactions;

    public AdminDashboardDto() {}

    public long getTotalRegisteredUsers() { return totalRegisteredUsers; }
    public void setTotalRegisteredUsers(long totalRegisteredUsers) { this.totalRegisteredUsers = totalRegisteredUsers; }

    public long getTotalLibrarians() { return totalLibrarians; }
    public void setTotalLibrarians(long totalLibrarians) { this.totalLibrarians = totalLibrarians; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalBooks() { return totalBooks; }
    public void setTotalBooks(long totalBooks) { this.totalBooks = totalBooks; }

    public long getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(long totalTransactions) { this.totalTransactions = totalTransactions; }

    public long getOverdueTransactions() { return overdueTransactions; }
    public void setOverdueTransactions(long overdueTransactions) { this.overdueTransactions = overdueTransactions; }

    public double getTotalFinesCollected() { return totalFinesCollected; }
    public void setTotalFinesCollected(double totalFinesCollected) { this.totalFinesCollected = totalFinesCollected; }

    public double getTotalFinesPending() { return totalFinesPending; }
    public void setTotalFinesPending(double totalFinesPending) { this.totalFinesPending = totalFinesPending; }

    public List<ChartDataDto> getUserDistribution() { return userDistribution; }
    public void setUserDistribution(List<ChartDataDto> userDistribution) { this.userDistribution = userDistribution; }

    public List<ChartDataDto> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(List<ChartDataDto> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public List<ChartDataDto> getBorrowingTrends() { return borrowingTrends; }
    public void setBorrowingTrends(List<ChartDataDto> borrowingTrends) { this.borrowingTrends = borrowingTrends; }

    public List<BorrowRecordDto> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<BorrowRecordDto> recentTransactions) { this.recentTransactions = recentTransactions; }
}
