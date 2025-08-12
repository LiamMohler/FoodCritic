package com.foodcritic.service;

import com.foodcritic.model.Restaurant;
import com.foodcritic.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.util.Comparator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class RestaurantService {
    
    private static final Logger logger = LoggerFactory.getLogger(RestaurantService.class);
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired 
    private GooglePlacesService googlePlacesService;
    
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }
    
    public Restaurant getOrCreateGooglePlacesRestaurant(String placeId) {
        // Check if restaurant already exists
        Optional<Restaurant> existing = restaurantRepository.findById(placeId);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        // Create new restaurant from Google Places data
        try {
            var placeDetails = googlePlacesService.getRestaurantDetails(placeId);
            if (placeDetails != null && placeDetails.getResult() != null) {
                var result = placeDetails.getResult();
                
                Restaurant restaurant = new Restaurant();
                restaurant.setId(placeId);
                restaurant.setName(result.getName());
                restaurant.setCuisine(extractCuisineFromTypes(result.getTypes()));
                restaurant.setAddress(result.getFormattedAddress());
                restaurant.setPhoneNumber(result.getFormattedPhoneNumber());
                restaurant.setWebsite(result.getWebsite());
                restaurant.setPriceLevel(result.getPriceLevel());
                
                if (result.getGeometry() != null && result.getGeometry().getLocation() != null) {
                    restaurant.setLatitude(result.getGeometry().getLocation().getLat());
                    restaurant.setLongitude(result.getGeometry().getLocation().getLng());
                }
                
                if (result.getOpeningHours() != null) {
                    restaurant.setOpenNow(result.getOpeningHours().getOpenNow());
                }
                
                return restaurantRepository.save(restaurant);
            }
        } catch (Exception e) {
            logger.error("Failed to fetch Google Places details for place_id: " + placeId, e);
        }
        
        // Fallback: create minimal restaurant with just the place_id
        Restaurant restaurant = new Restaurant();
        restaurant.setId(placeId);
        restaurant.setName("Restaurant"); // Default name
        restaurant.setCuisine("Restaurant"); // Default cuisine
        return restaurantRepository.save(restaurant);
    }
    
    private String extractCuisineFromTypes(java.util.List<String> types) {
        if (types == null || types.isEmpty()) {
            return "Restaurant";
        }
        
        // Look for food-related types
        for (String type : types) {
            switch (type.toLowerCase()) {
                case "restaurant": return "Restaurant";
                case "food": return "Food";
                case "cafe": return "Cafe";
                case "bakery": return "Bakery";
                case "bar": return "Bar";
                case "meal_takeaway": return "Takeaway";
                case "meal_delivery": return "Delivery";
                default: continue;
            }
        }
        
        return "Restaurant"; // Default fallback
    }
    
    public List<Restaurant> getRestaurantsOrderedByRating() {
        return restaurantRepository.findAllOrderByAverageRatingDesc();
    }
    
    public Optional<Restaurant> getRestaurantById(String id) {
        return restaurantRepository.findById(id);
    }
    
    public List<Restaurant> searchByCuisine(String cuisine) {
        return restaurantRepository.findByCuisineContainingIgnoreCase(cuisine);
    }
    
    public List<Restaurant> searchByName(String name) {
        return restaurantRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
    
    public Restaurant updateRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
    
    public void deleteRestaurant(String id) {
        restaurantRepository.deleteById(id);
    }
    
    public List<Restaurant> searchByLocation(Double latitude, Double longitude, Double radius) {
        // Convert radius from kilometers to degrees (approximate)
        double radiusInDegrees = radius / 111.0;
        
        // Calculate bounding box for the search area
        double minLat = latitude - radiusInDegrees;
        double maxLat = latitude + radiusInDegrees;
        double minLng = longitude - (radiusInDegrees / Math.cos(Math.toRadians(latitude)));
        double maxLng = longitude + (radiusInDegrees / Math.cos(Math.toRadians(latitude)));
        
        // Get all restaurants in the bounding box
        List<Restaurant> restaurantsInBox = restaurantRepository.findByLatitudeBetweenAndLongitudeBetween(
            minLat, maxLat, minLng, maxLng);
        
        // Calculate distance for each restaurant and filter by radius
        return restaurantsInBox.stream()
            .filter(restaurant -> {
                double distance = calculateDistance(
                    latitude, longitude, 
                    restaurant.getLatitude(), restaurant.getLongitude());
                return distance <= radius;
            })
            .toList();
    }
    
    // Haversine formula to calculate distance between two points in kilometers
    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371; // Radius of the earth in kilometers
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
                
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in kilometers
    }
    
    // San Diego specific methods
    public List<Restaurant> getAllSanDiegoRestaurants() {
        logger.info("Fetching all restaurants in San Diego");
        return restaurantRepository.findAllInSanDiego();
    }
    
    public List<Restaurant> searchSanDiegoRestaurants(
            String name, String cuisine, String location, Integer priceLevel, 
            Boolean openNow, Double minRating, String sortBy) {
        
        logger.info("Searching San Diego restaurants with filters - name: {}, cuisine: {}, location: {}, priceLevel: {}, openNow: {}, minRating: {}, sortBy: {}", 
                name, cuisine, location, priceLevel, openNow, minRating, sortBy);
        
        // TODO: Fix the filtered query - for now use simple search to avoid DB errors
        // List<Restaurant> restaurants = restaurantRepository.findInSanDiegoWithFilters(
        //     name, cuisine, location, priceLevel, openNow, minRating);
        
        // Use simple query to avoid database type conflicts
        List<Restaurant> restaurants = restaurantRepository.findAllInSanDiego();
        
        // Apply client-side filtering until DB issue is fixed
        if (name != null && !name.trim().isEmpty()) {
            final String searchName = name.toLowerCase();
            restaurants = restaurants.stream()
                .filter(r -> r.getName() != null && r.getName().toLowerCase().contains(searchName))
                .toList();
        }
        
        if (cuisine != null && !cuisine.trim().isEmpty()) {
            final String searchCuisine = cuisine.toLowerCase();
            restaurants = restaurants.stream()
                .filter(r -> r.getCuisine() != null && r.getCuisine().toLowerCase().contains(searchCuisine))
                .toList();
        }
        
        // Apply sorting
        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "rating":
                    restaurants = restaurants.stream()
                        .sorted(Comparator.comparing(r -> r.getAverageRating() != null ? r.getAverageRating() : 0.0, Comparator.reverseOrder()))
                        .toList();
                    break;
                case "name":
                    restaurants = restaurants.stream()
                        .sorted(Comparator.comparing(Restaurant::getName))
                        .toList();
                    break;
                case "distance":
                    // Distance sorting would require user location - handled separately
                    break;
            }
        }
        
        logger.info("Found {} restaurants in San Diego matching criteria", restaurants.size());
        return restaurants;
    }
    
    // Simple paginated San Diego restaurants (safe method)
    public Page<Restaurant> getSanDiegoRestaurantsPaginated(Pageable pageable) {
        logger.info("Fetching San Diego restaurants page {} with size {}", 
                    pageable.getPageNumber(), pageable.getPageSize());
        return restaurantRepository.findAllInSanDiegoPaginated(pageable);
    }
    
    public List<Restaurant> searchByNeighborhood(String neighborhood) {
        logger.info("Searching restaurants in San Diego neighborhood: {}", neighborhood);
        return restaurantRepository.findByNeighborhoodInSanDiego(neighborhood);
    }
    
    public List<Restaurant> searchNearby(Double latitude, Double longitude, Double radiusKm) {
        logger.info("Searching restaurants near coordinates ({}, {}) within {} km", latitude, longitude, radiusKm);
        
        // Constrain search to San Diego bounds even with user coordinates
        if (latitude != null && longitude != null) {
            // Check if coordinates are within San Diego area
            if (latitude >= 32.534156 && latitude <= 33.114249 && 
                longitude >= -117.608643 && longitude <= -116.908707) {
                return restaurantRepository.findNearbyInSanDiego(latitude, longitude, radiusKm);
            } else {
                logger.warn("Coordinates ({}, {}) are outside San Diego area, returning all San Diego restaurants", latitude, longitude);
                return getAllSanDiegoRestaurants();
            }
        }
        
        return getAllSanDiegoRestaurants();
    }
    
    public List<String> getSanDiegoCuisines() {
        logger.info("Fetching distinct cuisines in San Diego");
        return restaurantRepository.findDistinctCuisinesInSanDiego();
    }
    
    public List<String> getSanDiegoNeighborhoods() {
        logger.info("Fetching distinct neighborhoods in San Diego");
        return restaurantRepository.findDistinctNeighborhoodsInSanDiego();
    }
    
    public List<Map<String, Object>> getSanDiegoRestaurantAutocomplete(String input, int limit) {
        if (input == null || input.trim().isEmpty() || input.length() < 1) {
            return List.of();
        }
        
        logger.info("Getting San Diego restaurant autocomplete for input: {}", input);
        
        String searchTerm = input.toLowerCase().trim();
        List<Restaurant> sdRestaurants = getAllSanDiegoRestaurants();
        Set<Map<String, Object>> suggestions = new HashSet<>();
        
        // Search by restaurant names in San Diego
        sdRestaurants.stream()
            .filter(restaurant -> restaurant.getName() != null && 
                    restaurant.getName().toLowerCase().contains(searchTerm))
            .limit(Math.max(1, limit / 2)) // Reserve half for restaurant names
            .forEach(restaurant -> {
                Map<String, Object> suggestion = new HashMap<>();
                suggestion.put("id", restaurant.getId());
                suggestion.put("type", "restaurant");
                suggestion.put("title", restaurant.getName());
                suggestion.put("subtitle", restaurant.getCuisine() + " • " + getNeighborhoodFromAddress(restaurant.getAddress()));
                suggestion.put("restaurant", restaurant);
                suggestions.add(suggestion);
            });
        
        // Search by cuisines in San Diego
        getSanDiegoCuisines().stream()
            .filter(cuisine -> cuisine.toLowerCase().contains(searchTerm))
            .limit(Math.max(1, limit / 4)) // Reserve quarter for cuisines
            .forEach(cuisine -> {
                Map<String, Object> suggestion = new HashMap<>();
                suggestion.put("id", "cuisine-" + cuisine.toLowerCase().replace(" ", "-"));
                suggestion.put("type", "cuisine");
                suggestion.put("title", cuisine);
                suggestion.put("subtitle", "Cuisine type");
                suggestions.add(suggestion);
            });
        
        // Search by neighborhoods in San Diego
        getSanDiegoNeighborhoods().stream()
            .filter(neighborhood -> neighborhood.toLowerCase().contains(searchTerm))
            .limit(Math.max(1, limit / 4)) // Reserve quarter for neighborhoods
            .forEach(neighborhood -> {
                Map<String, Object> suggestion = new HashMap<>();
                suggestion.put("id", "neighborhood-" + neighborhood.toLowerCase().replace(" ", "-"));
                suggestion.put("type", "neighborhood");
                suggestion.put("title", neighborhood);
                suggestion.put("subtitle", "San Diego area");
                suggestions.add(suggestion);
            });
        
        logger.info("Generated {} autocomplete suggestions for input: {}", suggestions.size(), input);
        
        return suggestions.stream()
                .limit(limit)
                .toList();
    }
    
    private String getNeighborhoodFromAddress(String address) {
        if (address == null) return "San Diego";
        
        String lowerAddress = address.toLowerCase();
        if (lowerAddress.contains("downtown")) return "Downtown";
        if (lowerAddress.contains("la jolla")) return "La Jolla";
        if (lowerAddress.contains("gaslamp")) return "Gaslamp";
        if (lowerAddress.contains("mission beach")) return "Mission Beach";
        if (lowerAddress.contains("pacific beach")) return "Pacific Beach";
        if (lowerAddress.contains("hillcrest")) return "Hillcrest";
        if (lowerAddress.contains("north park")) return "North Park";
        if (lowerAddress.contains("south park")) return "South Park";
        if (lowerAddress.contains("mission valley")) return "Mission Valley";
        if (lowerAddress.contains("little italy")) return "Little Italy";
        if (lowerAddress.contains("coronado")) return "Coronado";
        if (lowerAddress.contains("del mar")) return "Del Mar";
        if (lowerAddress.contains("encinitas")) return "Encinitas";
        if (lowerAddress.contains("carlsbad")) return "Carlsbad";
        return "San Diego";
    }
    
    public List<Map<String, Object>> getRestaurantAutocomplete(String input, int limit) {
        // Redirect to San Diego specific search
        return getSanDiegoRestaurantAutocomplete(input, limit);
    }
}