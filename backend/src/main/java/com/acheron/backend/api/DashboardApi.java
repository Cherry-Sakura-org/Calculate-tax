package com.acheron.backend.api;

import com.acheron.backend.dto.response.DashboardResponse;
import com.acheron.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Dashboard", description = "Aggregated statistics for the dashboard — cached with 10min TTL")
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardApi {

    private final DashboardService dashboardService;

    @Operation(
            summary = "Get dashboard statistics",
            description = """
                    Returns aggregated dashboard stats (cached in-memory for 10 minutes):
                    
                    **Overview metrics:**
                    
                    - `total_orders` — total number of orders
                    
                    - `valid_orders` / `invalid_orders` — within NY vs outside
                    
                    - `total_subtotal` — sum of all subtotals (before tax, netto)
                    
                    - `total_tax` — sum of all tax amounts
                    
                    - `total_revenue` — sum of all totals (after tax, brutto)
                    
                    - `average_order_value` — revenue / order count
                    
                    - `average_tax_rate` — average composite tax rate for valid orders
                    
                    - `min_subtotal` / `max_subtotal` — subtotal range
                    
                    **Breakdowns:**
                    
                    - `top_counties` — top 10 counties by order count with subtotal & revenue
                    
                    - `region_breakdown` — per-region stats (NYC, Long Island, Hudson Valley, Capital District, Upstate) with order count, revenue, and avg tax rate
                    
                    - `tax_rate_distribution` — order count grouped by tax rate buckets (< 4%, 4-7%, 7-8%, 8-9%, >= 9%)
                    
                    Use `POST /dashboard/cache/evict` to force a refresh."""
    )
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Dashboard stats retrieved"))
    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @Operation(summary = "Evict dashboard & map caches",
            description = "Clears the cached dashboard and map data. Next request will recompute from DB.")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Caches evicted"))
    @PostMapping("/cache/evict")
    public ResponseEntity<Map<String, String>> evictCaches() {
        dashboardService.evictAllCaches();
        return ResponseEntity.ok(Map.of("message", "Dashboard and map caches evicted"));
    }
}
