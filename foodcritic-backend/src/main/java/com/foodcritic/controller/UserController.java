package com.foodcritic.controller;

import com.foodcritic.model.Review;
import com.foodcritic.model.User;
import com.foodcritic.service.ReviewService;
import com.foodcritic.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<Review>> getUserReviews(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Review> reviews = reviewService.getReviewsByUser(user.getId());
        return ResponseEntity.ok(reviews);
    }
    
    @PutMapping("/profile/photo")
    public ResponseEntity<User> updateProfilePhoto(Authentication authentication, @RequestBody Map<String, String> request) {
        User user = (User) authentication.getPrincipal();
        String photoUrl = request.get("photoUrl");
        
        User updatedUser = userService.updateProfilePhoto(user.getId(), photoUrl);
        return ResponseEntity.ok(updatedUser);
    }
}