package com.library.service;

import com.library.entity.BorrowRecord;
import com.library.repository.BorrowRecordRepository;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@EnableScheduling
public class ScheduledTaskService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final NotificationService notificationService;
    private final FineService fineService;

    public ScheduledTaskService(BorrowRecordRepository borrowRecordRepository,
                                NotificationService notificationService,
                                FineService fineService) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.notificationService = notificationService;
        this.fineService = fineService;
    }

    // Run every hour to check for overdue items and upcoming returns
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkOverdueAndDueSoonBooks() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Mark overdue books and calculate fines
        List<BorrowRecord> overdueRecords = borrowRecordRepository.findOverdueIssuedRecords(now);
        for (BorrowRecord record : overdueRecords) {
            record.setStatus(BorrowRecord.Status.OVERDUE);
            borrowRecordRepository.save(record);

            fineService.calculateAndSaveFineForRecord(record);

            notificationService.createNotification(
                    record.getUser(),
                    "URGENT: '" + record.getBook().getTitle() + "' is overdue. Please return immediately to stop daily fine accumulation.",
                    "OVERDUE_ALERT"
            );
        }

        // 2. Alert books due in 24 hours
        LocalDateTime tomorrow = now.plusDays(1);
        List<BorrowRecord> activeLoans = borrowRecordRepository.findByStatusOrderByRequestDateDesc(BorrowRecord.Status.ISSUED);
        for (BorrowRecord loan : activeLoans) {
            if (loan.getDueDate() != null && loan.getDueDate().isAfter(now) && loan.getDueDate().isBefore(tomorrow)) {
                notificationService.createNotification(
                        loan.getUser(),
                        "Friendly Reminder: '" + loan.getBook().getTitle() + "' is due tomorrow (" + loan.getDueDate().toLocalDate() + ").",
                        "DUE_REMINDER"
                );
            }
        }
    }
}
