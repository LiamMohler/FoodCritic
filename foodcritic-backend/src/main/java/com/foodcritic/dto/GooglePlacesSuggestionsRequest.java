package com.foodcritic.dto;

import jakarta.validation.constraints.NotBlank;

public class GooglePlacesSuggestionsRequest {
    
    @NotBlank(message = "Input is required")
    private String input;
    
    private Double latitude;
    private Double longitude;
    private Integer radius;
    private String types;
    
    // Default constructor
    public GooglePlacesSuggestionsRequest() {}
    
    // Constructor with all fields
    public GooglePlacesSuggestionsRequest(String input, Double latitude, Double longitude, Integer radius, String types) {
        this.input = input;
        this.latitude = latitude;
        this.longitude = longitude;
        this.radius = radius;
        this.types = types;
    }
    
    // Getters and Setters
    public String getInput() {
        return input;
    }
    
    public void setInput(String input) {
        this.input = input;
    }
    
    public Double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }
    
    public Double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    
    public Integer getRadius() {
        return radius;
    }
    
    public void setRadius(Integer radius) {
        this.radius = radius;
    }
    
    public String getTypes() {
        return types;
    }
    
    public void setTypes(String types) {
        this.types = types;
    }
    
    @Override
    public String toString() {
        return "GooglePlacesSuggestionsRequest{" +
                "input='" + input + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", radius=" + radius +
                ", types='" + types + '\'' +
                '}';
    }
}