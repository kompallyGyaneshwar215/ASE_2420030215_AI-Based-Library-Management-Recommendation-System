package com.library.service;

import com.library.dto.BookDto;
import com.library.entity.Book;
import com.library.entity.User;
import com.library.entity.Wishlist;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.UserRepository;
import com.library.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BookService bookService;

    public WishlistService(WishlistRepository wishlistRepository,
                           BookRepository bookRepository,
                           UserRepository userRepository,
                           BookService bookService) {
        this.wishlistRepository = wishlistRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.bookService = bookService;
    }

    public List<BookDto> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(w -> bookService.mapToDto(w.getBook(), userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addToWishlist(Long userId, Long bookId) {
        if (wishlistRepository.existsByUserIdAndBookId(userId, bookId)) {
            return; // Already in wishlist
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));

        Wishlist wishlist = new Wishlist(user, book);
        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long bookId) {
        wishlistRepository.deleteByUserIdAndBookId(userId, bookId);
    }
}
