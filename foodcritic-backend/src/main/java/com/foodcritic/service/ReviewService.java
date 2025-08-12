package com.foodcritic.service;

import com.foodcritic.model.Restaurant;
import com.foodcritic.model.Review;
import com.foodcritic.model.User;
import com.foodcritic.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private RestaurantService restaurantService;
    
    @Autowired
    private UserService userService;
    
    public List<Review> getReviewsByRestaurant(String restaurantId) {
        return reviewRepository.findByRestaurant_IdOrderByCreatedAtDesc(restaurantId);
    }
    
    public List<Review> getReviewsByUser(Long userId) {
        return reviewRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }
    
    public Optional<Review> getUserReviewForRestaurant(Long userId, String restaurantId) {
        return reviewRepository.findByUser_IdAndRestaurant_Id(userId, restaurantId);
    }
    
    public Review createReview(Long userId, String restaurantId, Integer rating, String comment, String imageUrl) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get or create restaurant for Google Places ID
        Restaurant restaurant = restaurantService.getOrCreateGooglePlacesRestaurant(restaurantId);
        
        if (reviewRepository.existsByUser_IdAndRestaurant_Id(userId, restaurantId)) {
            throw new RuntimeException("User has already reviewed this restaurant");
        }
        
        Review review = new Review();
        review.setUser(user);
        review.setRestaurant(restaurant);
        review.setRating(rating);
        review.setComment(comment);
        review.setImageUrl(imageUrl);
        
        return reviewRepository.save(review);
    }
    
    public Review updateReview(Long reviewId, Long userId, Integer rating, String comment, String imageUrl) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("User can only update their own reviews");
        }
        
        review.setRating(rating);
        review.setComment(comment);
        if (imageUrl != null) {
            review.setImageUrl(imageUrl);
        }
        
        return reviewRepository.save(review);
    }
    
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("User can only delete their own reviews");
        }
        
        reviewRepository.delete(review);
    }
    
    public List<Review> getRecentReviews(int limit) {
        return reviewRepository.findRecentReviews(limit);
    }
}