package com.library.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "library_settings")
public class LibrarySetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loan_duration_days", nullable = false)
    private Integer loanDurationDays = 14;

    @Column(name = "fine_per_day", nullable = false)
    private Double finePerDay = 5.0;

    @Column(name = "max_borrow_limit", nullable = false)
    private Integer maxBorrowLimit = 3;

    public LibrarySetting() {}

    public LibrarySetting(Integer loanDurationDays, Double finePerDay, Integer maxBorrowLimit) {
        this.loanDurationDays = loanDurationDays;
        this.finePerDay = finePerDay;
        this.maxBorrowLimit = maxBorrowLimit;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getLoanDurationDays() { return loanDurationDays; }
    public void setLoanDurationDays(Integer loanDurationDays) { this.loanDurationDays = loanDurationDays; }

    public Double getFinePerDay() { return finePerDay; }
    public void setFinePerDay(Double finePerDay) { this.finePerDay = finePerDay; }

    public Integer getMaxBorrowLimit() { return maxBorrowLimit; }
    public void setMaxBorrowLimit(Integer maxBorrowLimit) { this.maxBorrowLimit = maxBorrowLimit; }
}
