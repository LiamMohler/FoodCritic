package com.foodcritic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class GooglePlacesSearchResponse {
    
    @JsonProperty("results")
    private List<GooglePlaceResult> results;
    
    @JsonProperty("next_page_token")
    private String nextPageToken;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("error_message")
    private String errorMessage;
    
    public GooglePlacesSearchResponse() {}
    
    public List<GooglePlaceResult> getResults() { return results; }
    public void setResults(List<GooglePlaceResult> results) { this.results = results; }
    
    public String getNextPageToken() { return nextPageToken; }
    public void setNextPageToken(String nextPageToken) { this.nextPageToken = nextPageToken; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    
    public static class GooglePlaceResult {
        @JsonProperty("place_id")
        private String placeId;
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("types")
        private List<String> types;
        
        @JsonProperty("rating")
        private Double rating;
        
        @JsonProperty("user_ratings_total")
        private Integer userRatingsTotal;
        
        @JsonProperty("price_level")
        private Integer priceLevel;
        
        @JsonProperty("vicinity")
        private String vicinity;
        
        @JsonProperty("formatted_address")
        private String formattedAddress;
        
        @JsonProperty("geometry")
        private Geometry geometry;
        
        @JsonProperty("photos")
        private List<Photo> photos;
        
        @JsonProperty("opening_hours")
        private OpeningHours openingHours;
        
        // Getters and Setters
        public String getPlaceId() { return placeId; }
        public void setPlaceId(String placeId) { this.placeId = placeId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public List<String> getTypes() { return types; }
        public void setTypes(List<String> types) { this.types = types; }
        
        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
        
        public Integer getUserRatingsTotal() { return userRatingsTotal; }
        public void setUserRatingsTotal(Integer userRatingsTotal) { this.userRatingsTotal = userRatingsTotal; }
        
        public Integer getPriceLevel() { return priceLevel; }
        public void setPriceLevel(Integer priceLevel) { this.priceLevel = priceLevel; }
        
        public String getVicinity() { return vicinity; }
        public void setVicinity(String vicinity) { this.vicinity = vicinity; }
        
        public String getFormattedAddress() { return formattedAddress; }
        public void setFormattedAddress(String formattedAddress) { this.formattedAddress = formattedAddress; }
        
        public Geometry getGeometry() { return geometry; }
        public void setGeometry(Geometry geometry) { this.geometry = geometry; }
        
        public List<Photo> getPhotos() { return photos; }
        public void setPhotos(List<Photo> photos) { this.photos = photos; }
        
        public OpeningHours getOpeningHours() { return openingHours; }
        public void setOpeningHours(OpeningHours openingHours) { this.openingHours = openingHours; }
    }
    
    public static class Geometry {
        @JsonProperty("location")
        private Location location;
        
        public Location getLocation() { return location; }
        public void setLocation(Location location) { this.location = location; }
    }
    
    public static class Location {
        @JsonProperty("lat")
        private Double lat;
        
        @JsonProperty("lng")
        private Double lng;
        
        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        
        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }
    }
    
    public static class Photo {
        @JsonProperty("photo_reference")
        private String photoReference;
        
        @JsonProperty("height")
        private Integer height;
        
        @JsonProperty("width")
        private Integer width;
        
        @JsonProperty("html_attributions")
        private List<String> htmlAttributions;
        
        public String getPhotoReference() { return photoReference; }
        public void setPhotoReference(String photoReference) { this.photoReference = photoReference; }
        
        public Integer getHeight() { return height; }
        public void setHeight(Integer height) { this.height = height; }
        
        public Integer getWidth() { return width; }
        public void setWidth(Integer width) { this.width = width; }
        
        public List<String> getHtmlAttributions() { return htmlAttributions; }
        public void setHtmlAttributions(List<String> htmlAttributions) { this.htmlAttributions = htmlAttributions; }
    }
    
    public static class OpeningHours {
        @JsonProperty("open_now")
        private Boolean openNow;
        
        public Boolean getOpenNow() { return openNow; }
        public void setOpenNow(Boolean openNow) { this.openNow = openNow; }
    }
}