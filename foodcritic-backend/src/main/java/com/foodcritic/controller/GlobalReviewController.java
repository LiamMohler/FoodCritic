package com.foodcritic.controller;

import com.foodcritic.model.Review;
import com.foodcritic.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin
public class GlobalReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/recent")
    public ResponseEntity<List<Review>> getRecentReviews(
            @RequestParam(defaultValue = "50") int limit) {
        
        // Return real recent reviews from the database
        List<Review> recentReviews = reviewService.getRecentReviews(limit);
        return ResponseEntity.ok(recentReviews);
    }
}