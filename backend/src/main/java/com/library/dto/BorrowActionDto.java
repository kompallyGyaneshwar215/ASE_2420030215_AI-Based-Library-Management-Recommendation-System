package com.library.dto;

public class BorrowActionDto {
    private String notes;

    public BorrowActionDto() {}

    public BorrowActionDto(String notes) {
        this.notes = notes;
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
