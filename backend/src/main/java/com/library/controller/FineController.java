package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.dto.FineDto;
import com.library.entity.Fine;
import com.library.security.SecurityUtil;
import com.library.service.FineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    private final FineService fineService;
    private final SecurityUtil securityUtil;

    public FineController(FineService fineService, SecurityUtil securityUtil) {
        this.fineService = fineService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/my-fines")
    public ResponseEntity<ApiResponse<List<FineDto>>> getMyFines() {
        Long userId = securityUtil.getCurrentUserId();
        List<FineDto> fines = fineService.getFinesByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(fines));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<FineDto>>> getAllFines(
            @RequestParam(required = false) Fine.PaymentStatus status) {
        List<FineDto> fines = fineService.getAllFines(status);
        return ResponseEntity.ok(ApiResponse.success(fines));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<FineDto>> payFine(@PathVariable Long id) {
        FineDto paid = fineService.payFine(id);
        return ResponseEntity.ok(ApiResponse.success("Fine payment recorded successfully", paid));
    }
}
