package com.acheron.backend.service;

import com.acheron.backend.entity.TaxLocality;
import com.acheron.backend.repository.TaxLocalityRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaxLocalityService {

    private final TaxLocalityRepository taxLocalityRepository;
    private final ObjectMapper objectMapper;

    @PostConstruct
    @Transactional
    public void initializeTaxLocalities() {
        if (taxLocalityRepository.count() > 0) {
            log.info("Tax localities already initialized, skipping...");
            return;
        }

        log.info("Initializing tax localities from JSON...");
        try {
            loadTaxLocalitiesFromJson();
            log.info("Successfully initialized {} tax localities", taxLocalityRepository.count());
        } catch (IOException e) {
            log.error("Failed to initialize tax localities", e);
        }
    }

    @Transactional
    public void loadTaxLocalitiesFromJson() throws IOException {
        ClassPathResource resource = new ClassPathResource("data/ny-tax-localities.json");
        
        try (InputStream inputStream = resource.getInputStream()) {
            List<TaxLocality> localities = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<TaxLocality>>() {}
            );
            
            taxLocalityRepository.saveAll(localities);
            log.info("Loaded {} tax localities from JSON", localities.size());
        }
    }

    @Transactional
    public void saveTaxLocalitiesFromJson(String jsonContent) throws IOException {
        List<TaxLocality> localities = objectMapper.readValue(
                jsonContent,
                new TypeReference<List<TaxLocality>>() {}
        );
        
        taxLocalityRepository.deleteAll();
        taxLocalityRepository.saveAll(localities);
        log.info("Saved {} tax localities from JSON", localities.size());
    }

    public Optional<TaxLocality> findByLocality(String locality) {
        if (locality == null || locality.isBlank()) {
            return Optional.empty();
        }
        
        String normalizedLocality = normalizeLocalityName(locality);
        return taxLocalityRepository.findByLocalityIgnoreCase(normalizedLocality);
    }

    public Optional<TaxLocality> findByLocalityOrCounty(String name) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }
        
        String normalized = normalizeLocalityName(name);
        return taxLocalityRepository.findByLocalityOrCounty(normalized);
    }

    public List<TaxLocality> getAllLocalities() {
        return taxLocalityRepository.findAll();
    }

    private String normalizeLocalityName(String name) {
        if (name == null) {
            return null;
        }
        
        String normalized = name.trim();
        
        if (normalized.endsWith(" County")) {
            normalized = normalized.substring(0, normalized.length() - 7).trim();
        }
        
        if (normalized.equalsIgnoreCase("Kings")) {
            return "Brooklyn";
        }
        if (normalized.equalsIgnoreCase("New York")) {
            return "Manhattan";
        }
        if (normalized.equalsIgnoreCase("Richmond")) {
            return "Staten Island";
        }
        
        return normalized;
    }

    @Transactional
    public TaxLocality saveTaxLocality(TaxLocality locality) {
        return taxLocalityRepository.save(locality);
    }

    @Transactional
    public void deleteTaxLocality(String locality) {
        taxLocalityRepository.findByLocalityIgnoreCase(locality)
                .ifPresent(taxLocalityRepository::delete);
    }
}
