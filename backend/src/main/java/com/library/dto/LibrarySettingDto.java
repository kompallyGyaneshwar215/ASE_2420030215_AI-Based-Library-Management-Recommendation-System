package com.library.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class LibrarySettingDto {

    @NotNull(message = "Loan duration is required")
    @Min(value = 1, message = "Loan duration must be at least 1 day")
    private Integer loanDurationDays;

    @NotNull(message = "Fine per day is required")
    @Min(value = 0, message = "Fine per day cannot be negative")
    private Double finePerDay;

    @NotNull(message = "Max borrow limit is required")
    @Min(value = 1, message = "Borrow limit must be at least 1")
    private Integer maxBorrowLimit;

    public LibrarySettingDto() {}

    public LibrarySettingDto(Integer loanDurationDays, Double finePerDay, Integer maxBorrowLimit) {
        this.loanDurationDays = loanDurationDays;
        this.finePerDay = finePerDay;
        this.maxBorrowLimit = maxBorrowLimit;
    }

    public Integer getLoanDurationDays() { return loanDurationDays; }
    public void setLoanDurationDays(Integer loanDurationDays) { this.loanDurationDays = loanDurationDays; }

    public Double getFinePerDay() { return finePerDay; }
    public void setFinePerDay(Double finePerDay) { this.finePerDay = finePerDay; }

    public Integer getMaxBorrowLimit() { return maxBorrowLimit; }
    public void setMaxBorrowLimit(Integer maxBorrowLimit) { this.maxBorrowLimit = maxBorrowLimit; }
}
