package com.acheron.backend.api;

import com.acheron.backend.dto.batch.BatchJobExecutionResult;
import com.acheron.backend.dto.request.OrderRequest;
import com.acheron.backend.dto.response.OrderResponse;
import com.acheron.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Orders", description = "Order management API with tax calculation and geocoding")
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderApi {
    private final OrderService orderService;

    @Operation(
            summary = "Get all orders",
            description = "Retrieves a paginated list of orders sorted by total amount"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @Parameter(description = "Pagination parameters (page, size, sort)")
            @PageableDefault(size = 20, sort = "totalAmount") Pageable pageable
    ) {
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    @Operation(
            summary = "Create new order",
            description = "Creates a new order with automatic tax calculation based on coordinates. Validates that the location is within New York State and calculates appropriate state, county, and city taxes."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Order created successfully",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request or location outside NY State",
                    content = @Content),
            @ApiResponse(responseCode = "500", description = "Geocoding or tax calculation failed",
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

    @Deprecated
    @Operation(
            summary = "Import orders from CSV (Deprecated)",
            description = "Synchronous CSV import. **Deprecated:** Use /api/v1/orders/import for async processing with real-time progress tracking.",
            deprecated = true
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Import completed",
                    content = @Content(schema = @Schema(implementation = BatchJobExecutionResult.class))),
            @ApiResponse(responseCode = "400", description = "Invalid CSV file",
                    content = @Content)
    })
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BatchJobExecutionResult> importOrdersFromCsv(
            @Parameter(description = "CSV file with columns: latitude, longitude, subtotal, timestamp")
            @RequestParam("file") MultipartFile file
    ) {
        BatchJobExecutionResult result = orderService.importFromCsv(file);
        return ResponseEntity.ok(result);
    }
}
