package com.acheron.backend.api;

import com.acheron.backend.dto.response.MapCountyResponse;
import com.acheron.backend.entity.Order;
import com.acheron.backend.repository.OrderRepository;
import com.acheron.backend.service.DashboardService;
import com.acheron.backend.service.GeoJsonTaxService;
import com.acheron.backend.specification.OrderSpecification;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Tag(name = "Map", description = "Map data API — per-county aggregated data, GeoJSON orders, boundary layers, CSV preview")
@RestController
@RequestMapping("/map")
@RequiredArgsConstructor
public class MapApi {

    private final OrderRepository orderRepository;
    private final GeoJsonTaxService geoJsonTaxService;
    private final DashboardService dashboardService;

    @Operation(
            summary = "Get per-county aggregated map data (cached)",
            description = """
                    Returns per-county aggregated data for map visualization (cached for 10 minutes).
                    Each entry includes:
                    - **county** — county name
                    - **order_count** — number of orders in this county
                    - **total_subtotal** — sum of subtotals (netto)
                    - **total_tax** — sum of tax amounts
                    - **total_revenue** — sum of totals (brutto)
                    - **average_tax_rate** — average composite tax rate
                    - **average_order_value** — average total per order
                    
                    Sorted by order count descending. Use `POST /dashboard/cache/evict` to force refresh."""
    )
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Per-county aggregated data"))
    @GetMapping("/counties")
    public ResponseEntity<List<MapCountyResponse>> getCountyData() {
        return ResponseEntity.ok(dashboardService.getMapCountyData());
    }

