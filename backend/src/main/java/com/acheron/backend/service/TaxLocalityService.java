package com.acheron.backend.service;

import com.acheron.backend.entity.TaxLocality;
import com.acheron.backend.repository.TaxLocalityRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class TaxLocalityService {

    private static final String CACHE_ALL = "tax-localities-all";

    private final TaxLocalityRepository taxLocalityRepository;
    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<String, Optional<TaxLocality>> localityCache = new ConcurrentHashMap<>();

    public TaxLocalityService(TaxLocalityRepository taxLocalityRepository, ObjectMapper objectMapper) {
        this.taxLocalityRepository = taxLocalityRepository;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    @Transactional
    public void initializeTaxLocalities() {
        if (taxLocalityRepository.count() > 0) {
            log.info("Tax localities already loaded ({} records), skipping init", taxLocalityRepository.count());
            return;
        }

        log.info("Initializing tax localities from JSON...");
        try {
            loadTaxLocalitiesFromJson();
        } catch (IOException e) {
            log.error("Failed to initialize tax localities", e);
        }
    }

    @Transactional
    @CacheEvict(cacheNames = CACHE_ALL, allEntries = true)
    public void loadTaxLocalitiesFromJson() throws IOException {
        ClassPathResource resource = new ClassPathResource("data/ny-tax-localities.json");

        try (InputStream inputStream = resource.getInputStream()) {
            List<TaxLocality> localities = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<TaxLocality>>() {}
            );

            taxLocalityRepository.deleteAll();
            taxLocalityRepository.flush();
            taxLocalityRepository.saveAll(localities);
            localityCache.clear();
            log.info("Loaded {} tax localities from JSON (replaced all)", localities.size());
        }
    }

    @Transactional
    @CacheEvict(cacheNames = CACHE_ALL, allEntries = true)
    public void saveTaxLocalitiesFromJson(String jsonContent) throws IOException {
        List<TaxLocality> localities = objectMapper.readValue(
                jsonContent,
                new TypeReference<List<TaxLocality>>() {}
        );

        taxLocalityRepository.deleteAll();
        taxLocalityRepository.flush();
        taxLocalityRepository.saveAll(localities);
        localityCache.clear();
        log.info("Saved {} tax localities from JSON (replaced all)", localities.size());
    }

    public Optional<TaxLocality> findByLocality(String locality) {
        if (locality == null || locality.isBlank()) {
            return Optional.empty();
        }

        String normalizedLocality = normalizeLocalityName(locality);
        String cacheKey = "locality:" + normalizedLocality.toLowerCase();

        return localityCache.computeIfAbsent(cacheKey,
                k -> taxLocalityRepository.findByLocalityIgnoreCase(normalizedLocality));
    }

    public Optional<TaxLocality> findByLocalityOrCounty(String name) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }

        String normalized = normalizeLocalityName(name);
        String cacheKey = "county:" + normalized.toLowerCase();

        return localityCache.computeIfAbsent(cacheKey,
                k -> taxLocalityRepository.findByLocalityOrCounty(normalized));
    }

    @Cacheable(cacheNames = CACHE_ALL)
    public List<TaxLocality> getAllLocalities() {
        return taxLocalityRepository.findAll();
    }

    public Page<TaxLocality> getAllLocalities(Pageable pageable) {
        return taxLocalityRepository.findAll(pageable);
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
    @CacheEvict(cacheNames = CACHE_ALL, allEntries = true)
    public TaxLocality saveTaxLocality(TaxLocality locality) {
        localityCache.clear();
        return taxLocalityRepository.save(locality);
    }

    @Transactional
    @CacheEvict(cacheNames = CACHE_ALL, allEntries = true)
    public void deleteTaxLocality(String locality) {
        taxLocalityRepository.findByLocalityIgnoreCase(locality)
                .ifPresent(taxLocalityRepository::delete);
        localityCache.clear();
    }
}
