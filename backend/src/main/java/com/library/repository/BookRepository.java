package com.library.repository;

import com.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);
    Boolean existsByIsbn(String isbn);
    List<Book> findByGenreIgnoreCase(String genre);
    List<Book> findByCategoryId(Long categoryId);

    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.genre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Book> searchBooks(@Param("query") String query);

    @Query("SELECT b FROM Book b WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.genre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:categoryId IS NULL OR b.category.id = :categoryId)")
    Page<Book> filterBooks(@Param("query") String query, @Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT b FROM Book b JOIN BorrowRecord br ON br.book.id = b.id " +
           "GROUP BY b.id ORDER BY COUNT(br.id) DESC")
    List<Book> findMostPopularBooks(Pageable pageable);

    @Query("SELECT SUM(b.totalCopies) FROM Book b")
    Long sumTotalCopies();

    @Query("SELECT SUM(b.availableCopies) FROM Book b")
    Long sumAvailableCopies();
}
