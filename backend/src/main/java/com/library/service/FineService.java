package com.library.service;

import com.library.dto.FineDto;
import com.library.entity.BorrowRecord;
import com.library.entity.Fine;
import com.library.entity.LibrarySetting;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.FineRepository;
import com.library.repository.LibrarySettingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FineService {

    private final FineRepository fineRepository;
    private final LibrarySettingRepository librarySettingRepository;
    private final NotificationService notificationService;

    @Value("${library.loan.fine-per-day:5.0}")
    private double defaultFinePerDay;

    public FineService(FineRepository fineRepository,
                       LibrarySettingRepository librarySettingRepository,
                       NotificationService notificationService) {
        this.fineRepository = fineRepository;
        this.librarySettingRepository = librarySettingRepository;
        this.notificationService = notificationService;
    }

    public List<FineDto> getFinesByUserId(Long userId) {
        return fineRepository.findByBorrowRecordUserId(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<FineDto> getAllFines(Fine.PaymentStatus status) {
        List<Fine> fines = (status != null)
                ? fineRepository.findByPaymentStatusOrderByCreatedAtDesc(status)
                : fineRepository.findAll();
        return fines.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public FineDto payFine(Long fineId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found with ID: " + fineId));

        if (Fine.PaymentStatus.PAID.equals(fine.getPaymentStatus())) {
            throw new BadRequestException("This fine has already been paid");
        }

        fine.setPaymentStatus(Fine.PaymentStatus.PAID);
        fine.setPaidAt(LocalDateTime.now());
        Fine saved = fineRepository.save(fine);

        notificationService.createNotification(
                fine.getBorrowRecord().getUser(),
                "Payment of ₹" + fine.getFineAmount() + " for '" + fine.getBorrowRecord().getBook().getTitle() + "' was successfully recorded.",
                "FINE_PAID"
        );

        return mapToDto(saved);
    }

    @Transactional
    public Fine calculateAndSaveFineForRecord(BorrowRecord record) {
        if (record.getDueDate() == null) return null;

        LocalDateTime effectiveReturnDate = record.getReturnDate() != null ? record.getReturnDate() : LocalDateTime.now();
        if (effectiveReturnDate.isAfter(record.getDueDate())) {
            long daysLate = Duration.between(record.getDueDate(), effectiveReturnDate).toDays();
            if (daysLate == 0 && effectiveReturnDate.isAfter(record.getDueDate())) {
                daysLate = 1; // At least 1 day late if after due date timestamp
            }

            if (daysLate > 0) {
                double rate = getFineRate();
                double amount = daysLate * rate;

                Fine existingFine = fineRepository.findByBorrowRecordId(record.getId()).orElse(null);
                if (existingFine != null) {
                    if (existingFine.getPaymentStatus() == Fine.PaymentStatus.PENDING) {
                        existingFine.setFineAmount(amount);
                        return fineRepository.save(existingFine);
                    }
                    return existingFine;
                } else {
                    Fine fine = new Fine(record, amount);
                    Fine saved = fineRepository.save(fine);

                    notificationService.createNotification(
                            record.getUser(),
                            "An overdue fine of ₹" + amount + " (" + daysLate + " days @ ₹" + rate + "/day) has been generated for '" + record.getBook().getTitle() + "'.",
                            "FINE_GENERATED"
                    );

                    return saved;
                }
            }
        }
        return null;
    }

    public double getFineRate() {
        return librarySettingRepository.findAll().stream().findFirst()
                .map(LibrarySetting::getFinePerDay)
                .orElse(defaultFinePerDay);
    }

    public FineDto mapToDto(Fine fine) {
        FineDto dto = new FineDto();
        dto.setId(fine.getId());
        dto.setBorrowId(fine.getBorrowRecord().getId());
        dto.setBookId(fine.getBorrowRecord().getBook().getId());
        dto.setBookTitle(fine.getBorrowRecord().getBook().getTitle());
        dto.setUserId(fine.getBorrowRecord().getUser().getId());
        dto.setUserName(fine.getBorrowRecord().getUser().getFullName());
        dto.setUserEmail(fine.getBorrowRecord().getUser().getEmail());
        dto.setFineAmount(fine.getFineAmount());
        dto.setPaymentStatus(fine.getPaymentStatus().name());
        dto.setCreatedAt(fine.getCreatedAt());
        dto.setPaidAt(fine.getPaidAt());
        return dto;
    }
}
