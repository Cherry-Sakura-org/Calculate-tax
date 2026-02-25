package com.acheron.backend.api;

import com.acheron.backend.entity.TaxLocality;
import com.acheron.backend.service.TaxLocalityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Tag(name = "Tax Localities", description = "Manage NY State tax locality data — rates, counties, special districts")
@RestController
@RequestMapping("/tax-localities")
@RequiredArgsConstructor
public class TaxLocalityApi {

    private final TaxLocalityService taxLocalityService;

    @Operation(summary = "Get all tax localities", description = "Returns all NY State tax localities with rates, reporting codes, and district flags. Cached for 24h.")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "List of tax localities"))
    @GetMapping
    public ResponseEntity<List<TaxLocality>> getAllTaxLocalities() {
        return ResponseEntity.ok(taxLocalityService.getAllLocalities());
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
