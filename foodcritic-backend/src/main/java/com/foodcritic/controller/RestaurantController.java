package com.foodcritic.controller;

import com.foodcritic.model.Restaurant;
import com.foodcritic.model.Review;
import com.foodcritic.model.User;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Arrays;
import java.util.ArrayList;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin
public class RestaurantController {
    
    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        // Return 5 fake restaurants for now
        List<Restaurant> fakeRestaurants = Arrays.asList(
            createFakeRestaurant("The Garden Bistro", "American", "Downtown", 4.2, 127),
            createFakeRestaurant("Ocean View Seafood", "Seafood", "Harbor District", 4.6, 89),
            createFakeRestaurant("Modern Kitchen", "Contemporary", "Arts Quarter", 4.4, 156),
            createFakeRestaurant("Taco House", "Mexican", "Market Street", 4.3, 203),
            createFakeRestaurant("Prime Cut Steakhouse", "Steakhouse", "Business District", 4.5, 98)
        );
        
        return ResponseEntity.ok(fakeRestaurants);
    }
    
    private Restaurant createFakeRestaurant(String name, String cuisine, String location, double rating, int reviewCount) {
        Restaurant restaurant = new Restaurant();
        restaurant.setId(UUID.randomUUID().toString());
        restaurant.setName(name);
        restaurant.setCuisine(cuisine);
        restaurant.setAddress(location);
        restaurant.setPriceLevel(2); // Default to moderate pricing
        
        // Create fake reviews to generate the rating
        List<Review> fakeReviews = new ArrayList<>();
        User fakeUser = new User();
        fakeUser.setId(1L);
        fakeUser.setUsername("foodlover");
        
        for (int i = 0; i < reviewCount; i++) {
            Review review = new Review();
            review.setId((long) i);
            review.setUser(fakeUser);
            review.setRestaurant(restaurant);
            review.setRating((int) Math.round(rating)); // Convert to integer rating
            review.setComment("Great food!");
            review.setCreatedAt(LocalDateTime.now().minusDays(i));
            fakeReviews.add(review);
        }
        
        restaurant.setReviews(fakeReviews);
        return restaurant;
    }
}