package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.dto.BookDto;
import com.library.security.SecurityUtil;
import com.library.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;
    private final SecurityUtil securityUtil;

    public WishlistController(WishlistService wishlistService, SecurityUtil securityUtil) {
        this.wishlistService = wishlistService;
        this.securityUtil = securityUtil;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookDto>>> getUserWishlist() {
        Long userId = securityUtil.getCurrentUserId();
        List<BookDto> wishlist = wishlistService.getUserWishlist(userId);
        return ResponseEntity.ok(ApiResponse.success(wishlist));
    }

    @PostMapping("/{bookId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(@PathVariable Long bookId) {
        Long userId = securityUtil.getCurrentUserId();
        wishlistService.addToWishlist(userId, bookId);
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist", null));
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(@PathVariable Long bookId) {
        Long userId = securityUtil.getCurrentUserId();
        wishlistService.removeFromWishlist(userId, bookId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }
}