    @Operation(summary = "Get orders as GeoJSON with filters + aggregate summary",
            description = """
                    Returns orders as a GeoJSON FeatureCollection with rich filtering:
                    - **Bounding box**: minLat/maxLat/minLon/maxLon for viewport loading
                    - **Subtotal range**: minSubtotal/maxSubtotal
                    - **Tax rate range**: minTaxRate/maxTaxRate (composite rate, e.g. 0.08)
                    - **Date range**: from/to (ISO datetime)
                    - **Limit**: max features returned (default 10000)
                    
                    Response includes `summary` with aggregate totals for the filtered set.""")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "GeoJSON FeatureCollection with summary"))
    @GetMapping(value = "/orders", produces = "application/geo+json")
    public ResponseEntity<Map<String, Object>> getOrdersGeoJson(
            @Parameter(description = "Min latitude (bounding box)") @RequestParam(required = false) BigDecimal minLat,
            @Parameter(description = "Max latitude (bounding box)") @RequestParam(required = false) BigDecimal maxLat,
            @Parameter(description = "Min longitude (bounding box)") @RequestParam(required = false) BigDecimal minLon,
            @Parameter(description = "Max longitude (bounding box)") @RequestParam(required = false) BigDecimal maxLon,
            @Parameter(description = "Min subtotal filter") @RequestParam(required = false) BigDecimal minSubtotal,
            @Parameter(description = "Max subtotal filter") @RequestParam(required = false) BigDecimal maxSubtotal,
            @Parameter(description = "Min composite tax rate (e.g. 0.04)") @RequestParam(required = false) BigDecimal minTaxRate,
            @Parameter(description = "Max composite tax rate (e.g. 0.09)") @RequestParam(required = false) BigDecimal maxTaxRate,
            @Parameter(description = "From date (ISO, e.g. 2024-01-01T00:00:00)") @RequestParam(required = false) LocalDateTime from,
            @Parameter(description = "To date (ISO, e.g. 2024-12-31T23:59:59)") @RequestParam(required = false) LocalDateTime to,
            @Parameter(description = "Max features to return (default 10000)") @RequestParam(defaultValue = "10000") int limit
    ) {
        Specification<Order> spec = Specification
                .where(OrderSpecification.hasMinLatitude(minLat))
                .and(OrderSpecification.hasMaxLatitude(maxLat))
                .and(OrderSpecification.hasMinLongitude(minLon))
                .and(OrderSpecification.hasMaxLongitude(maxLon))
                .and(OrderSpecification.hasMinSubtotal(minSubtotal))
                .and(OrderSpecification.hasMaxSubtotal(maxSubtotal))
                .and(OrderSpecification.hasMinTaxRate(minTaxRate))
                .and(OrderSpecification.hasMaxTaxRate(maxTaxRate))
                .and(OrderSpecification.orderedAfter(from))
                .and(OrderSpecification.orderedBefore(to));

        List<Order> orders = orderRepository.findAll(spec);

        if (orders.size() > limit) {
            orders = orders.subList(0, limit);
        }

        return ResponseEntity.ok(toGeoJsonWithSummary(orders));
    }

    @Operation(summary = "Get NY county boundaries GeoJSON")
    @GetMapping(value = "/boundaries/counties", produces = "application/geo+json")
    public ResponseEntity<byte[]> getCountyBoundaries() throws IOException {
        return serveBoundaryFile("data/new-york-counties.geojson");
    }

    @Operation(summary = "Get NYC borough boundaries GeoJSON")
    @GetMapping(value = "/boundaries/boroughs", produces = "application/geo+json")
    public ResponseEntity<byte[]> getBoroughBoundaries() throws IOException {
        return serveBoundaryFile("data/new-york-city-boroughs.geojson");
    }

    @Operation(summary = "Preview CSV points on map (no save)",
            description = "Parses CSV → GeoJSON points for map preview. Does NOT persist. Includes point count and subtotal sum.")
    @PostMapping(value = "/csv-preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = "application/geo+json")
    public ResponseEntity<Map<String, Object>> previewCsvOnMap(
            @Parameter(description = "CSV file: id, longitude, latitude, timestamp, subtotal")
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty");
        }

        List<Map<String, Object>> features = new ArrayList<>();
        BigDecimal totalSubtotal = BigDecimal.ZERO;
        int lineNum = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8), 65536)) {

            reader.readLine();

            String line;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                if (line.isBlank()) continue;

                String[] fields = line.split(",", -1);
                if (fields.length < 5) continue;

                try {
                    double lon = Double.parseDouble(fields[1].trim());
                    double lat = Double.parseDouble(fields[2].trim());
                    BigDecimal subtotal = new BigDecimal(fields[4].trim());
                    totalSubtotal = totalSubtotal.add(subtotal);

                    Map<String, Object> properties = new LinkedHashMap<>();
                    properties.put("csvId", fields[0].trim());
                    properties.put("subtotal", subtotal);
                    properties.put("timestamp", fields[3].trim());
                    properties.put("lineNumber", lineNum);

                    features.add(toPointFeature(lat, lon, properties));
                } catch (NumberFormatException ignored) {
                }
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read CSV: " + e.getMessage(), e);
        }

        Map<String, Object> fc = new LinkedHashMap<>();
        fc.put("type", "FeatureCollection");
        fc.put("totalPoints", features.size());
        fc.put("totalSubtotal", totalSubtotal);
        fc.put("features", features);

        return ResponseEntity.ok(fc);
    }

    @Operation(summary = "Get GeoJSON tax calc cache stats")
    @GetMapping("/cache/stats")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        return ResponseEntity.ok(Map.of("geoTaxCacheSize", geoJsonTaxService.getCacheSize()));
    }

    @Operation(summary = "Clear GeoJSON tax calc cache")
    @PostMapping("/cache/clear")
    public ResponseEntity<Map<String, String>> clearCache() {
        geoJsonTaxService.clearCache();
        return ResponseEntity.ok(Map.of("message", "GeoJSON tax cache cleared"));
    }

    private Map<String, Object> toGeoJsonWithSummary(List<Order> orders) {
        List<Map<String, Object>> features = new ArrayList<>(orders.size());
        for (Order order : orders) {
            features.add(orderToFeature(order));
        }

        Map<String, Object> fc = new LinkedHashMap<>();
        fc.put("type", "FeatureCollection");
        fc.put("totalFeatures", features.size());
        fc.put("summary", computeSummary(orders));
        fc.put("features", features);
        return fc;
    }

    private Map<String, Object> computeSummary(List<Order> orders) {
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal totalSubtotal = BigDecimal.ZERO;
        BigDecimal minSub = null;
        BigDecimal maxSub = null;

        for (Order o : orders) {
            totalRevenue = totalRevenue.add(o.getTotalAmount());
            totalTax = totalTax.add(o.getTaxAmount());
            totalSubtotal = totalSubtotal.add(o.getSubtotal());

            if (minSub == null || o.getSubtotal().compareTo(minSub) < 0) minSub = o.getSubtotal();
            if (maxSub == null || o.getSubtotal().compareTo(maxSub) > 0) maxSub = o.getSubtotal();
        }

        int count = orders.size();
        BigDecimal avgOrderValue = count > 0
                ? totalRevenue.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalOrders", count);
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalTax", totalTax);
        summary.put("totalSubtotal", totalSubtotal);
        summary.put("averageOrderValue", avgOrderValue);
        summary.put("minSubtotal", minSub);
        summary.put("maxSubtotal", maxSub);
        return summary;
    }

    private Map<String, Object> orderToFeature(Order order) {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("id", order.getId());
        properties.put("subtotal", order.getSubtotal());
        properties.put("taxAmount", order.getTaxAmount());
        properties.put("totalAmount", order.getTotalAmount());
        properties.put("compositeTaxRate", order.getCompositeTaxRate());
        properties.put("isWithinNewYork", order.getIsWithinNewYork());
        properties.put("orderedAt", order.getOrderedAt());

        if (order.getTaxBreakdown() != null) {
            Map<String, Object> breakdown = new LinkedHashMap<>();
            breakdown.put("stateRate", order.getTaxBreakdown().getStateRate());
            breakdown.put("countyRate", order.getTaxBreakdown().getCountyRate());
            breakdown.put("cityRate", order.getTaxBreakdown().getCityRate());
            breakdown.put("specialRates", order.getTaxBreakdown().getSpecialRates());
            breakdown.put("jurisdictions", order.getTaxBreakdown().getJurisdictions());
            properties.put("taxBreakdown", breakdown);
        }

        return toPointFeature(
                order.getLatitude().doubleValue(),
                order.getLongitude().doubleValue(),
                properties
        );
    }

    private Map<String, Object> toPointFeature(double lat, double lon, Map<String, Object> properties) {
        Map<String, Object> geometry = new LinkedHashMap<>();
        geometry.put("type", "Point");
        geometry.put("coordinates", List.of(lon, lat));

        Map<String, Object> feature = new LinkedHashMap<>();
        feature.put("type", "Feature");
        feature.put("geometry", geometry);
        feature.put("properties", properties);
        return feature;
    }

    private ResponseEntity<byte[]> serveBoundaryFile(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        byte[] content = resource.getInputStream().readAllBytes();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/geo+json"))
                .body(content);
    }
}
