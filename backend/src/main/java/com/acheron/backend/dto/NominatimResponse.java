package com.acheron.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NominatimResponse {
    
    @JsonProperty("place_id")
    private Long placeId;
    
    private String licence;
    
    @JsonProperty("osm_type")
    private String osmType;
    
    @JsonProperty("osm_id")
    private Long osmId;
    
    private String lat;
    private String lon;
    
    @JsonProperty("class")
    private String classification;
    
    private String type;
    
    @JsonProperty("place_rank")
    private Integer placeRank;
    
    private Double importance;
    
    private String addresstype;
    
    private String name;
    
    @JsonProperty("display_name")
    private String displayName;
    
    private Address address;
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Address {
        private String road;
        private String suburb;
        private String neighbourhood;
        private String hamlet;
        private String village;
        private String town;
        private String city;
        private String county;
        
        @JsonProperty("state_district")
        private String stateDistrict;
        
        private String state;
        
        @JsonProperty("ISO3166-2-lvl4")
        private String iso31662Lvl4;
        
        private String postcode;
        private String country;
        
        @JsonProperty("country_code")
        private String countryCode;
        
        public String getCityOrTown() {
            if (city != null && !city.isEmpty()) {
                return city;
            }
            if (town != null && !town.isEmpty()) {
                return town;
            }
            if (village != null && !village.isEmpty()) {
                return village;
            }
            return null;
        }
    }
}
