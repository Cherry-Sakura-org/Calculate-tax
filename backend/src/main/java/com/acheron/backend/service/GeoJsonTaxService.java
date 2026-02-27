package com.acheron.backend.service;

import com.acheron.backend.dto.TaxCalculationResult;
import com.acheron.backend.entity.TaxLocality;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeoJsonTaxService {

    private final TaxLocalityService taxLocalityService;
    private final ObjectMapper objectMapper;

    private static final BigDecimal NY_STATE_RATE = new BigDecimal("0.04000");
    private static final BigDecimal NYC_CITY_RATE = new BigDecimal("0.04375");
    private static final int SRID_WGS84 = 4326;

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), SRID_WGS84);

    private record GeoRegion(String name, Geometry geometry) {}

    private List<GeoRegion> countyRegions = Collections.emptyList();
    private List<GeoRegion> boroughRegions = Collections.emptyList();

    private static final Map<String, String> BOROUGH_TO_NYC_COUNTY = Map.of(
            "Manhattan", "New York County",
            "Brooklyn", "Kings County",
            "Queens", "Queens County",
            "Bronx", "Bronx County",
            "Staten Island", "Richmond County"
    );

    private static final java.util.Set<String> NYC_COUNTIES = java.util.Set.of(
            "New York County", "Kings County", "Queens County", "Bronx County", "Richmond County"
    );
    private static final java.util.Set<String> LONG_ISLAND_COUNTIES = java.util.Set.of(
            "Nassau County", "Suffolk County"
    );
    private static final java.util.Set<String> HUDSON_VALLEY_COUNTIES = java.util.Set.of(
            "Westchester County", "Rockland County", "Putnam County", "Dutchess County",
            "Orange County", "Sullivan County", "Ulster County"
    );
    private static final java.util.Set<String> CAPITAL_DISTRICT_COUNTIES = java.util.Set.of(
            "Albany County", "Rensselaer County", "Saratoga County", "Schenectady County"
    );

    private final ConcurrentHashMap<Long, TaxCalculationResult> coordinateCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        try {
            long start = System.nanoTime();
            countyRegions = loadGeoJson("data/new-york-counties.geojson");
            boroughRegions = loadGeoJson("data/new-york-city-boroughs.geojson");
            long elapsed = (System.nanoTime() - start) / 1_000_000;
            log.info("GeoJSON loaded: {} counties, {} boroughs in {}ms",
                    countyRegions.size(), boroughRegions.size(), elapsed);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load GeoJSON data", e);
        }
    }

    private List<GeoRegion> loadGeoJson(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        List<GeoRegion> regions = new ArrayList<>();

        try (InputStream is = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            JsonNode features = root.get("features");

            if (features == null || !features.isArray()) {
                throw new IllegalStateException("Invalid GeoJSON: no features array in " + path);
            }

            for (JsonNode feature : features) {
                String name = extractFeatureName(feature);
                Geometry geometry = parseGeometry(feature.get("geometry"));

                if (name != null && geometry != null) {
                    geometry.setUserData(name);
                    regions.add(new GeoRegion(name, geometry));
                }
            }
        }

        return Collections.unmodifiableList(regions);
    }

    private String extractFeatureName(JsonNode feature) {
        JsonNode props = feature.get("properties");
        if (props == null) return null;

        JsonNode nameNode = props.get("name");
        return nameNode != null ? nameNode.asText() : null;
    }

    private Geometry parseGeometry(JsonNode geometryNode) {
        if (geometryNode == null) return null;

        String type = geometryNode.get("type").asText();
        JsonNode coordinates = geometryNode.get("coordinates");

        return switch (type) {
            case "Polygon" -> parsePolygon(coordinates);
            case "MultiPolygon" -> parseMultiPolygon(coordinates);
            default -> {
                log.warn("Unsupported geometry type: {}", type);
                yield null;
            }
        };
    }

    private Geometry parsePolygon(JsonNode coordsNode) {
        Coordinate[] shell = parseLinearRing(coordsNode.get(0));
        if (shell.length < 4) return null;

        org.locationtech.jts.geom.LinearRing outerRing = geometryFactory.createLinearRing(shell);

        int holeCount = coordsNode.size() - 1;
        org.locationtech.jts.geom.LinearRing[] holes = new org.locationtech.jts.geom.LinearRing[holeCount];
        for (int i = 0; i < holeCount; i++) {
            holes[i] = geometryFactory.createLinearRing(parseLinearRing(coordsNode.get(i + 1)));
        }

        return geometryFactory.createPolygon(outerRing, holes);
    }

    private Geometry parseMultiPolygon(JsonNode coordsNode) {
        org.locationtech.jts.geom.Polygon[] polygons = new org.locationtech.jts.geom.Polygon[coordsNode.size()];
        for (int i = 0; i < coordsNode.size(); i++) {
            Geometry poly = parsePolygon(coordsNode.get(i));
            if (poly instanceof org.locationtech.jts.geom.Polygon p) {
                polygons[i] = p;
            } else {
                return null;
            }
        }
        return geometryFactory.createMultiPolygon(polygons);
    }

    private Coordinate[] parseLinearRing(JsonNode ringNode) {
        Coordinate[] coords = new Coordinate[ringNode.size()];
        for (int i = 0; i < ringNode.size(); i++) {
            JsonNode point = ringNode.get(i);
            double lon = point.get(0).asDouble();
            double lat = point.get(1).asDouble();
            coords[i] = new Coordinate(lon, lat);
        }
        return coords;
    }

    public Optional<String> findCounty(double latitude, double longitude) {
        Point point = geometryFactory.createPoint(new Coordinate(longitude, latitude));

        for (GeoRegion region : countyRegions) {
            if (region.geometry().contains(point)) {
                return Optional.of(region.name());
            }
        }
        return Optional.empty();
    }

    public Optional<String> findBorough(double latitude, double longitude) {
        Point point = geometryFactory.createPoint(new Coordinate(longitude, latitude));

        for (GeoRegion region : boroughRegions) {
            if (region.geometry().contains(point)) {
                return Optional.of(region.name());
            }
        }
        return Optional.empty();
    }

    public TaxCalculationResult calculateTax(BigDecimal latitude, BigDecimal longitude) {
        long cacheKey = Double.doubleToLongBits(latitude.doubleValue()) * 31
                + Double.doubleToLongBits(longitude.doubleValue());

        TaxCalculationResult cached = coordinateCache.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        double lat = latitude.doubleValue();
        double lon = longitude.doubleValue();

        Optional<String> boroughOpt = findBorough(lat, lon);
        Optional<String> countyOpt = findCounty(lat, lon);

        String localityName;
        String countyName;

        if (boroughOpt.isPresent()) {
            localityName = boroughOpt.get();
            countyName = BOROUGH_TO_NYC_COUNTY.getOrDefault(localityName, null);
        } else if (countyOpt.isPresent()) {
            countyName = countyOpt.get();
            localityName = stripCountySuffix(countyName);
        } else {
            TaxCalculationResult outOfState = TaxCalculationResult.builder()
                    .compositeTaxRate(BigDecimal.ZERO)
                    .stateRate(BigDecimal.ZERO)
                    .countyRate(BigDecimal.ZERO)
                    .cityRate(BigDecimal.ZERO)
                    .specialRates(BigDecimal.ZERO)
                    .jurisdictions(List.of("Out of New York State"))
                    .withinNewYork(false)
                    .county(null)
                    .region("Out of State")
                    .build();
            coordinateCache.put(cacheKey, outOfState);
            return outOfState;
        }

        String fullCountyName = countyName;
        if (fullCountyName != null && !fullCountyName.endsWith(" County")) {
            fullCountyName = fullCountyName + " County";
        }
        String region = classifyRegion(fullCountyName, boroughOpt.isPresent());

        TaxCalculationResult result = buildTaxResult(localityName, countyName);
        result.setCounty(stripCountySuffix(fullCountyName));
        result.setRegion(region);

        coordinateCache.put(cacheKey, result);
        return result;
    }

    private TaxCalculationResult buildTaxResult(String localityName, String countyName) {
        Optional<TaxLocality> localityOpt = taxLocalityService.findByLocality(localityName);

        if (localityOpt.isEmpty() && countyName != null) {
            localityOpt = taxLocalityService.findByLocality(countyName);
        }

        if (localityOpt.isEmpty()) {
            localityOpt = taxLocalityService.findByLocalityOrCounty(
                    localityName != null ? localityName : countyName);
        }

        TaxLocality locality = localityOpt.orElseThrow(() ->
                new IllegalArgumentException("Tax locality not found for: " + localityName + " / " + countyName));

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
        }

        if (localityName != null && !localityName.isBlank()) {
            jurisdictions.add("Locality: " + localityName);
        }

        if (isNYC) {
            jurisdictions.add("City: New York City");
        }

        return TaxCalculationResult.builder()
                .compositeTaxRate(combinedRate)
                .stateRate(stateRate)
                .countyRate(countyRate)
                .cityRate(cityRate)
                .specialRates(specialRate)
                .jurisdictions(jurisdictions)
                .withinNewYork(true)
                .build();
    }

    private String classifyRegion(String fullCountyName, boolean isBorough) {
        if (fullCountyName == null) return "Unknown";
        if (isBorough || NYC_COUNTIES.contains(fullCountyName)) return "NYC";
        if (LONG_ISLAND_COUNTIES.contains(fullCountyName)) return "Long Island";
        if (HUDSON_VALLEY_COUNTIES.contains(fullCountyName)) return "Hudson Valley";
        if (CAPITAL_DISTRICT_COUNTIES.contains(fullCountyName)) return "Capital District";
        return "Upstate";
    }

    private String stripCountySuffix(String name) {
        if (name != null && name.endsWith(" County")) {
            return name.substring(0, name.length() - 7);
        }
        return name;
    }

    public int getCacheSize() {
        return coordinateCache.size();
    }

    public void clearCache() {
        coordinateCache.clear();
    }
}
