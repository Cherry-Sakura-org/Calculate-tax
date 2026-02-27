package com.acheron.backend.service.geocoding;

import com.acheron.backend.dto.NominatimResponse;

import java.math.BigDecimal;

public interface GeocodingService {
    
    NominatimResponse getLocationByCoordinates(BigDecimal latitude, BigDecimal longitude);
    
    String getProviderName();
}
