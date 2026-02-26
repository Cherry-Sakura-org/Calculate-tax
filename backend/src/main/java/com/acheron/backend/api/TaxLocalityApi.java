package com.acheron.backend.api;

import com.acheron.backend.entity.TaxLocality;
import com.acheron.backend.service.TaxLocalityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tax-localities")
@RequiredArgsConstructor
public class TaxLocalityApi {

    private final TaxLocalityService taxLocalityService;

    @GetMapping
    public ResponseEntity<List<TaxLocality>> getAllTaxLocalities() {
        return ResponseEntity.ok(taxLocalityService.getAllLocalities());
    }

    @GetMapping("/{locality}")
    public ResponseEntity<TaxLocality> getTaxLocality(@PathVariable String locality) {
        return taxLocalityService.findByLocality(locality)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/reload")
    public ResponseEntity<Map<String, Object>> reloadFromJson() {
        try {
            taxLocalityService.loadTaxLocalitiesFromJson();
            long count = taxLocalityService.getAllLocalities().size();
            
            return ResponseEntity.ok(Map.of(
                    "message", "Tax localities reloaded successfully",
                    "count", count
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importFromJson(@RequestBody String jsonContent) {
        try {
            taxLocalityService.saveTaxLocalitiesFromJson(jsonContent);
            long count = taxLocalityService.getAllLocalities().size();
            
            return ResponseEntity.ok(Map.of(
                    "message", "Tax localities imported successfully",
                    "count", count
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<TaxLocality> createTaxLocality(@RequestBody TaxLocality locality) {
        TaxLocality saved = taxLocalityService.saveTaxLocality(locality);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{locality}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteTaxLocality(@PathVariable String locality) {
        taxLocalityService.deleteTaxLocality(locality);
        return ResponseEntity.noContent().build();
    }
}
