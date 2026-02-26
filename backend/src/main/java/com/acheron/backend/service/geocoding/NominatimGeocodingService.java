package com.acheron.backend.service.geocoding;

import com.acheron.backend.dto.NominatimResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

@Slf4j
@Service
@ConditionalOnProperty(name = "geocoding.provider", havingValue = "nominatim")
public class NominatimGeocodingService implements GeocodingService {

    private final ApiRateLimiter apiRateLimiter;
    private final RestClient restClient = RestClient.create();
    private static final String NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

    public NominatimGeocodingService(ApiRateLimiter apiRateLimiter) {
        this.apiRateLimiter = apiRateLimiter;
    }

    @Override
    @Cacheable(value = "geolocation", key = "#latitude + ':' + #longitude", unless = "#result == null")
    public NominatimResponse getLocationByCoordinates(BigDecimal latitude, BigDecimal longitude) {
        String uri = NOMINATIM_BASE_URL + "/reverse?lat={lat}&lon={lon}&format=json";

        int maxRetries = 3;
        int retryCount = 0;
        long baseDelay = 1000;

        while (retryCount < maxRetries) {
            try {
                apiRateLimiter.acquire();
                
                if (retryCount > 0) {
                    Thread.sleep(baseDelay * (long) Math.pow(2, retryCount - 1));
                }

                NominatimResponse response = restClient.get()
                        .uri(uri, latitude, longitude)
                        .header("User-Agent", "InstantWellnessKits/1.0")
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

                return response;

            } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
                retryCount++;
                log.warn("Nominatim rate limit hit for ({}, {}). Retry {}/{}", 
                        latitude, longitude, retryCount, maxRetries);
                
                if (retryCount >= maxRetries) {
                    log.error("Nominatim max retries reached for ({}, {})", latitude, longitude);
                    throw new IllegalArgumentException(
                            "Nominatim API rate limit exceeded. Please try again later.", e);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Geocoding interrupted", e);
            }
        }

        throw new IllegalArgumentException(
                String.format("Failed to geocode coordinates after %d retries: %s, %s", 
                        maxRetries, latitude, longitude)
        );
    }

    @Override
    public String getProviderName() {
        return "Nominatim (OpenStreetMap) - Rate limited: 1 req/sec";
    }
}
