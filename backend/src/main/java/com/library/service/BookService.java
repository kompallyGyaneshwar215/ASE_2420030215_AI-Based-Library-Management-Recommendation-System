package com.library.service;

import com.library.dto.BookCreateUpdateDto;
import com.library.dto.BookDto;
import com.library.entity.Book;
import com.library.entity.Category;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.WishlistRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final WishlistRepository wishlistRepository;

    public BookService(BookRepository bookRepository,
                       CategoryRepository categoryRepository,
                       WishlistRepository wishlistRepository) {
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
        this.wishlistRepository = wishlistRepository;
    }

    public Page<BookDto> getAllBooks(String query, Long categoryId, Pageable pageable, Long currentUserId) {
        Page<Book> books = bookRepository.filterBooks(query, categoryId, pageable);
        return books.map(b -> mapToDto(b, currentUserId));
    }

    public List<BookDto> searchBooks(String query, Long currentUserId) {
        List<Book> books = bookRepository.searchBooks(query);
        return books.stream().map(b -> mapToDto(b, currentUserId)).collect(Collectors.toList());
    }

    public BookDto getBookById(Long id, Long currentUserId) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + id));
        return mapToDto(book, currentUserId);
    }

    @Transactional
    public BookDto createBook(BookCreateUpdateDto dto) {
        if (bookRepository.existsByIsbn(dto.getIsbn())) {
            throw new BadRequestException("A book with ISBN '" + dto.getIsbn() + "' already exists");
        }

        Book book = new Book();
        updateBookFields(book, dto);
        book.setAvailableCopies(dto.getAvailableCopies() != null ? dto.getAvailableCopies() : dto.getTotalCopies());
        Book saved = bookRepository.save(book);
        return mapToDto(saved, null);
    }

    @Transactional
    public BookDto updateBook(Long id, BookCreateUpdateDto dto) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + id));

        // Check if ISBN is being changed to an existing one
        if (!book.getIsbn().equals(dto.getIsbn()) && bookRepository.existsByIsbn(dto.getIsbn())) {
            throw new BadRequestException("A book with ISBN '" + dto.getIsbn() + "' already exists");
        }

        updateBookFields(book, dto);
        if (dto.getAvailableCopies() != null) {
            book.setAvailableCopies(dto.getAvailableCopies());
        }
        Book updated = bookRepository.save(book);
        return mapToDto(updated, null);
    }

    @Transactional
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException("Book not found with ID: " + id);
        }
        bookRepository.deleteById(id);
    }

    public List<BookDto> getPopularBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Book> popular = bookRepository.findMostPopularBooks(pageable);
        if (popular.isEmpty()) {
            popular = bookRepository.findAll(pageable).getContent();
        }
        return popular.stream().map(b -> mapToDto(b, null)).collect(Collectors.toList());
    }

    private void updateBookFields(Book book, BookCreateUpdateDto dto) {
        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setIsbn(dto.getIsbn());
        book.setGenre(dto.getGenre());
        book.setDescription(dto.getDescription());
        book.setPublisher(dto.getPublisher());
        book.setPublicationYear(dto.getPublicationYear());
        book.setTotalCopies(dto.getTotalCopies());

        if (dto.getCoverImageUrl() != null && !dto.getCoverImageUrl().isBlank()) {
            book.setCoverImageUrl(dto.getCoverImageUrl());
        } else if (book.getCoverImageUrl() == null) {
            book.setCoverImageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80");
        }

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));
            book.setCategory(category);
        }
    }

    public BookDto mapToDto(Book book, Long currentUserId) {
        BookDto dto = new BookDto();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setIsbn(book.getIsbn());
        dto.setGenre(book.getGenre());
        if (book.getCategory() != null) {
            dto.setCategoryId(book.getCategory().getId());
            dto.setCategoryName(book.getCategory().getCategoryName());
        }
        dto.setDescription(book.getDescription());
        dto.setPublisher(book.getPublisher());
        dto.setPublicationYear(book.getPublicationYear());
        dto.setTotalCopies(book.getTotalCopies());
        dto.setAvailableCopies(book.getAvailableCopies());
        dto.setCoverImageUrl(book.getCoverImageUrl());
        dto.setCreatedAt(book.getCreatedAt());

        if (currentUserId != null) {
            dto.setInWishlist(wishlistRepository.existsByUserIdAndBookId(currentUserId, book.getId()));
        } else {
            dto.setInWishlist(false);
        }

        return dto;
    }
}
