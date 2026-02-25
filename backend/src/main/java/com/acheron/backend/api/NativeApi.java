package com.acheron.backend.api;

import com.acheron.backend.service.NativeImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Native Import", description = "High-performance native CSV import with GeoJSON tax calculation (~11k records/sec)")
@RestController
@RequestMapping("/api/v1/native")
@RequiredArgsConstructor
public class NativeApi {

    private final NativeImportService nativeImportService;

    @Operation(
            summary = "Import orders from CSV (native)",
            description = "High-performance CSV import using virtual threads and native GeoJSON point-in-polygon tax calculation. "
                    + "No external API calls. Processes ~11k records/sec. "
                    + "CSV columns: id, longitude, latitude, timestamp, subtotal"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Import completed",
                    content = @Content(schema = @Schema(implementation = NativeImportService.ImportResult.class))),
            @ApiResponse(responseCode = "400", description = "Invalid CSV file",
                    content = @Content)
    })
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NativeImportService.ImportResult> importCsv(
            @Parameter(description = "CSV file with columns: id, longitude, latitude, timestamp, subtotal")
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            throw new IllegalArgumentException("File must be a CSV file");
        }

        NativeImportService.ImportResult result = nativeImportService.importCsv(file);
        return ResponseEntity.ok(result);
    }
}
