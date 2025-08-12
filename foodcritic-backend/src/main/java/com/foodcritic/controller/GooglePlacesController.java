package com.foodcritic.controller;

import com.foodcritic.dto.GooglePlaceDetailsResponse;
import com.foodcritic.dto.GooglePlacesSearchRequest;
import com.foodcritic.dto.GooglePlacesSearchResponse;
import com.foodcritic.dto.GooglePlacesSuggestionsRequest;
import com.foodcritic.dto.GooglePlacesSuggestionsResponse;
import com.foodcritic.service.GooglePlacesService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/google-places")
@CrossOrigin(origins = "*")
public class GooglePlacesController {

    private static final Logger logger = LoggerFactory.getLogger(GooglePlacesController.class);

    @Autowired
    private GooglePlacesService googlePlacesService;

    @PostMapping("/search")
    public ResponseEntity<GooglePlacesSearchResponse> searchRestaurants(
            @Valid @RequestBody GooglePlacesSearchRequest request) {
        
        logger.info("Searching restaurants with request: lat={}, lng={}, query={}, radius={}", 
                request.getLatitude(), request.getLongitude(), request.getQuery(), request.getRadius());
        
        try {
            GooglePlacesSearchResponse response = googlePlacesService.searchRestaurants(request);
            
            if ("ERROR".equals(response.getStatus())) {
                return ResponseEntity.badRequest().body(response);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error searching restaurants", e);
            GooglePlacesSearchResponse errorResponse = new GooglePlacesSearchResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setErrorMessage("Internal server error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/details/{placeId}")
    public ResponseEntity<GooglePlaceDetailsResponse> getRestaurantDetails(
            @PathVariable String placeId) {
        
        logger.info("Getting restaurant details for place_id: {}", placeId);
        
        try {
            GooglePlaceDetailsResponse response = googlePlacesService.getRestaurantDetails(placeId);
            
            if ("ERROR".equals(response.getStatus())) {
                return ResponseEntity.badRequest().body(response);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting restaurant details for place_id: {}", placeId, e);
            GooglePlaceDetailsResponse errorResponse = new GooglePlaceDetailsResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setErrorMessage("Internal server error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/photo")
    public ResponseEntity<?> getPhoto(
            @RequestParam String photoReference,
            @RequestParam(defaultValue = "400") int maxWidth) {
        
        try {
            // Validate photo reference
            if (photoReference == null || photoReference.trim().isEmpty()) {
                logger.warn("Invalid photo reference provided: {}", photoReference);
                return ResponseEntity.badRequest().body("Invalid photo reference");
            }
            
            String photoUrl = googlePlacesService.getPhotoUrl(photoReference, maxWidth);
            // Redirect to the actual Google photo URL
            return ResponseEntity.status(302)
                    .header("Location", photoUrl)
                    .build();
        } catch (Exception e) {
            logger.error("Error generating photo URL for reference: {}", photoReference, e);
            return ResponseEntity.internalServerError().body("Error generating photo URL");
        }
    }

    @PostMapping("/suggestions")
    public ResponseEntity<GooglePlacesSuggestionsResponse> getSuggestions(
            @Valid @RequestBody GooglePlacesSuggestionsRequest request) {
        
        logger.info("Getting place suggestions for input: '{}', location: lat={}, lng={}", 
                request.getInput(), request.getLatitude(), request.getLongitude());
        
        try {
            GooglePlacesSuggestionsResponse response = googlePlacesService.getSuggestions(request);
            
            if ("ERROR".equals(response.getStatus())) {
                return ResponseEntity.badRequest().body(response);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting place suggestions", e);
            GooglePlacesSuggestionsResponse errorResponse = new GooglePlacesSuggestionsResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setErrorMessage("Internal server error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}