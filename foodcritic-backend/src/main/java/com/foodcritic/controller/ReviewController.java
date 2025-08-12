package com.foodcritic.controller;

import com.foodcritic.model.Review;
import com.foodcritic.model.User;
import com.foodcritic.service.ReviewService;
import com.foodcritic.dto.ReviewRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/reviews")
@CrossOrigin
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<Review>> getReviewsByRestaurant(@PathVariable String restaurantId) {
        List<Review> reviews = reviewService.getReviewsByRestaurant(restaurantId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    public ResponseEntity<?> createReview(
            @PathVariable String restaurantId,
            @RequestBody ReviewRequest reviewRequest,
            Authentication authentication) {
        
        try {
            User user = (User) authentication.getPrincipal();
            
            Review review = reviewService.createReview(
                user.getId(),
                restaurantId,
                reviewRequest.getRating(),
                reviewRequest.getComment(),
                null  // No image support for now
            );
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-review")
    public ResponseEntity<Review> getUserReviewForRestaurant(
            @PathVariable String restaurantId,
            Authentication authentication) {
        
        // Handle case where user is not authenticated
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.notFound().build();
        }
        
        User user = (User) authentication.getPrincipal();
        Optional<Review> review = reviewService.getUserReviewForRestaurant(user.getId(), restaurantId);
        
        return review.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable String restaurantId,
            @PathVariable Long reviewId,
            @RequestBody ReviewRequest reviewRequest,
            Authentication authentication) {
        
        try {
            User user = (User) authentication.getPrincipal();
            
            Review review = reviewService.updateReview(
                reviewId,
                user.getId(),
                reviewRequest.getRating(),
                reviewRequest.getComment(),
                null  // No image support for now
            );
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable String restaurantId,
            @PathVariable Long reviewId,
            Authentication authentication) {
        
        try {
            User user = (User) authentication.getPrincipal();
            reviewService.deleteReview(reviewId, user.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}