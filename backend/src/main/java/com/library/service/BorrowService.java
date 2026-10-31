package com.library.service;

import com.library.dto.BorrowRecordDto;
import com.library.dto.BorrowRequestDto;
import com.library.entity.Book;
import com.library.entity.BorrowRecord;
import com.library.entity.Fine;
import com.library.entity.LibrarySetting;
import com.library.entity.User;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.FineRepository;
import com.library.repository.LibrarySettingRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final FineRepository fineRepository;
    private final LibrarySettingRepository librarySettingRepository;
    private final NotificationService notificationService;
    private final FineService fineService;

    @Value("${library.loan.duration-days:14}")
    private int defaultLoanDurationDays;

    @Value("${library.loan.max-borrow-limit:3}")
    private int defaultMaxBorrowLimit;

    public BorrowService(BorrowRecordRepository borrowRecordRepository,
                         BookRepository bookRepository,
                         UserRepository userRepository,
                         FineRepository fineRepository,
                         LibrarySettingRepository librarySettingRepository,
                         NotificationService notificationService,
                         FineService fineService) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.fineRepository = fineRepository;
        this.librarySettingRepository = librarySettingRepository;
        this.notificationService = notificationService;
        this.fineService = fineService;
    }

    @Transactional
    public BorrowRecordDto requestBorrow(Long userId, BorrowRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Book book = bookRepository.findById(dto.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + dto.getBookId()));

        // Check borrowing limit
        int maxLimit = getMaxBorrowLimit();
        long activeCount = borrowRecordRepository.countActiveBorrowsByUserId(userId);
        if (activeCount >= maxLimit) {
            throw new BadRequestException("You have reached your maximum borrowing limit of " + maxLimit + " books.");
        }

        // Check availability
        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("'" + book.getTitle() + "' is currently unavailable. All copies are in circulation.");
        }

        BorrowRecord record = new BorrowRecord();
        record.setUser(user);
        record.setBook(book);
        record.setRequestDate(LocalDateTime.now());
        record.setStatus(BorrowRecord.Status.REQUESTED);
        record.setNotes(dto.getNotes());

        BorrowRecord saved = borrowRecordRepository.save(record);

        notificationService.createNotification(
                user,
                "Your borrowing request for '" + book.getTitle() + "' has been submitted and is awaiting librarian review.",
                "BORROW_REQUESTED"
        );

        return mapToDto(saved);
    }

    @Transactional
    public BorrowRecordDto approveRequest(Long borrowId, String notes) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with ID: " + borrowId));

        if (record.getStatus() != BorrowRecord.Status.REQUESTED) {
            throw new BadRequestException("Only REQUESTED records can be approved. Current status: " + record.getStatus());
        }

        record.setStatus(BorrowRecord.Status.APPROVED);
        if (notes != null) record.setNotes(notes);
        BorrowRecord saved = borrowRecordRepository.save(record);

        notificationService.createNotification(
                record.getUser(),
                "Your request for '" + record.getBook().getTitle() + "' has been approved! Please visit the desk to pick it up.",
                "BORROW_APPROVED"
        );

        return mapToDto(saved);
    }

    @Transactional
    public BorrowRecordDto rejectRequest(Long borrowId, String notes) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with ID: " + borrowId));

        if (record.getStatus() != BorrowRecord.Status.REQUESTED && record.getStatus() != BorrowRecord.Status.APPROVED) {
            throw new BadRequestException("Cannot reject record with status: " + record.getStatus());
        }

        record.setStatus(BorrowRecord.Status.REJECTED);
        if (notes != null) record.setNotes(notes);
        BorrowRecord saved = borrowRecordRepository.save(record);

        notificationService.createNotification(
                record.getUser(),
                "Your request for '" + record.getBook().getTitle() + "' was rejected. " + (notes != null ? notes : ""),
                "BORROW_REJECTED"
        );

        return mapToDto(saved);
    }

    @Transactional
    public BorrowRecordDto issueBook(Long borrowId, String notes) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with ID: " + borrowId));

        if (record.getStatus() != BorrowRecord.Status.REQUESTED && record.getStatus() != BorrowRecord.Status.APPROVED) {
            throw new BadRequestException("Record must be REQUESTED or APPROVED to be issued. Current status: " + record.getStatus());
        }

        Book book = record.getBook();
        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("Cannot issue book. No copies available.");
        }

        // Atomically decrement available copy count
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        int duration = getLoanDurationDays();
        LocalDateTime now = LocalDateTime.now();
        record.setStatus(BorrowRecord.Status.ISSUED);
        record.setIssueDate(now);
        record.setDueDate(now.plusDays(duration));
        if (notes != null) record.setNotes(notes);

        BorrowRecord saved = borrowRecordRepository.save(record);

        notificationService.createNotification(
                record.getUser(),
                "Book '" + book.getTitle() + "' has been issued to you! Due date: " + record.getDueDate().toLocalDate() + ".",
                "BOOK_ISSUED"
        );

        return mapToDto(saved);
    }

    @Transactional
    public BorrowRecordDto returnBook(Long borrowId, String notes) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with ID: " + borrowId));

        if (record.getStatus() != BorrowRecord.Status.ISSUED && record.getStatus() != BorrowRecord.Status.OVERDUE) {
            throw new BadRequestException("Cannot return a book with status: " + record.getStatus());
        }

        Book book = record.getBook();
        // Atomically increment available copies
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        LocalDateTime now = LocalDateTime.now();
        record.setStatus(BorrowRecord.Status.RETURNED);
        record.setReturnDate(now);
        if (notes != null) record.setNotes(notes);

        BorrowRecord saved = borrowRecordRepository.save(record);

        // Check and calculate fine if late
        Fine fine = fineService.calculateAndSaveFineForRecord(saved);

        String notifMsg = "You returned '" + book.getTitle() + "'.";
        if (fine != null && fine.getFineAmount() > 0) {
            notifMsg += " Outstanding late fine: ₹" + fine.getFineAmount() + ".";
        }
        notificationService.createNotification(record.getUser(), notifMsg, "BOOK_RETURNED");

        return mapToDto(saved);
    }

    public List<BorrowRecordDto> getUserBorrowHistory(Long userId) {
        return borrowRecordRepository.findByUserIdOrderByRequestDateDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BorrowRecordDto> getCurrentlyBorrowed(Long userId) {
        return borrowRecordRepository.findCurrentlyBorrowedBooksByUserId(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BorrowRecordDto> getAllRecords(BorrowRecord.Status status) {
        List<BorrowRecord> records = (status != null)
                ? borrowRecordRepository.findByStatusOrderByRequestDateDesc(status)
                : borrowRecordRepository.findAll();
        return records.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<BorrowRecordDto> getOverdueRecords() {
        return borrowRecordRepository.findOverdueIssuedRecords(LocalDateTime.now())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public int getLoanDurationDays() {
        return librarySettingRepository.findAll().stream().findFirst()
                .map(LibrarySetting::getLoanDurationDays)
                .orElse(defaultLoanDurationDays);
    }

    public int getMaxBorrowLimit() {
        return librarySettingRepository.findAll().stream().findFirst()
                .map(LibrarySetting::getMaxBorrowLimit)
                .orElse(defaultMaxBorrowLimit);
    }

    public BorrowRecordDto mapToDto(BorrowRecord record) {
        BorrowRecordDto dto = new BorrowRecordDto();
        dto.setId(record.getId());
        dto.setUserId(record.getUser().getId());
        dto.setUserName(record.getUser().getFullName());
        dto.setUserEmail(record.getUser().getEmail());
        dto.setBookId(record.getBook().getId());
        dto.setBookTitle(record.getBook().getTitle());
        dto.setBookAuthor(record.getBook().getAuthor());
        dto.setGenre(record.getBook().getGenre());
        dto.setBookCoverImageUrl(record.getBook().getCoverImageUrl());
        dto.setRequestDate(record.getRequestDate());
        dto.setIssueDate(record.getIssueDate());
        dto.setDueDate(record.getDueDate());
        dto.setReturnDate(record.getReturnDate());
        dto.setStatus(record.getStatus().name());
        dto.setNotes(record.getNotes());

        // Check if overdue
        if (record.getStatus() == BorrowRecord.Status.ISSUED && record.getDueDate() != null && LocalDateTime.now().isAfter(record.getDueDate())) {
            long days = Duration.between(record.getDueDate(), LocalDateTime.now()).toDays();
            dto.setDaysOverdue(Math.max(1, days));
        } else if (record.getReturnDate() != null && record.getDueDate() != null && record.getReturnDate().isAfter(record.getDueDate())) {
            long days = Duration.between(record.getDueDate(), record.getReturnDate()).toDays();
            dto.setDaysOverdue(Math.max(1, days));
        } else {
            dto.setDaysOverdue(0L);
        }

        // Attach Fine if exists
        fineRepository.findByBorrowRecordId(record.getId()).ifPresent(f -> {
            dto.setFineAmount(f.getFineAmount());
            dto.setFineStatus(f.getPaymentStatus().name());
        });

        return dto;
    }
}
