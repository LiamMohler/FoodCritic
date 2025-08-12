package com.foodcritic.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "restaurants")
public class Restaurant {
    
    @Id
    @Column(length = 255)
    private String id;
    
    @NotBlank
    @Size(min = 2, max = 100)
    private String name;
    
    @NotBlank
    @Size(max = 50)
    private String cuisine;
    
    @Size(max = 200)
    private String location;
    
    @Column(name = "address", length = 500)
    @Size(max = 500)
    private String address;
    
    @Column(name = "phone_number", length = 20)
    @Size(max = 20)
    private String phoneNumber;
    
    @Column(name = "website", length = 500)
    @Size(max = 500)
    private String website;
    
    @Column(name = "user_ratings_total")
    private Integer userRatingsTotal;
    
    @Column(name = "price_level")
    private Integer priceLevel;
    
    @Column(name = "image_url", length = 1000)
    @Size(max = 1000)
    private String imageUrl;
    
    @Column(name = "latitude")
    private Double latitude;
    
    @Column(name = "longitude")
    private Double longitude;
    
    @Column(name = "open_now")
    private Boolean openNow;
    
    @Column(name = "opening_hours", length = 2000)
    private String openingHoursJson;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Review> reviews;
    
    public Restaurant() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Restaurant(String name, String cuisine, String location) {
        this();
        this.name = name;
        this.cuisine = cuisine;
        this.location = location;
    }
    
    public Double getAverageRating() {
        if (reviews == null || reviews.isEmpty()) {
            return 0.0;
        }
        return reviews.stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);
    }
    
    public Integer getReviewCount() {
        return reviews != null ? reviews.size() : 0;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getCuisine() {
        return cuisine;
    }
    
    public void setCuisine(String cuisine) {
        this.cuisine = cuisine;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<Review> getReviews() {
        return reviews;
    }
    
    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
    
    public Integer getUserRatingsTotal() {
        return userRatingsTotal;
    }
    
    public void setUserRatingsTotal(Integer userRatingsTotal) {
        this.userRatingsTotal = userRatingsTotal;
    }
    
    public Integer getPriceLevel() {
        return priceLevel;
    }
    
    public void setPriceLevel(Integer priceLevel) {
        this.priceLevel = priceLevel;
    }
    
    public Boolean getOpenNow() {
        return openNow;
    }
    
    public void setOpenNow(Boolean openNow) {
        this.openNow = openNow;
    }
    
    public String getOpeningHoursJson() {
        return openingHoursJson;
    }
    
    public void setOpeningHoursJson(String openingHoursJson) {
        this.openingHoursJson = openingHoursJson;
    }
}