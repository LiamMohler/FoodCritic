package com.foodcritic.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class GooglePlacesSearchRequest {
    
    @NotNull
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;
    
    @NotNull
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;
    
    private String query;
    
    @Min(value = 1, message = "Radius must be at least 1 meter")
    @Max(value = 50000, message = "Radius must be at most 50000 meters")
    private Integer radius = 5000;
    
    private String type = "restaurant";
    
    @DecimalMin(value = "0.0", message = "Minimum rating must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Minimum rating must be between 0 and 5")
    private Double minRating;
    
    @Min(value = 0, message = "Price level must be between 0 and 4")
    @Max(value = 4, message = "Price level must be between 0 and 4")
    private Integer maxPriceLevel;
    
    @Min(value = 0, message = "Price level must be between 0 and 4")
    @Max(value = 4, message = "Price level must be between 0 and 4")
    private Integer minPriceLevel;
    
    private String cuisine;
    private String pageToken;
    
    public GooglePlacesSearchRequest() {}
    
    public GooglePlacesSearchRequest(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    
    // Getters and Setters
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    
    public Integer getRadius() { return radius; }
    public void setRadius(Integer radius) { this.radius = radius; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Double getMinRating() { return minRating; }
    public void setMinRating(Double minRating) { this.minRating = minRating; }
    
    public Integer getMaxPriceLevel() { return maxPriceLevel; }
    public void setMaxPriceLevel(Integer maxPriceLevel) { this.maxPriceLevel = maxPriceLevel; }
    
    public Integer getMinPriceLevel() { return minPriceLevel; }
    public void setMinPriceLevel(Integer minPriceLevel) { this.minPriceLevel = minPriceLevel; }
    
    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }
    
    public String getPageToken() { return pageToken; }
    public void setPageToken(String pageToken) { this.pageToken = pageToken; }
}