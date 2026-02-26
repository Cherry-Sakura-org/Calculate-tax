package com.acheron.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MapboxResponse {
    
    private String type;
    private List<Feature> features;
    private String attribution;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Feature {
        private String type;
        private Geometry geometry;
        private Properties properties;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Geometry {
        private List<Double> coordinates;
        private String type;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Properties {
        private String name;
        
        @JsonProperty("name_preferred")
        private String namePreferred;
        
        @JsonProperty("mapbox_id")
        private String mapboxId;
        
        @JsonProperty("feature_type")
        private String featureType;
        
        private String address;
        
        @JsonProperty("full_address")
        private String fullAddress;
        
        @JsonProperty("place_formatted")
        private String placeFormatted;
        
        private Context context;
        private String language;
        private String maki;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Context {
        private CountryContext country;
        private RegionContext region;
        private PostcodeContext postcode;
        private DistrictContext district;
        private PlaceContext place;
        private LocalityContext locality;
        private NeighborhoodContext neighborhood;
        private StreetContext street;
        private AddressContext address;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CountryContext {
        private String id;
        private String name;
        
        @JsonProperty("country_code")
        private String countryCode;
        
        @JsonProperty("country_code_alpha_3")
        private String countryCodeAlpha3;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RegionContext {
        private String id;
        private String name;
        
        @JsonProperty("region_code")
        private String regionCode;
        
        @JsonProperty("region_code_full")
        private String regionCodeFull;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PostcodeContext {
        private String id;
        private String name;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DistrictContext {
        private String id;
        private String name;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PlaceContext {
        private String id;
        private String name;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LocalityContext {
        private String id;
        private String name;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NeighborhoodContext {
        private String id;
        private String name;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StreetContext {
        private String id;
        private String name;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AddressContext {
        private String id;
        private String name;
        
        @JsonProperty("address_number")
        private String addressNumber;
        
        @JsonProperty("street_name")
        private String streetName;
    }
    
    public NominatimResponse toNominatimResponse() {
        if (features == null || features.isEmpty()) {
            return null;
        }
        
        Feature feature = features.get(0);
        Properties props = feature.getProperties();
        Context ctx = props.getContext();
        
        NominatimResponse response = new NominatimResponse();
        NominatimResponse.Address address = new NominatimResponse.Address();
        
        if (ctx != null) {
            if (ctx.getCountry() != null) {
                address.setCountry(ctx.getCountry().getName());
            }
            
            // Primary: region
            if (ctx.getRegion() != null) {
                address.setState(ctx.getRegion().getName());
            }
            // Fallback: use district as state if region is missing
            else if (ctx.getDistrict() != null) {
                address.setState(ctx.getDistrict().getName());
            }
            
            if (ctx.getPlace() != null) {
                address.setCity(ctx.getPlace().getName());
                address.setTown(ctx.getPlace().getName());
            }
            
            if (ctx.getLocality() != null && address.getCity() == null) {
                address.setCity(ctx.getLocality().getName());
            }
            
            if (ctx.getDistrict() != null) {
                address.setCounty(ctx.getDistrict().getName());
            }
            
            if (ctx.getPostcode() != null) {
                address.setPostcode(ctx.getPostcode().getName());
            }
        }
        
        response.setAddress(address);
        response.setDisplayName(props.getFullAddress());
        
        return response;
    }
}
