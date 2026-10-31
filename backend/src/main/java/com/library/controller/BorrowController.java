package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.dto.BorrowActionDto;
import com.library.dto.BorrowRecordDto;
import com.library.dto.BorrowRequestDto;
import com.library.entity.BorrowRecord;
import com.library.security.SecurityUtil;
import com.library.service.BorrowService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow")
public class BorrowController {

    private final BorrowService borrowService;
    private final SecurityUtil securityUtil;

    public BorrowController(BorrowService borrowService, SecurityUtil securityUtil) {
        this.borrowService = borrowService;
        this.securityUtil = securityUtil;
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<BorrowRecordDto>> requestBorrow(@Valid @RequestBody BorrowRequestDto dto) {
        Long userId = securityUtil.getCurrentUserId();
        BorrowRecordDto record = borrowService.requestBorrow(userId, dto);
        return ResponseEntity.ok(ApiResponse.success("Borrow request submitted successfully", record));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BorrowRecordDto>> approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) BorrowActionDto dto) {
        String notes = dto != null ? dto.getNotes() : null;
        BorrowRecordDto record = borrowService.approveRequest(id, notes);
        return ResponseEntity.ok(ApiResponse.success("Request approved", record));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BorrowRecordDto>> rejectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) BorrowActionDto dto) {
        String notes = dto != null ? dto.getNotes() : null;
        BorrowRecordDto record = borrowService.rejectRequest(id, notes);
        return ResponseEntity.ok(ApiResponse.success("Request rejected", record));
    }

    @PutMapping("/{id}/issue")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BorrowRecordDto>> issueBook(
            @PathVariable Long id,
            @RequestBody(required = false) BorrowActionDto dto) {
        String notes = dto != null ? dto.getNotes() : null;
        BorrowRecordDto record = borrowService.issueBook(id, notes);
        return ResponseEntity.ok(ApiResponse.success("Book issued successfully", record));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<ApiResponse<BorrowRecordDto>> returnBook(
            @PathVariable Long id,
            @RequestBody(required = false) BorrowActionDto dto) {
        String notes = dto != null ? dto.getNotes() : null;
        BorrowRecordDto record = borrowService.returnBook(id, notes);
        return ResponseEntity.ok(ApiResponse.success("Book returned successfully", record));
    }

    @GetMapping("/my-books")
    public ResponseEntity<ApiResponse<List<BorrowRecordDto>>> getCurrentlyBorrowed() {
        Long userId = securityUtil.getCurrentUserId();
        List<BorrowRecordDto> books = borrowService.getCurrentlyBorrowed(userId);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<BorrowRecordDto>>> getUserBorrowHistory() {
        Long userId = securityUtil.getCurrentUserId();
        List<BorrowRecordDto> history = borrowService.getUserBorrowHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<BorrowRecordDto>>> getStudentBorrowHistory(@PathVariable Long userId) {
        List<BorrowRecordDto> history = borrowService.getUserBorrowHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<BorrowRecordDto>>> getAllRecords(
            @RequestParam(required = false) BorrowRecord.Status status) {
        List<BorrowRecordDto> records = borrowService.getAllRecords(status);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<BorrowRecordDto>>> getPendingRequests() {
        List<BorrowRecordDto> records = borrowService.getAllRecords(BorrowRecord.Status.REQUESTED);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<BorrowRecordDto>>> getOverdueRecords() {
        List<BorrowRecordDto> records = borrowService.getOverdueRecords();
        return ResponseEntity.ok(ApiResponse.success(records));
    }
}
