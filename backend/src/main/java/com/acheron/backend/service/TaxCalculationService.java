package com.acheron.backend.service;

import com.acheron.backend.dto.NominatimResponse;
import com.acheron.backend.dto.TaxCalculationResult;
import com.acheron.backend.entity.TaxLocality;
import com.acheron.backend.service.geocoding.GeocodingService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaxCalculationService {

    private final TaxLocalityService taxLocalityService;
    private final GeocodingService geocodingService;

    private static final BigDecimal NY_STATE_RATE = new BigDecimal("0.04000");
    private static final BigDecimal NYC_CITY_RATE = new BigDecimal("0.04375");

    @PostConstruct
    public void init() {
        log.info("Geocoding provider: {}", geocodingService.getProviderName());
    }
    
    public TaxCalculationResult calculateTaxForLocation(BigDecimal latitude, BigDecimal longitude) {
        NominatimResponse location = geocodingService.getLocationByCoordinates(latitude, longitude);
        String city = extractCity(location);
        String county = extractCounty(location);
        
        return calculateTaxRates(city, county);
    }
    
    private String extractCity(NominatimResponse location) {
        if (location == null || location.getAddress() == null) {
            return null;
        }
        String city = location.getAddress().getCity();
        return city != null ? city : location.getAddress().getTown();
    }
    
    private String extractCounty(NominatimResponse location) {
        return location != null && location.getAddress() != null 
                ? location.getAddress().getCounty() 
                : null;
    }

    @Cacheable(value = "tax-rates", key = "#localityName", unless = "#result == null")
    public TaxCalculationResult calculateTaxRates(String localityName, String countyName) {
        Optional<TaxLocality> localityOpt = taxLocalityService.findByLocality(localityName);
        
        if (localityOpt.isEmpty() && countyName != null) {
            localityOpt = taxLocalityService.findByLocality(countyName);
        }

        if (localityOpt.isEmpty()) {
            localityOpt = taxLocalityService.findByLocalityOrCounty(localityName != null ? localityName : countyName);
        }

        TaxLocality locality = localityOpt.orElseThrow(() -> 
                new IllegalArgumentException("Tax locality not found for: " + localityName + " / " + countyName)
        );

        if (locality.getSeeReference() != null) {
            locality = taxLocalityService.findByLocality(locality.getSeeReference())
                    .orElseThrow(() -> new IllegalArgumentException("Referenced locality not found"));
        }

        BigDecimal combinedRate = locality.getTaxRatePercent()
                .divide(new BigDecimal("100"), 5, RoundingMode.HALF_UP);

        BigDecimal stateRate = NY_STATE_RATE;
        BigDecimal cityRate = BigDecimal.ZERO;
        BigDecimal specialRate = BigDecimal.ZERO;

        boolean isNYC = "New York City".equalsIgnoreCase(locality.getLocality());
        
        if (isNYC) {
            cityRate = NYC_CITY_RATE;
        }

        if (locality.getIsMctdDistrict() != null && locality.getIsMctdDistrict()) {
            specialRate = new BigDecimal("0.00375");
        }

        BigDecimal countyRate = combinedRate
                .subtract(stateRate)
                .subtract(cityRate)
                .subtract(specialRate)
                .setScale(5, RoundingMode.HALF_UP);

        if (countyRate.compareTo(BigDecimal.ZERO) < 0) {
            countyRate = BigDecimal.ZERO;
        }

        List<String> jurisdictions = new ArrayList<>();
        jurisdictions.add("State: New York");
        
        if (locality.getParentCounty() != null && !locality.getParentCounty().isBlank()) {
            jurisdictions.add("County: " + locality.getParentCounty());
        } else if (countyName != null && !countyName.isBlank()) {
            jurisdictions.add("County: " + countyName);
        }
        
        if (localityName != null && !localityName.isBlank()) {
            jurisdictions.add("Locality: " + localityName);
        }
        
        if (isNYC) {
            jurisdictions.add("City: New York City");
        }

        log.debug("Tax calculation: Locality={}, Combined={}, State={}, County={}, City={}, Special={}", 
                locality.getLocality(), combinedRate, stateRate, countyRate, cityRate, specialRate);

        return TaxCalculationResult.builder()
                .compositeTaxRate(combinedRate)
                .stateRate(stateRate)
                .countyRate(countyRate)
                .cityRate(cityRate)
                .specialRates(specialRate)
                .jurisdictions(jurisdictions)
                .build();
    }
}
