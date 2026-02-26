package com.acheron.backend.service.geocoding;

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
@ConditionalOnProperty(name = "geocoding.provider", havingValue = "locationiq")
public class LocationIqGeocodingService implements GeocodingService {

    private final ApiRateLimiter apiRateLimiter;
    private final RestClient restClient;
    private static final String LOCATIONIQ_BASE_URL = "https://us1.locationiq.com/v1";
    
    @Value("${geocoding.locationiq.api-key:pk.d189c87af9bd50c571687a188a43d82b}")
    private String apiKey;
    
    public LocationIqGeocodingService(ApiRateLimiter apiRateLimiter) {
        this.apiRateLimiter = apiRateLimiter;
        this.restClient = RestClient.builder()
                .baseUrl(LOCATIONIQ_BASE_URL)
                .build();
    }

    @Override
    @Cacheable(value = "geolocation", key = "#latitude + ':' + #longitude", unless = "#result == null")
    public NominatimResponse getLocationByCoordinates(BigDecimal latitude, BigDecimal longitude) {
        String uri = "/reverse.php?lat={lat}&lon={lon}&key={key}&format=json";

        try {
            apiRateLimiter.acquire();
            log.debug("LocationIQ request for ({}, {}) with key={}", latitude, longitude, apiKey.substring(0, 8) + "...");
            
            NominatimResponse response = restClient.get()
                    .uri(uri, latitude, longitude, apiKey)
                    .retrieve()
                    .body(NominatimResponse.class);

            if (response == null || response.getAddress() == null) {
                throw new IllegalArgumentException(
                        String.format("Could not determine address for coordinates: %s, %s", latitude, longitude)
                );
            }

            if (!"New York".equalsIgnoreCase(response.getAddress().getState())) {
                throw new IllegalArgumentException(
                        String.format("Delivery is only available in New York State. Current location is in: %s",
                                response.getAddress().getState())
                );
            }

            log.debug("LocationIQ geocoding successful for ({}, {})", latitude, longitude);
            return response;

        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
            log.error("LocationIQ rate limit exceeded for ({}, {})", latitude, longitude);
            throw new IllegalArgumentException("LocationIQ API rate limit exceeded. Please add valid API key.", e);
        } catch (Exception e) {
            log.error("LocationIQ geocoding failed for ({}, {}): {}", latitude, longitude, e.getMessage());
            throw new IllegalArgumentException("Failed to geocode with LocationIQ: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProviderName() {
        return "LocationIQ (Nominatim-compatible, 10k req/day free)";
    }
}
