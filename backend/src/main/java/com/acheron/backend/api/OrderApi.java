package com.acheron.backend.api;

import com.acheron.backend.dto.request.OrderRequest;
import com.acheron.backend.dto.response.OrderResponse;
import com.acheron.backend.entity.Order;
import com.acheron.backend.service.OrderService;
import com.acheron.backend.specification.OrderSpecification;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.acheron.backend.entity.OrderTaxBreakdown;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Tag(name = "Orders", description = "Order management API with native GeoJSON tax calculation")
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderApi {
    private final OrderService orderService;

    @Operation(
            summary = "Get all orders (filtered + paginated)",
            description = """
                    Retrieves a paginated list of orders with optional filters.
                    
                    **Pagination** (query params):
                    
                    - `page` — page number (0-indexed, default 0)
                    
                    - `size` — page size (default 20)
                    
                    - `sort` — sort field + direction, e.g. `sort=totalAmount,desc`
                    
                    **Filters** (all optional):
                    
                    - `minLat` / `maxLat` — bounding box latitude range
                    
                    - `minLon` / `maxLon` — bounding box longitude range
                    
                    - `minSubtotal` / `maxSubtotal` — subtotal range (before tax)
                    
                    - `minTotal` / `maxTotal` — total amount range (after tax)
                    
                    - `minTaxRate` / `maxTaxRate` — composite tax rate range (e.g. 0.04 to 0.09)
                    
                    - `from` / `to` — date range (ISO 8601, e.g. `2024-01-01T00:00:00`)
                    
                    - `withinNewYork` — `true` = valid NY orders only, `false` = out-of-state only
                    
                    - `counties` — filter by county names (comma-separated, case-insensitive, e.g. `Suffolk,Nassau`)

                    - `regions` — filter by regions (comma-separated): `NYC`, `Long Island`, `Hudson Valley`, `Capital District`, `Upstate`, `Out of State`

                    - `manualOnly` — `true` = only manually created orders (no import file), `false` = only imported orders

                    - `importFileId` — filter by import file UUID

                    - `importFileIds` — filter by multiple import file UUIDs (comma-separated)

                    **Example**: `GET /orders?page=0&size=10&sort=orderedAt,desc&withinNewYork=true&counties=Suffolk,Nassau&manualOnly=true`"""
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class)))
    })
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @Parameter(description = "Pagination (page, size, sort)")
            @PageableDefault(size = 20, sort = "totalAmount") Pageable pageable,

            @Parameter(description = "Min latitude (bounding box)") @RequestParam(required = false) BigDecimal minLat,
            @Parameter(description = "Max latitude (bounding box)") @RequestParam(required = false) BigDecimal maxLat,
            @Parameter(description = "Min longitude (bounding box)") @RequestParam(required = false) BigDecimal minLon,
            @Parameter(description = "Max longitude (bounding box)") @RequestParam(required = false) BigDecimal maxLon,
            @Parameter(description = "Min subtotal (before tax)") @RequestParam(required = false) BigDecimal minSubtotal,
            @Parameter(description = "Max subtotal (before tax)") @RequestParam(required = false) BigDecimal maxSubtotal,
            @Parameter(description = "Min total amount (after tax)") @RequestParam(required = false) BigDecimal minTotal,
            @Parameter(description = "Max total amount (after tax)") @RequestParam(required = false) BigDecimal maxTotal,
            @Parameter(description = "Min composite tax rate (e.g. 0.04)") @RequestParam(required = false) BigDecimal minTaxRate,
            @Parameter(description = "Max composite tax rate (e.g. 0.09)") @RequestParam(required = false) BigDecimal maxTaxRate,
            @Parameter(description = "From date (ISO 8601)") @RequestParam(required = false) LocalDateTime from,
            @Parameter(description = "To date (ISO 8601)") @RequestParam(required = false) LocalDateTime to,
            @Parameter(description = "Filter by NY validity: true = within NY, false = outside NY", schema = @Schema(type = "boolean")) @RequestParam(required = false) Boolean withinNewYork,
            @Parameter(description = "Filter by county names (comma-separated, case-insensitive)") @RequestParam(required = false) List<String> counties,
            @Parameter(description = "Filter by regions (comma-separated)") @RequestParam(required = false) List<String> regions,
            @Parameter(description = "Filter: true = manual orders only, false = imported only") @RequestParam(required = false) Boolean manualOnly,
            @Parameter(description = "Filter by import file UUID") @RequestParam(required = false) UUID importFileId,
            @Parameter(description = "Filter by multiple import file UUIDs") @RequestParam(required = false) List<UUID> importFileIds,
            @Parameter(description = "Filter by user UUID (SUPER_ADMIN only)") @RequestParam(required = false) UUID userId
    ) {
        Specification<Order> spec = Specification.where(OrderSpecification.hasMinLatitude(minLat))
                .and(OrderSpecification.hasMaxLatitude(maxLat))
                .and(OrderSpecification.hasMinLongitude(minLon))
                .and(OrderSpecification.hasMaxLongitude(maxLon))
                .and(OrderSpecification.hasMinSubtotal(minSubtotal))
                .and(OrderSpecification.hasMaxSubtotal(maxSubtotal))
                .and(OrderSpecification.hasMinTotalAmount(minTotal))
                .and(OrderSpecification.hasMaxTotalAmount(maxTotal))
                .and(OrderSpecification.hasMinTaxRate(minTaxRate))
                .and(OrderSpecification.hasMaxTaxRate(maxTaxRate))
                .and(OrderSpecification.orderedAfter(from))
                .and(OrderSpecification.orderedBefore(to))
                .and(OrderSpecification.isWithinNewYork(withinNewYork))
                .and(OrderSpecification.hasCounties(counties))
                .and(OrderSpecification.hasRegions(regions))
                .and(OrderSpecification.isManualOrder(manualOnly))
                .and(OrderSpecification.hasImportFileId(importFileId))
                .and(OrderSpecification.hasImportFileIds(importFileIds));

        return ResponseEntity.ok(orderService.getAllOrdersForCurrentUser(spec, pageable, userId));
    }

    @Operation(
            summary = "Export orders as CSV",
            description = """
                    Downloads the orders table as a CSV file.
                    Supports **all the same filters** as `GET /orders`.
                    
                    The CSV includes columns:
                    `id, latitude, longitude, subtotal, composite_tax_rate, tax_amount, total_amount,
                    ordered_at, is_within_new_york, county, region, state_rate, county_rate, city_rate,
                    special_rates, jurisdictions`
                    
                    **Example**: `GET /orders/export?withinNewYork=true&county=Suffolk`"""
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "CSV file streamed",
                    content = @Content(mediaType = "text/csv")),
            @ApiResponse(responseCode = "500", description = "Error generating CSV")
    })
    @GetMapping(value = "/export", produces = "text/csv")
    public void exportOrdersCsv(
            @Parameter(description = "Min latitude") @RequestParam(required = false) BigDecimal minLat,
            @Parameter(description = "Max latitude") @RequestParam(required = false) BigDecimal maxLat,
            @Parameter(description = "Min longitude") @RequestParam(required = false) BigDecimal minLon,
            @Parameter(description = "Max longitude") @RequestParam(required = false) BigDecimal maxLon,
            @Parameter(description = "Min subtotal") @RequestParam(required = false) BigDecimal minSubtotal,
            @Parameter(description = "Max subtotal") @RequestParam(required = false) BigDecimal maxSubtotal,
            @Parameter(description = "Min total") @RequestParam(required = false) BigDecimal minTotal,
            @Parameter(description = "Max total") @RequestParam(required = false) BigDecimal maxTotal,
            @Parameter(description = "Min tax rate") @RequestParam(required = false) BigDecimal minTaxRate,
            @Parameter(description = "Max tax rate") @RequestParam(required = false) BigDecimal maxTaxRate,
            @Parameter(description = "From date (ISO 8601)") @RequestParam(required = false) LocalDateTime from,
            @Parameter(description = "To date (ISO 8601)") @RequestParam(required = false) LocalDateTime to,
            @Parameter(description = "Within New York", schema = @Schema(type = "boolean")) @RequestParam(required = false) Boolean withinNewYork,
            @Parameter(description = "Filter by county names (comma-separated)") @RequestParam(required = false) List<String> counties,
            @Parameter(description = "Filter by regions (comma-separated)") @RequestParam(required = false) List<String> regions,
            @Parameter(description = "Filter: true = manual orders only, false = imported only") @RequestParam(required = false) Boolean manualOnly,
            @Parameter(description = "Import file UUID") @RequestParam(required = false) UUID importFileId,
            @Parameter(description = "Filter by multiple import file UUIDs") @RequestParam(required = false) List<UUID> importFileIds,
            @Parameter(description = "Filter by user UUID (SUPER_ADMIN only)") @RequestParam(required = false) UUID userId,
            HttpServletResponse response
    ) throws IOException {
        Specification<Order> spec = Specification.where(OrderSpecification.hasMinLatitude(minLat))
                .and(OrderSpecification.hasMaxLatitude(maxLat))
                .and(OrderSpecification.hasMinLongitude(minLon))
                .and(OrderSpecification.hasMaxLongitude(maxLon))
                .and(OrderSpecification.hasMinSubtotal(minSubtotal))
                .and(OrderSpecification.hasMaxSubtotal(maxSubtotal))
                .and(OrderSpecification.hasMinTotalAmount(minTotal))
                .and(OrderSpecification.hasMaxTotalAmount(maxTotal))
                .and(OrderSpecification.hasMinTaxRate(minTaxRate))
                .and(OrderSpecification.hasMaxTaxRate(maxTaxRate))
                .and(OrderSpecification.orderedAfter(from))
                .and(OrderSpecification.orderedBefore(to))
                .and(OrderSpecification.isWithinNewYork(withinNewYork))
                .and(OrderSpecification.hasCounties(counties))
                .and(OrderSpecification.hasRegions(regions))
                .and(OrderSpecification.isManualOrder(manualOnly))
                .and(OrderSpecification.hasImportFileId(importFileId))
                .and(OrderSpecification.hasImportFileIds(importFileIds));

        List<Order> orders = orderService.getAllOrdersListForCurrentUser(spec, userId);

        String filename = "orders-export-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HHmmss")) + ".csv";
        response.setContentType("text/csv");
        response.setCharacterEncoding("UTF-8");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
        response.setHeader(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION);

        try (PrintWriter writer = response.getWriter()) {
            writer.println("id,latitude,longitude,subtotal,composite_tax_rate,tax_amount,total_amount," +
                    "ordered_at,is_within_new_york,county,region,state_rate,county_rate,city_rate,special_rates,jurisdictions");

            for (Order order : orders) {
                OrderTaxBreakdown tb = order.getTaxBreakdown();
                writer.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,\"%s\"%n",
                        order.getId(),
                        order.getLatitude(),
                        order.getLongitude(),
                        order.getSubtotal(),
                        order.getCompositeTaxRate(),
                        order.getTaxAmount(),
                        order.getTotalAmount(),
                        order.getOrderedAt(),
                        order.getIsWithinNewYork(),
                        csvSafe(order.getCounty()),
                        csvSafe(order.getRegion()),
                        tb != null ? tb.getStateRate() : "",
                        tb != null ? tb.getCountyRate() : "",
                        tb != null ? tb.getCityRate() : "",
                        tb != null ? tb.getSpecialRates() : "",
                        tb != null && tb.getJurisdictions() != null ? String.join("; ", tb.getJurisdictions()) : ""
                );
            }
        }
    }

    private static String csvSafe(String value) {
        return value != null ? value : "";
    }

    @Operation(
            summary = "Create new order",
            description = "Creates a new order with automatic tax calculation based on coordinates using native GeoJSON point-in-polygon lookup. No external API calls."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Order created successfully",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request or location outside NY State",
                    content = @Content)
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<OrderResponse> createOrder(
            @Parameter(description = "Order details with latitude, longitude, and subtotal")
            @Valid @RequestBody OrderRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @Operation(
            summary = "Delete orders by filter",
            description = """
                    Soft-deletes all orders matching the provided filters.
                    Supports **all the same filters** as `GET /orders`.
                    Returns the count of deleted orders."""
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders deleted"),
            @ApiResponse(responseCode = "400", description = "No filters provided")
    })
    @DeleteMapping("/by-filter")
    public ResponseEntity<java.util.Map<String, Object>> deleteByFilter(
            @Parameter(description = "Min latitude") @RequestParam(required = false) BigDecimal minLat,
            @Parameter(description = "Max latitude") @RequestParam(required = false) BigDecimal maxLat,
            @Parameter(description = "Min longitude") @RequestParam(required = false) BigDecimal minLon,
            @Parameter(description = "Max longitude") @RequestParam(required = false) BigDecimal maxLon,
            @Parameter(description = "Min subtotal") @RequestParam(required = false) BigDecimal minSubtotal,
            @Parameter(description = "Max subtotal") @RequestParam(required = false) BigDecimal maxSubtotal,
            @Parameter(description = "Min total") @RequestParam(required = false) BigDecimal minTotal,
            @Parameter(description = "Max total") @RequestParam(required = false) BigDecimal maxTotal,
            @Parameter(description = "Min tax rate") @RequestParam(required = false) BigDecimal minTaxRate,
            @Parameter(description = "Max tax rate") @RequestParam(required = false) BigDecimal maxTaxRate,
            @Parameter(description = "From date (ISO 8601)") @RequestParam(required = false) LocalDateTime from,
            @Parameter(description = "To date (ISO 8601)") @RequestParam(required = false) LocalDateTime to,
            @Parameter(description = "Within New York", schema = @Schema(type = "boolean")) @RequestParam(required = false) Boolean withinNewYork,
            @Parameter(description = "Filter by county names (comma-separated)") @RequestParam(required = false) List<String> counties,
            @Parameter(description = "Filter by regions (comma-separated)") @RequestParam(required = false) List<String> regions,
            @Parameter(description = "Filter: true = manual orders only, false = imported only") @RequestParam(required = false) Boolean manualOnly,
            @Parameter(description = "Import file UUID") @RequestParam(required = false) UUID importFileId,
            @Parameter(description = "Filter by multiple import file UUIDs") @RequestParam(required = false) List<UUID> importFileIds,
            @Parameter(description = "Filter by user UUID (SUPER_ADMIN only)") @RequestParam(required = false) UUID userId
    ) {
        Specification<Order> spec = Specification.where(OrderSpecification.hasMinLatitude(minLat))
                .and(OrderSpecification.hasMaxLatitude(maxLat))
                .and(OrderSpecification.hasMinLongitude(minLon))
                .and(OrderSpecification.hasMaxLongitude(maxLon))
                .and(OrderSpecification.hasMinSubtotal(minSubtotal))
                .and(OrderSpecification.hasMaxSubtotal(maxSubtotal))
                .and(OrderSpecification.hasMinTotalAmount(minTotal))
                .and(OrderSpecification.hasMaxTotalAmount(maxTotal))
                .and(OrderSpecification.hasMinTaxRate(minTaxRate))
                .and(OrderSpecification.hasMaxTaxRate(maxTaxRate))
                .and(OrderSpecification.orderedAfter(from))
                .and(OrderSpecification.orderedBefore(to))
                .and(OrderSpecification.isWithinNewYork(withinNewYork))
                .and(OrderSpecification.hasCounties(counties))
                .and(OrderSpecification.hasRegions(regions))
                .and(OrderSpecification.isManualOrder(manualOnly))
                .and(OrderSpecification.hasImportFileId(importFileId))
                .and(OrderSpecification.hasImportFileIds(importFileIds));

        long deleted = orderService.deleteByFilter(spec, userId);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Orders deleted by filter",
                "deletedCount", deleted
        ));
    }

    @Operation(
            summary = "Delete orders by IDs",
            description = "Soft-deletes orders by a list of order UUIDs. Non-SUPER_ADMIN users can only delete their own orders."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders deleted"),
            @ApiResponse(responseCode = "400", description = "Empty ID list")
    })
    @DeleteMapping("/by-ids")
    public ResponseEntity<java.util.Map<String, Object>> deleteByIds(
            @RequestBody List<UUID> ids
    ) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("At least one order ID is required");
        }
        long deleted = orderService.deleteByIds(ids);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Orders deleted by IDs",
                "deletedCount", deleted
        ));
    }

    @Operation(
            summary = "Delete orders by CSV file",
            description = "Soft-deletes orders by uploading a CSV file with an `id` column containing order UUIDs."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders deleted"),
            @ApiResponse(responseCode = "400", description = "Invalid CSV format")
    })
    @DeleteMapping(value = "/by-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<java.util.Map<String, Object>> deleteByCsv(
            @RequestParam("file") MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is required");
        }

        List<UUID> ids = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String header = reader.readLine();
            if (header == null || header.isBlank()) {
                throw new IllegalArgumentException("CSV file is empty");
            }

            String[] columns = header.split(",");
            int idIndex = -1;
            for (int i = 0; i < columns.length; i++) {
                if ("id".equalsIgnoreCase(columns[i].trim())) {
                    idIndex = i;
                    break;
                }
            }
            if (idIndex < 0) {
                throw new IllegalArgumentException("CSV must have an 'id' column header");
            }

            String line;
            int lineNum = 1;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                if (line.isBlank()) continue;
                String[] fields = line.split(",", -1);
                if (fields.length <= idIndex) {
                    throw new IllegalArgumentException("Line " + lineNum + ": missing id column");
                }
                try {
                    ids.add(UUID.fromString(fields[idIndex].trim()));
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Line " + lineNum + ": invalid UUID '" + fields[idIndex].trim() + "'");
                }
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read CSV file: " + e.getMessage());
        }

        if (ids.isEmpty()) {
            throw new IllegalArgumentException("CSV file contains no order IDs");
        }

        long deleted = orderService.deleteByIds(ids);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Orders deleted by CSV",
                "deletedCount", deleted
        ));
    }

    @Operation(
            summary = "Delete orders by import file",
            description = "Soft-deletes all orders from a specific import file."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders deleted")
    })
    @DeleteMapping("/by-import-file/{importFileId}")
    public ResponseEntity<java.util.Map<String, Object>> deleteByImportFile(
            @PathVariable UUID importFileId
    ) {
        long deleted = orderService.deleteByImportFileId(importFileId);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Orders deleted for import file",
                "deletedCount", deleted
        ));
    }

    @Operation(
            summary = "⚠️ TEST: Delete ALL orders",
            description = "Hard-deletes ALL orders, tax breakdowns, and import files. This is a destructive test-only endpoint."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "All orders deleted"),
            @ApiResponse(responseCode = "500", description = "Error during deletion")
    })
    @DeleteMapping("/all")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> deleteAllOrders() {
        long deleted = orderService.deleteAllOrders();
        return ResponseEntity.ok(java.util.Map.of(
                "message", "All orders deleted",
                "deletedCount", deleted
        ));
    }
}
