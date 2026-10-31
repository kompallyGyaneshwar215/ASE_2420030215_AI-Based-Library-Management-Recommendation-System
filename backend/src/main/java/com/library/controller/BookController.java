package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.dto.BookCreateUpdateDto;
import com.library.dto.BookDto;
import com.library.security.SecurityUtil;
import com.library.service.BookService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final SecurityUtil securityUtil;

    public BookController(BookService bookService, SecurityUtil securityUtil) {
        this.bookService = bookService;
        this.securityUtil = securityUtil;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BookDto>>> getAllBooks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Long currentUserId = securityUtil.getOptionalCurrentUserId();

        Page<BookDto> books = bookService.getAllBooks(query, categoryId, pageable, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookDto>> getBookById(@PathVariable Long id) {
        Long currentUserId = securityUtil.getOptionalCurrentUserId();
        BookDto book = bookService.getBookById(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(book));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<BookDto>>> searchBooks(@RequestParam String query) {
        Long currentUserId = securityUtil.getOptionalCurrentUserId();
        List<BookDto> books = bookService.searchBooks(query, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookDto>> createBook(@Valid @RequestBody BookCreateUpdateDto dto) {
        BookDto created = bookService.createBook(dto);
        return ResponseEntity.ok(ApiResponse.success("Book created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookDto>> updateBook(@PathVariable Long id, @Valid @RequestBody BookCreateUpdateDto dto) {
        BookDto updated = bookService.updateBook(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully", null));
    }
}
