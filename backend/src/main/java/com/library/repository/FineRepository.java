package com.library.repository;

import com.library.entity.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {

    List<Fine> findByBorrowRecordUserId(Long userId);

    List<Fine> findByPaymentStatusOrderByCreatedAtDesc(Fine.PaymentStatus paymentStatus);

    Optional<Fine> findByBorrowRecordId(Long borrowRecordId);

    @Query("SELECT COALESCE(SUM(f.fineAmount), 0.0) FROM Fine f WHERE f.borrowRecord.user.id = :userId AND f.paymentStatus = 'PENDING'")
    Double sumUnpaidFinesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(f.fineAmount), 0.0) FROM Fine f WHERE f.paymentStatus = 'PAID'")
    Double sumTotalFinesCollected();

    @Query("SELECT COALESCE(SUM(f.fineAmount), 0.0) FROM Fine f WHERE f.paymentStatus = 'PENDING'")
    Double sumTotalPendingFines();
}
