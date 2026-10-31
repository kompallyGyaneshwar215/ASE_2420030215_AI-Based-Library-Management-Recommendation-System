package com.library;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.dto.BorrowRequestDto;
import com.library.dto.LoginRequest;
import com.library.dto.RegisterRequest;
import com.library.entity.Book;
import com.library.entity.BorrowRecord;
import com.library.entity.User;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.UserRepository;
import com.library.service.BorrowService;
import com.library.service.FineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
public class AiLibraryBackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private BorrowService borrowService;

    @Autowired
    private FineService fineService;

    @Test
    @DisplayName("Context Loads & Database Seed Verification")
    void contextLoads() {
        assertTrue(userRepository.count() > 0, "Users should be seeded");
        assertTrue(bookRepository.count() > 0, "Books should be seeded");
    }

    @Test
    @DisplayName("Test Student Login Success")
    void testStudentLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest("student@library.com", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.role").value("STUDENT"));
    }

    @Test
    @DisplayName("Test Invalid Login Credentials Rejection")
    void testInvalidLoginRejection() throws Exception {
        LoginRequest loginRequest = new LoginRequest("student@library.com", "wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Test New Student Registration with Preferences")
    void testStudentRegistration() throws Exception {
        String uniqueEmail = "testuser" + System.currentTimeMillis() + "@library.com";
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFullName("Test Student");
        registerRequest.setEmail(uniqueEmail);
        registerRequest.setPassword("password123");
        registerRequest.setPhone("+91 9999999999");
        registerRequest.setPreferredGenres("Artificial Intelligence, Machine Learning");
        registerRequest.setFavoriteAuthors("Stuart Russell");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(uniqueEmail))
                .andExpect(jsonPath("$.data.token").isNotEmpty());

        assertTrue(userRepository.existsByEmail(uniqueEmail));
    }

    @Test
    @DisplayName("Test Public Access to Book Catalog & Search")
    void testPublicBookCatalogAccess() throws Exception {
        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());

        mockMvc.perform(get("/api/books/search?query=Intelligence"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Test Borrow Lifecycle: Issue, Return and Inventory Stock Updates")
    void testBorrowLifecycleAndInventory() {
        User student = userRepository.findByEmail("student@library.com").orElseThrow();
        Book book = bookRepository.findAll().stream()
                .filter(b -> b.getAvailableCopies() > 0)
                .findFirst()
                .orElseThrow();

        int initialStock = book.getAvailableCopies();

        // 1. Submit Request
        BorrowRequestDto requestDto = new BorrowRequestDto(book.getId(), "Test borrowing");
        var recordDto = borrowService.requestBorrow(student.getId(), requestDto);
        assertNotNull(recordDto.getId());
        assertEquals("REQUESTED", recordDto.getStatus());

        // 2. Approve Request
        var approvedDto = borrowService.approveRequest(recordDto.getId(), "Approved by test");
        assertEquals("APPROVED", approvedDto.getStatus());

        // 3. Issue Book -> Stock decremented
        var issuedDto = borrowService.issueBook(approvedDto.getId(), "Issued at desk");
        assertEquals("ISSUED", issuedDto.getStatus());

        Book updatedBook = bookRepository.findById(book.getId()).orElseThrow();
        assertEquals(initialStock - 1, updatedBook.getAvailableCopies(), "Available copies must decrement by 1 on issuance");

        // 4. Return Book -> Stock incremented
        var returnedDto = borrowService.returnBook(issuedDto.getId(), "Returned at desk");
        assertEquals("RETURNED", returnedDto.getStatus());

        Book finalBook = bookRepository.findById(book.getId()).orElseThrow();
        assertEquals(initialStock, finalBook.getAvailableCopies(), "Available copies must increment back on return");
    }

    @Test
    @DisplayName("Test Overdue Fine Calculation Formula")
    void testOverdueFineCalculation() {
        BorrowRecord testRecord = new BorrowRecord();
        testRecord.setUser(userRepository.findByEmail("student@library.com").orElseThrow());
        testRecord.setBook(bookRepository.findAll().get(0));
        testRecord.setStatus(BorrowRecord.Status.ISSUED);
        testRecord.setRequestDate(LocalDateTime.now().minusDays(20));
        testRecord.setIssueDate(LocalDateTime.now().minusDays(18));
        testRecord.setDueDate(LocalDateTime.now().minusDays(4)); // 4 days overdue
        testRecord.setReturnDate(LocalDateTime.now());
        borrowRecordRepository.save(testRecord);

        var fine = fineService.calculateAndSaveFineForRecord(testRecord);
        assertNotNull(fine, "Fine must be generated for late return");
        assertEquals(20.0, fine.getFineAmount(), 0.01, "4 days * 5.0/day should equal 20.0");
        assertEquals("PENDING", fine.getPaymentStatus().name());
    }
}
