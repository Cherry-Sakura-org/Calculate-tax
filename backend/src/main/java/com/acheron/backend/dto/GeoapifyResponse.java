package com.acheron.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GeoapifyResponse(
        List<Feature> features
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Feature(
            LocationProperties properties
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LocationProperties(
            String state,
            String county,
            String city,
            String postcode,
            String formatted
    ) {}

    public LocationProperties getFirstLocation() {
        if (features != null && !features.isEmpty() && features.get(0).properties() != null) {
            return features.get(0).properties();
        }
        return null;
    }

    public boolean isNewYorkState() {
        LocationProperties loc = getFirstLocation();
        return loc != null && "New York".equalsIgnoreCase(loc.state());
    }
}