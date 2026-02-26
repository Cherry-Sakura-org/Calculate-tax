package com.acheron.backend.api;

import com.acheron.backend.dto.response.ImportFileResponse;
import com.acheron.backend.repository.ImportFileRepository;
import com.acheron.backend.service.NativeImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Tag(name = "Orders", description = "Order management API with native GeoJSON tax calculation")
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class NativeApi {

    private final NativeImportService nativeImportService;
    private final ImportFileRepository importFileRepository;

    @Operation(
            summary = "Import orders from one or more CSV files",
            description = """
                    High-performance CSV import using virtual threads and native GeoJSON point-in-polygon tax calculation.
                    No external API calls. Processes ~11k records/sec.
                    
                    Accepts **one or more** CSV files. Each file is processed independently.
                    
                    CSV columns: `id, longitude, latitude, timestamp, subtotal`
                    
                    Response includes per-file results with:
                    - **importFileId** — UUID of the persisted import file record
                    - **outOfNyRecords** — count of rows outside New York State
                    - **outOfNyRows** — first 200 out-of-NY rows with coordinates (for review)
                    - **errors** — first 100 parse/save errors with line numbers"""
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Import completed",
                    content = @Content(schema = @Schema(implementation = NativeImportService.ImportResult.class))),
            @ApiResponse(responseCode = "400", description = "Invalid CSV file",
                    content = @Content)
    })
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<NativeImportService.ImportResult>> importCsv(
            @Parameter(description = "One or more CSV files with columns: id, longitude, latitude, timestamp, subtotal")
            @RequestParam("file") List<MultipartFile> files
    ) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("At least one CSV file is required");
        }

        List<NativeImportService.ImportResult> results = new ArrayList<>(files.size());

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("CSV file is empty: " + file.getOriginalFilename());
            }
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
                throw new IllegalArgumentException("File must be a CSV file: " + filename);
            }
            results.add(nativeImportService.importCsv(file));
        }

        return ResponseEntity.ok(results);
    }

    @Operation(
            summary = "List all import files (paginated)",
            description = """
                    Returns a paginated list of all imported CSV files, sorted by import date descending.
                    Each entry includes file metadata, record counts (total, success, failed, out-of-NY), and processing stats."""
    )
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Import files retrieved"))
    @GetMapping("/import-files")
    public ResponseEntity<Page<ImportFileResponse>> listImportFiles(
            @Parameter(description = "Pagination (page, size, sort)")
            @PageableDefault(size = 20, sort = "importedAt") Pageable pageable
    ) {
        return ResponseEntity.ok(
                importFileRepository.findAllByOrderByImportedAtDesc(pageable)
                        .map(ImportFileResponse::fromEntity)
        );
    }
}
