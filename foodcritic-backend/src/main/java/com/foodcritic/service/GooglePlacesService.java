package com.foodcritic.service;

import com.foodcritic.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GooglePlacesService {

    private static final Logger logger = LoggerFactory.getLogger(GooglePlacesService.class);

    @Value("${app.google.places.api-key}")
    private String apiKey;

    @Value("${app.google.places.base-url}")
    private String baseUrl;

    private final WebClient webClient;

    public GooglePlacesService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public GooglePlacesSearchResponse searchRestaurants(GooglePlacesSearchRequest request) {
        try {
            String uri = buildSearchUri(request);
            logger.info("Calling Google Places API: {}", uri);

            GooglePlacesSearchResponse response = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(GooglePlacesSearchResponse.class)
                    .block();

            if (response != null && "OK".equals(response.getStatus())) {
                // Apply server-side filters
                List<GooglePlacesSearchResponse.GooglePlaceResult> filteredResults = 
                    applyFilters(response.getResults(), request);
                response.setResults(filteredResults);
            } else if (response != null) {
                logger.warn("Google Places API returned status: {} with message: {}", 
                    response.getStatus(), response.getErrorMessage());
            }

            return response;
        } catch (WebClientResponseException e) {
            logger.error("Error calling Google Places API: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            GooglePlacesSearchResponse errorResponse = new GooglePlacesSearchResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setErrorMessage("Failed to fetch restaurants: " + e.getMessage());
            return errorResponse;
        } catch (Exception e) {
            logger.error("Unexpected error calling Google Places API", e);
            GooglePlacesSearchResponse errorResponse = new GooglePlacesSearchResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setErrorMessage("Unexpected error occurred");
            return errorResponse;
        }
    }

    public GooglePlaceDetailsResponse getRestaurantDetails(String placeId) {
        try {
            String uri = buildDetailsUri(placeId);
            logger.info("Calling Google Places Details API: {}", uri);

            GooglePlaceDetailsResponse response = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(GooglePlaceDetailsResponse.class)
                    .block();

            if (response != null && !"OK".equals(response.getStatus())) {
                logger.warn("Google Places Details API returned status: {} with message: {}", 
                    response.getStatus(), response.getErrorMessage());
            }

            return response;
        } catch (WebClientResponseException e) {
            logger.error("Error calling Google Places Details API: {} - {}", 
                e.getStatusCode(), e.getResponseBodyAsString());
            GooglePlaceDetailsResponse errorResponse = new GooglePlaceDetailsResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setErrorMessage("Failed to fetch restaurant details: " + e.getMessage());
            return errorResponse;
        } catch (Exception e) {
            logger.error("Unexpected error calling Google Places Details API", e);
            GooglePlaceDetailsResponse errorResponse = new GooglePlaceDetailsResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setErrorMessage("Unexpected error occurred");
            return errorResponse;
        }
    }

    public String getPhotoUrl(String photoReference, int maxWidth) {
        return String.format("%s/photo?photoreference=%s&maxwidth=%d&key=%s",
                baseUrl, photoReference, maxWidth, apiKey);
    }

    public GooglePlacesSuggestionsResponse getSuggestions(GooglePlacesSuggestionsRequest request) {
        try {
            String uri = buildSuggestionsUri(request);
            logger.info("Calling Google Places Autocomplete API: {}", uri);

            GooglePlacesSuggestionsResponse response = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(GooglePlacesSuggestionsResponse.class)
                    .block();

            if (response != null && !"OK".equals(response.getStatus())) {
                logger.warn("Google Places Autocomplete API returned status: {} with message: {}", 
                    response.getStatus(), response.getErrorMessage());
            }

            return response;
        } catch (WebClientResponseException e) {
            logger.error("Error calling Google Places Autocomplete API: {} - {}", 
                e.getStatusCode(), e.getResponseBodyAsString());
            GooglePlacesSuggestionsResponse errorResponse = new GooglePlacesSuggestionsResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setErrorMessage("Failed to fetch suggestions: " + e.getMessage());
            return errorResponse;
        } catch (Exception e) {
            logger.error("Unexpected error calling Google Places Autocomplete API", e);
            GooglePlacesSuggestionsResponse errorResponse = new GooglePlacesSuggestionsResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setErrorMessage("Unexpected error occurred");
            return errorResponse;
        }
    }

    private String buildSearchUri(GooglePlacesSearchRequest request) {
        StringBuilder uri = new StringBuilder(baseUrl);
        
        if (request.getPageToken() != null && !request.getPageToken().trim().isEmpty()) {
            // For pagination, use the page token
            uri.append("/nearbysearch/json?pagetoken=").append(request.getPageToken())
               .append("&key=").append(apiKey);
        } else {
            // Always use text search for better results
            String query = request.getQuery();
            if (query == null || query.trim().isEmpty()) {
                // If no specific query, search for "restaurants" to get more comprehensive results
                query = "restaurants";
            }
            
            uri.append("/textsearch/json?query=").append(query)
               .append("&location=").append(request.getLatitude()).append(",").append(request.getLongitude())
               .append("&radius=").append(request.getRadius())
               .append("&type=").append(request.getType())
               .append("&key=").append(apiKey);
        }
        
        return uri.toString();
    }

    private String buildDetailsUri(String placeId) {
        return String.format("%s/details/json?place_id=%s&fields=place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,price_level,types,geometry,photos,opening_hours,reviews&key=%s",
                baseUrl, placeId, apiKey);
    }

    private String buildSuggestionsUri(GooglePlacesSuggestionsRequest request) {
        StringBuilder uri = new StringBuilder(baseUrl);
        uri.append("/autocomplete/json?input=").append(request.getInput())
           .append("&key=").append(apiKey);
        
        // Add location bias if provided
        if (request.getLatitude() != null && request.getLongitude() != null) {
            uri.append("&location=").append(request.getLatitude()).append(",").append(request.getLongitude());
            
            if (request.getRadius() != null) {
                uri.append("&radius=").append(request.getRadius());
            }
        }
        
        // Add types filter if provided
        if (request.getTypes() != null && !request.getTypes().trim().isEmpty()) {
            uri.append("&types=").append(request.getTypes());
        }
        
        return uri.toString();
    }

    private List<GooglePlacesSearchResponse.GooglePlaceResult> applyFilters(
            List<GooglePlacesSearchResponse.GooglePlaceResult> results, 
            GooglePlacesSearchRequest request) {
        
        if (results == null) {
            return null;
        }
        
        return results.stream()
                .filter(result -> {
                    // Filter by minimum rating
                    if (request.getMinRating() != null) {
                        if (result.getRating() == null || result.getRating() < request.getMinRating()) {
                            return false;
                        }
                    }
                    
                    // Filter by price level range
                    if (result.getPriceLevel() != null) {
                        if (request.getMinPriceLevel() != null && result.getPriceLevel() < request.getMinPriceLevel()) {
                            return false;
                        }
                        if (request.getMaxPriceLevel() != null && result.getPriceLevel() > request.getMaxPriceLevel()) {
                            return false;
                        }
                    }
                    
                    // Filter by cuisine (check if any type contains the cuisine keyword)
                    if (request.getCuisine() != null && !request.getCuisine().trim().isEmpty()) {
                        String cuisineKeyword = request.getCuisine().toLowerCase();
                        boolean matchesCuisine = result.getTypes() != null && 
                            result.getTypes().stream()
                                .anyMatch(type -> type.toLowerCase().contains(cuisineKeyword));
                        
                        // Also check name for cuisine match
                        if (!matchesCuisine && result.getName() != null) {
                            matchesCuisine = result.getName().toLowerCase().contains(cuisineKeyword);
                        }
                        
                        if (!matchesCuisine) {
                            return false;
                        }
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());
    }
}