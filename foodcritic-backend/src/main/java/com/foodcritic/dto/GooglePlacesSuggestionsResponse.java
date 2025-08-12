package com.foodcritic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class GooglePlacesSuggestionsResponse {
    
    private List<Prediction> predictions;
    private String status;
    
    @JsonProperty("error_message")
    private String errorMessage;
    
    // Default constructor
    public GooglePlacesSuggestionsResponse() {}
    
    // Getters and Setters
    public List<Prediction> getPredictions() {
        return predictions;
    }
    
    public void setPredictions(List<Prediction> predictions) {
        this.predictions = predictions;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    // Nested class for Prediction
    public static class Prediction {
        @JsonProperty("place_id")
        private String placeId;
        
        private String description;
        
        @JsonProperty("structured_formatting")
        private StructuredFormatting structuredFormatting;
        
        // Default constructor
        public Prediction() {}
        
        // Getters and Setters
        public String getPlaceId() {
            return placeId;
        }
        
        public void setPlaceId(String placeId) {
            this.placeId = placeId;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public StructuredFormatting getStructuredFormatting() {
            return structuredFormatting;
        }
        
        public void setStructuredFormatting(StructuredFormatting structuredFormatting) {
            this.structuredFormatting = structuredFormatting;
        }
    }
    
    // Nested class for StructuredFormatting
    public static class StructuredFormatting {
        @JsonProperty("main_text")
        private String mainText;
        
        @JsonProperty("secondary_text")
        private String secondaryText;
        
        // Default constructor
        public StructuredFormatting() {}
        
        // Getters and Setters
        public String getMainText() {
            return mainText;
        }
        
        public void setMainText(String mainText) {
            this.mainText = mainText;
        }
        
        public String getSecondaryText() {
            return secondaryText;
        }
        
        public void setSecondaryText(String secondaryText) {
            this.secondaryText = secondaryText;
        }
    }
}