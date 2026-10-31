package com.library.repository;

import com.library.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByUserIdOrderByRequestDateDesc(Long userId);

    List<BorrowRecord> findByUserIdAndStatus(Long userId, BorrowRecord.Status status);

    List<BorrowRecord> findByStatusOrderByRequestDateDesc(BorrowRecord.Status status);

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.user.id = :userId AND br.status IN ('REQUESTED', 'APPROVED', 'ISSUED')")
    long countActiveBorrowsByUserId(@Param("userId") Long userId);

    long countByStatus(BorrowRecord.Status status);

    @Query("SELECT br FROM BorrowRecord br WHERE br.status = 'ISSUED' AND br.dueDate < :now")
    List<BorrowRecord> findOverdueIssuedRecords(@Param("now") LocalDateTime now);

    @Query("SELECT br FROM BorrowRecord br WHERE br.user.id = :userId AND br.status IN ('ISSUED', 'OVERDUE')")
    List<BorrowRecord> findCurrentlyBorrowedBooksByUserId(@Param("userId") Long userId);

    @Query("SELECT br.book.genre, COUNT(br) FROM BorrowRecord br GROUP BY br.book.genre ORDER BY COUNT(br) DESC")
    List<Object[]> countBorrowingByGenre();
}
