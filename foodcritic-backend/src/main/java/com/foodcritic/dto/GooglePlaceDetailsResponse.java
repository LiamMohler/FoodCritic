package com.foodcritic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class GooglePlaceDetailsResponse {
    
    @JsonProperty("result")
    private GooglePlaceDetails result;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("error_message")
    private String errorMessage;
    
    public GooglePlaceDetailsResponse() {}
    
    public GooglePlaceDetails getResult() { return result; }
    public void setResult(GooglePlaceDetails result) { this.result = result; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    
    public static class GooglePlaceDetails {
        @JsonProperty("place_id")
        private String placeId;
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("formatted_address")
        private String formattedAddress;
        
        @JsonProperty("formatted_phone_number")
        private String formattedPhoneNumber;
        
        @JsonProperty("website")
        private String website;
        
        @JsonProperty("rating")
        private Double rating;
        
        @JsonProperty("user_ratings_total")
        private Integer userRatingsTotal;
        
        @JsonProperty("price_level")
        private Integer priceLevel;
        
        @JsonProperty("types")
        private List<String> types;
        
        @JsonProperty("geometry")
        private GooglePlacesSearchResponse.Geometry geometry;
        
        @JsonProperty("photos")
        private List<GooglePlacesSearchResponse.Photo> photos;
        
        @JsonProperty("opening_hours")
        private OpeningHoursDetails openingHours;
        
        @JsonProperty("reviews")
        private List<GoogleReview> reviews;
        
        // Getters and Setters
        public String getPlaceId() { return placeId; }
        public void setPlaceId(String placeId) { this.placeId = placeId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getFormattedAddress() { return formattedAddress; }
        public void setFormattedAddress(String formattedAddress) { this.formattedAddress = formattedAddress; }
        
        public String getFormattedPhoneNumber() { return formattedPhoneNumber; }
        public void setFormattedPhoneNumber(String formattedPhoneNumber) { this.formattedPhoneNumber = formattedPhoneNumber; }
        
        public String getWebsite() { return website; }
        public void setWebsite(String website) { this.website = website; }
        
        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
        
        public Integer getUserRatingsTotal() { return userRatingsTotal; }
        public void setUserRatingsTotal(Integer userRatingsTotal) { this.userRatingsTotal = userRatingsTotal; }
        
        public Integer getPriceLevel() { return priceLevel; }
        public void setPriceLevel(Integer priceLevel) { this.priceLevel = priceLevel; }
        
        public List<String> getTypes() { return types; }
        public void setTypes(List<String> types) { this.types = types; }
        
        public GooglePlacesSearchResponse.Geometry getGeometry() { return geometry; }
        public void setGeometry(GooglePlacesSearchResponse.Geometry geometry) { this.geometry = geometry; }
        
        public List<GooglePlacesSearchResponse.Photo> getPhotos() { return photos; }
        public void setPhotos(List<GooglePlacesSearchResponse.Photo> photos) { this.photos = photos; }
        
        public OpeningHoursDetails getOpeningHours() { return openingHours; }
        public void setOpeningHours(OpeningHoursDetails openingHours) { this.openingHours = openingHours; }
        
        public List<GoogleReview> getReviews() { return reviews; }
        public void setReviews(List<GoogleReview> reviews) { this.reviews = reviews; }
    }
    
    public static class OpeningHoursDetails {
        @JsonProperty("open_now")
        private Boolean openNow;
        
        @JsonProperty("periods")
        private List<Period> periods;
        
        @JsonProperty("weekday_text")
        private List<String> weekdayText;
        
        public Boolean getOpenNow() { return openNow; }
        public void setOpenNow(Boolean openNow) { this.openNow = openNow; }
        
        public List<Period> getPeriods() { return periods; }
        public void setPeriods(List<Period> periods) { this.periods = periods; }
        
        public List<String> getWeekdayText() { return weekdayText; }
        public void setWeekdayText(List<String> weekdayText) { this.weekdayText = weekdayText; }
    }
    
    public static class Period {
        @JsonProperty("open")
        private TimeOfWeek open;
        
        @JsonProperty("close")
        private TimeOfWeek close;
        
        public TimeOfWeek getOpen() { return open; }
        public void setOpen(TimeOfWeek open) { this.open = open; }
        
        public TimeOfWeek getClose() { return close; }
        public void setClose(TimeOfWeek close) { this.close = close; }
    }
    
    public static class TimeOfWeek {
        @JsonProperty("day")
        private Integer day;
        
        @JsonProperty("time")
        private String time;
        
        public Integer getDay() { return day; }
        public void setDay(Integer day) { this.day = day; }
        
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
    }
    
    public static class GoogleReview {
        @JsonProperty("author_name")
        private String authorName;
        
        @JsonProperty("author_url")
        private String authorUrl;
        
        @JsonProperty("profile_photo_url")
        private String profilePhotoUrl;
        
        @JsonProperty("rating")
        private Integer rating;
        
        @JsonProperty("relative_time_description")
        private String relativeTimeDescription;
        
        @JsonProperty("text")
        private String text;
        
        @JsonProperty("time")
        private Long time;
        
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        
        public String getAuthorUrl() { return authorUrl; }
        public void setAuthorUrl(String authorUrl) { this.authorUrl = authorUrl; }
        
        public String getProfilePhotoUrl() { return profilePhotoUrl; }
        public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
        
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        
        public String getRelativeTimeDescription() { return relativeTimeDescription; }
        public void setRelativeTimeDescription(String relativeTimeDescription) { this.relativeTimeDescription = relativeTimeDescription; }
        
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        
        public Long getTime() { return time; }
        public void setTime(Long time) { this.time = time; }
    }
}