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
@ConditionalOnProperty(name = "geocoding.provider", havingValue = "photon")
public class PhotonGeocodingService implements GeocodingService {

    private final ApiRateLimiter apiRateLimiter;
    private final RestClient restClient = RestClient.create();
    private static final String PHOTON_BASE_URL = "https://photon.komoot.io";

    public PhotonGeocodingService(ApiRateLimiter apiRateLimiter) {
        this.apiRateLimiter = apiRateLimiter;
    }

    @Override
    @Cacheable(value = "geolocation", key = "#latitude + ':' + #longitude", unless = "#result == null")
    public NominatimResponse getLocationByCoordinates(BigDecimal latitude, BigDecimal longitude) {
        String uri = PHOTON_BASE_URL + "/reverse?lat={lat}&lon={lon}";

        try {
            apiRateLimiter.acquire();
            NominatimResponse response = restClient.get()
                    .uri(uri, latitude, longitude)
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

            log.debug("Photon geocoding successful for ({}, {})", latitude, longitude);
            return response;

        } catch (Exception e) {
            log.error("Photon geocoding failed for ({}, {}): {}", latitude, longitude, e.getMessage());
            throw new IllegalArgumentException("Failed to geocode with Photon: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProviderName() {
        return "Photon (Komoot) - No rate limit";
    }
}
