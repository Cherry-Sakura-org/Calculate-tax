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

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Tag(name = "Orders", description = "Order management API with native GeoJSON tax calculation")
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderApi {
    private final OrderService orderService;
    private final com.acheron.backend.repository.OrderRepository orderRepository;

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
                    
                    - `county` — filter by county name (case-insensitive, e.g. `Suffolk`)
                    
                    - `region` — filter by region: `NYC`, `Long Island`, `Hudson Valley`, `Capital District`, `Upstate`, `Out of State`
                    
                    - `importFileId` — filter by import file UUID
                    
                    - `importFileIds` — filter by multiple import file UUIDs (comma-separated)
                    
                    **Example**: `GET /orders?page=0&size=10&sort=orderedAt,desc&withinNewYork=true&county=Suffolk`"""
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
            @Parameter(description = "Filter by county name (case-insensitive)") @RequestParam(required = false) String county,
            @Parameter(description = "Filter by region: NYC, Long Island, Hudson Valley, Capital District, Upstate, Out of State") @RequestParam(required = false) String region,
            @Parameter(description = "Filter by import file UUID") @RequestParam(required = false) UUID importFileId,
            @Parameter(description = "Filter by multiple import file UUIDs") @RequestParam(required = false) List<UUID> importFileIds
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
                .and(OrderSpecification.hasCounty(county))
                .and(OrderSpecification.hasRegion(region))
                .and(OrderSpecification.hasImportFileId(importFileId))
                .and(OrderSpecification.hasImportFileIds(importFileIds));

        return ResponseEntity.ok(orderService.getAllOrders(spec, pageable));
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
            @Parameter(description = "County name") @RequestParam(required = false) String county,
            @Parameter(description = "Region") @RequestParam(required = false) String region,
            @Parameter(description = "Import file UUID") @RequestParam(required = false) UUID importFileId,
            @Parameter(description = "Filter by multiple import file UUIDs") @RequestParam(required = false) List<UUID> importFileIds,
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
                .and(OrderSpecification.hasCounty(county))
                .and(OrderSpecification.hasRegion(region))
                .and(OrderSpecification.hasImportFileId(importFileId))
                .and(OrderSpecification.hasImportFileIds(importFileIds));

        List<Order> orders = orderRepository.findAll(spec);

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
}
