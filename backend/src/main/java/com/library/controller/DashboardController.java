package com.library.controller;

import com.library.dto.AdminDashboardDto;
import com.library.dto.ApiResponse;
import com.library.dto.LibrarianDashboardDto;
import com.library.dto.StudentDashboardDto;
import com.library.security.SecurityUtil;
import com.library.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityUtil securityUtil;

    public DashboardController(DashboardService dashboardService, SecurityUtil securityUtil) {
        this.dashboardService = dashboardService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/student")
    public ResponseEntity<ApiResponse<StudentDashboardDto>> getStudentDashboard() {
        Long userId = securityUtil.getCurrentUserId();
        StudentDashboardDto dto = dashboardService.getStudentDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/librarian")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<LibrarianDashboardDto>> getLibrarianDashboard() {
        LibrarianDashboardDto dto = dashboardService.getLibrarianDashboard();
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getAdminDashboard() {
        AdminDashboardDto dto = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
