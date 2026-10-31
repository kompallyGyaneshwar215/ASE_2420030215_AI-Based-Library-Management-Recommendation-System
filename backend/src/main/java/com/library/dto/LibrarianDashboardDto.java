package com.library.dto;

import java.util.List;

public class LibrarianDashboardDto {
    private long totalBooks;
    private long availableBooks;
    private long totalStudents;
    private long activeBorrowings;
    private long pendingBorrowRequests;
    private long overdueBooks;
    private long returnedBooks;
    private double totalFinesPending;
    private double totalFinesCollected;
    private List<BorrowRecordDto> pendingRequests;
    private List<BorrowRecordDto> overdueLoans;
    private List<BookDto> mostBorrowedBooks;
    private List<ChartDataDto> genreDistribution;
    private List<ChartDataDto> monthlyBorrowings;

    public LibrarianDashboardDto() {}

    public long getTotalBooks() { return totalBooks; }
    public void setTotalBooks(long totalBooks) { this.totalBooks = totalBooks; }

    public long getAvailableBooks() { return availableBooks; }
    public void setAvailableBooks(long availableBooks) { this.availableBooks = availableBooks; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getActiveBorrowings() { return activeBorrowings; }
    public void setActiveBorrowings(long activeBorrowings) { this.activeBorrowings = activeBorrowings; }

    public long getPendingBorrowRequests() { return pendingBorrowRequests; }
    public void setPendingBorrowRequests(long pendingBorrowRequests) { this.pendingBorrowRequests = pendingBorrowRequests; }

    public long getOverdueBooks() { return overdueBooks; }
    public void setOverdueBooks(long overdueBooks) { this.overdueBooks = overdueBooks; }

    public long getReturnedBooks() { return returnedBooks; }
    public void setReturnedBooks(long returnedBooks) { this.returnedBooks = returnedBooks; }

    public double getTotalFinesPending() { return totalFinesPending; }
    public void setTotalFinesPending(double totalFinesPending) { this.totalFinesPending = totalFinesPending; }

    public double getTotalFinesCollected() { return totalFinesCollected; }
    public void setTotalFinesCollected(double totalFinesCollected) { this.totalFinesCollected = totalFinesCollected; }

    public List<BorrowRecordDto> getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(List<BorrowRecordDto> pendingRequests) { this.pendingRequests = pendingRequests; }

    public List<BorrowRecordDto> getOverdueLoans() { return overdueLoans; }
    public void setOverdueLoans(List<BorrowRecordDto> overdueLoans) { this.overdueLoans = overdueLoans; }

    public List<BookDto> getMostBorrowedBooks() { return mostBorrowedBooks; }
    public void setMostBorrowedBooks(List<BookDto> mostBorrowedBooks) { this.mostBorrowedBooks = mostBorrowedBooks; }

    public List<ChartDataDto> getGenreDistribution() { return genreDistribution; }
    public void setGenreDistribution(List<ChartDataDto> genreDistribution) { this.genreDistribution = genreDistribution; }

    public List<ChartDataDto> getMonthlyBorrowings() { return monthlyBorrowings; }
    public void setMonthlyBorrowings(List<ChartDataDto> monthlyBorrowings) { this.monthlyBorrowings = monthlyBorrowings; }
}
