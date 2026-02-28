package com.acheron.backend.api;

import com.acheron.backend.entity.TaxLocality;
import com.acheron.backend.service.TaxLocalityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "Tax Localities", description = "Manage NY State tax locality data — rates, counties, special districts")
@RestController
@RequestMapping("/tax-localities")
@RequiredArgsConstructor
public class TaxLocalityApi {

    private final TaxLocalityService taxLocalityService;

    @Operation(summary = "Get all tax localities (paginated)",
            description = "Returns paginated NY State tax localities with rates, reporting codes, and district flags. "
                    + "Use `page`, `size`, `sort` query params (e.g. `?page=0&size=20&sort=locality,asc`).")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Paginated list of tax localities"))
    @GetMapping
    public ResponseEntity<Page<TaxLocality>> getAllTaxLocalities(
            @Parameter(description = "Pagination parameters (page, size, sort)")
            @PageableDefault(size = 20, sort = "locality") Pageable pageable
    ) {
        return ResponseEntity.ok(taxLocalityService.getAllLocalities(pageable));
    }

    @Operation(summary = "Find tax locality by name", description = "Lookup a specific locality by name (case-insensitive, normalizes county suffixes and NYC borough aliases).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tax locality found"),
            @ApiResponse(responseCode = "404", description = "Locality not found")
    })
    @GetMapping("/{locality}")
    public ResponseEntity<TaxLocality> getTaxLocality(@PathVariable String locality) {
        return taxLocalityService.findByLocality(locality)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Reload tax localities from built-in JSON",
            description = "Deletes ALL existing tax localities and reloads from the bundled ny-tax-localities.json file. Clears all caches.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reloaded successfully"),
            @ApiResponse(responseCode = "500", description = "Failed to reload")
    })
    @PostMapping("/reload")
    public ResponseEntity<Map<String, Object>> reloadFromJson() {
        try {
            taxLocalityService.loadTaxLocalitiesFromJson();
            long count = taxLocalityService.getAllLocalities().size();

            return ResponseEntity.ok(Map.of(
                    "message", "Tax localities reloaded successfully (full replace)",
                    "count", count
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Import tax localities from custom JSON body",
            description = "Deletes ALL existing tax localities and replaces them with the provided JSON array. Clears all caches.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Imported successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid JSON")
    })
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importFromJson(@RequestBody String jsonContent) {
        try {
            taxLocalityService.saveTaxLocalitiesFromJson(jsonContent);
            long count = taxLocalityService.getAllLocalities().size();

            return ResponseEntity.ok(Map.of(
                    "message", "Tax localities imported successfully (full replace)",
                    "count", count
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Get current tax rates with effective date",
            description = """
                    Returns all tax localities with the current effective date.
                    This endpoint provides the latest tax rate data as loaded in the system.
                    Use `POST /tax-localities/reload` to refresh from the bundled JSON file.""")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Current tax rates returned"))
    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentTaxRates() {
        List<TaxLocality> localities = taxLocalityService.getAllLocalities();
        return ResponseEntity.ok(Map.of(
                "effectiveDate", LocalDate.now(),
                "totalLocalities", localities.size(),
                "localities", localities
        ));
    }

    @Operation(summary = "Create a single tax locality")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<TaxLocality> createTaxLocality(@RequestBody TaxLocality locality) {
        TaxLocality saved = taxLocalityService.saveTaxLocality(locality);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @Operation(summary = "Delete a tax locality by name")
    @DeleteMapping("/{locality}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteTaxLocality(@PathVariable String locality) {
        taxLocalityService.deleteTaxLocality(locality);
        return ResponseEntity.noContent().build();
    }
}
