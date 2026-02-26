package com.acheron.backend.service.geocoding;

import com.acheron.backend.dto.MapboxResponse;
import com.acheron.backend.dto.NominatimResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

@Slf4j
@Service
@ConditionalOnProperty(name = "geocoding.provider", havingValue = "mapbox")
public class MapboxGeocodingService implements GeocodingService {

    private final ApiRateLimiter apiRateLimiter;
    private final RestClient restClient;
    private static final String MAPBOX_BASE_URL = "https://api.mapbox.com/search/searchbox/v1";
    
    @Value("${geocoding.mapbox.access-token}")
    private String accessToken;

    public MapboxGeocodingService(ApiRateLimiter apiRateLimiter) {
        this.apiRateLimiter = apiRateLimiter;
        this.restClient = RestClient.builder()
                .baseUrl(MAPBOX_BASE_URL)
                .build();
    }

    @Override
    @Cacheable(value = "geolocation-mapbox-v2", key = "#latitude + ':' + #longitude", unless = "#result == null")
    public NominatimResponse getLocationByCoordinates(BigDecimal latitude, BigDecimal longitude) {
        String uri = "/reverse?longitude={lon}&latitude={lat}&access_token={token}&language=en&types=address,place,locality,region,country";

        try {
            apiRateLimiter.acquire();
            log.debug("Mapbox reverse geocoding for ({}, {})", latitude, longitude);
            
            MapboxResponse response = restClient.get()
                    .uri(uri, longitude, latitude, accessToken)
                    .retrieve()
                    .body(MapboxResponse.class);

            if (response == null || response.getFeatures() == null || response.getFeatures().isEmpty()) {
                throw new IllegalArgumentException(
                        String.format("Could not determine address for coordinates: %s, %s", latitude, longitude)
                );
            }

            NominatimResponse nominatimResponse = response.toNominatimResponse();
            
            if (nominatimResponse == null || nominatimResponse.getAddress() == null) {
                throw new IllegalArgumentException(
                        String.format("Could not parse address for coordinates: %s, %s", latitude, longitude)
                );
            }

            String state = nominatimResponse.getAddress().getState();
            if (state == null || state.isBlank()) {
                log.warn("No state data for ({}, {}) - skipping", latitude, longitude);
                throw new IllegalArgumentException(
                        String.format("Unable to determine state for coordinates: %s, %s", latitude, longitude)
                );
            }
            
            if (!"New York".equalsIgnoreCase(state)) {
                log.debug("Location outside NY: {} for ({}, {})", state, latitude, longitude);
                throw new IllegalArgumentException(
                        String.format("Delivery only in NY State. Location: %s", state)
                );
            }

            log.debug("Mapbox geocoding successful: State={}, County={}, City={}", 
                    state,
                    nominatimResponse.getAddress().getCounty(),
                    nominatimResponse.getAddress().getCity());
            
            return nominatimResponse;

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            if (e.getStatusCode().value() == 429) {
                log.warn("Mapbox rate limit hit for ({}, {})", latitude, longitude);
            } else {
                log.error("Mapbox API {} error for ({}, {})", e.getStatusCode(), latitude, longitude);
            }
            throw new IllegalArgumentException("Mapbox API error: " + e.getStatusCode(), e);
        } catch (IllegalArgumentException e) {
            // Re-throw validation errors without extra logging
            throw e;
        } catch (Exception e) {
            log.error("Mapbox error for ({}, {}): {}", latitude, longitude, e.getMessage());
            throw new IllegalArgumentException("Geocoding failed: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProviderName() {
        return "Mapbox Search Box API (10 req/sec, high quality data)";
    }
}
