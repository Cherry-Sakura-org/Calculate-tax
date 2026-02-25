package com.acheron.backend.batchforapi;

import com.acheron.backend.batchforapi.dto.BatchJobResponse;
import com.acheron.backend.batchforapi.entity.BatchImportError;
import com.acheron.backend.batchforapi.entity.BatchJobExecution;
import com.acheron.backend.batchforapi.repository.BatchImportErrorRepository;
import com.acheron.backend.batchforapi.repository.BatchJobExecutionRepository;
import com.acheron.backend.batchforapi.service.AsyncBatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.io.Serializable;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Tag(name = "Batch Import", description = "IGNORE!!! USE NATIVE IMPORT!!! Async CSV import with real-time progress tracking via SSE")
@Slf4j
@RestController
@RequestMapping("/api/v1/orders/import")
@RequiredArgsConstructor
public class BatchImportApi {
    
    private final AsyncBatchService asyncBatchService;
    private final BatchJobExecutionRepository jobExecutionRepository;
    private final BatchImportErrorRepository importErrorRepository;
    private final Map<Long, SseEmitter> activeEmitters = new ConcurrentHashMap<>();
    
    @Operation(
            summary = "Start async CSV import",
            description = "Queues a CSV file for asynchronous batch processing. Returns immediately with job ID for tracking progress via SSE."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Import job queued successfully",
                    content = @Content(schema = @Schema(example = "{\"message\": \"Import job queued successfully\", \"jobId\": 1, \"filename\": \"orders.csv\", \"status\": \"QUEUED\"}"))),
            @ApiResponse(responseCode = "400", description = "Invalid file or upload failed",
                    content = @Content)
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> startImport(
            @Parameter(description = "CSV file with columns: latitude, longitude, subtotal, timestamp", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        try {
            String originalFilename = file.getOriginalFilename();
            log.info("Received import request for file: {}", originalFilename);
            
            BatchJobExecution tracking = asyncBatchService.createTrackingRecord(originalFilename);
            Path tempFile = asyncBatchService.saveTempFile(file);
            
            asyncBatchService.executeImportJobAsync(tracking.getId(), tempFile, originalFilename);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Import job queued successfully",
                    "jobId", tracking.getId(),
                    "filename", originalFilename,
                    "status", "QUEUED"
            ));
            
        } catch (IOException e) {
            log.error("Failed to process upload: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to process file upload",
                    "message", e.getMessage()
            ));
        }
    }
    
    @Operation(
            summary = "Stream job status via SSE",
            description = "Establishes Server-Sent Events connection for real-time job progress updates. Auto-closes when job completes or fails. Updates every 1 second."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "SSE stream established",
                    content = @Content(mediaType = MediaType.TEXT_EVENT_STREAM_VALUE)),
            @ApiResponse(responseCode = "404", description = "Job not found",
                    content = @Content)
    })
    @GetMapping(value = "/status/{jobId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamJobStatus(
            @Parameter(description = "Job ID returned from start import", required = true)
            @PathVariable Long jobId
    ) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        activeEmitters.put(jobId, emitter);
        
        emitter.onCompletion(() -> activeEmitters.remove(jobId));
        emitter.onTimeout(() -> activeEmitters.remove(jobId));
        emitter.onError(e -> activeEmitters.remove(jobId));
        
        new Thread(() -> {
            try {
                while (activeEmitters.containsKey(jobId)) {
                    BatchJobExecution job = jobExecutionRepository.findById(jobId).orElse(null);
                    
                    if (job != null) {
                        emitter.send(SseEmitter.event()
                                .name("job-status")
                                .data(BatchJobResponse.fromEntity(job)));
                        
                        if (job.getStatus() == BatchJobExecution.JobStatus.COMPLETED ||
                            job.getStatus() == BatchJobExecution.JobStatus.FAILED) {
                            emitter.complete();
                            break;
                        }
                    }
                    
                    Thread.sleep(1000);
                }
            } catch (Exception e) {
                log.error("Error streaming job status: {}", e.getMessage());
                emitter.completeWithError(e);
            }
        }).start();
        
        return emitter;
    }
    
    @Operation(
            summary = "Get job history",
            description = "Retrieves paginated list of all batch import jobs ordered by creation date (newest first)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Job history retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    @GetMapping("/history")
    public ResponseEntity<Page<BatchJobResponse>> getJobHistory(
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 100)")
            @RequestParam(defaultValue = "20") int size
    ) {
        
        Page<BatchJobExecution> jobs = jobExecutionRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, size)
        );
        
        return ResponseEntity.ok(jobs.map(BatchJobResponse::fromEntity));
    }
    
    @Operation(
            summary = "Get job details",
            description = "Retrieves detailed information about a specific batch import job including status, metrics, and timing"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Job details retrieved",
                    content = @Content(schema = @Schema(implementation = BatchJobResponse.class))),
            @ApiResponse(responseCode = "404", description = "Job not found",
                    content = @Content)
    })
    @GetMapping("/{jobId}")
    public ResponseEntity<BatchJobResponse> getJobDetails(
            @Parameter(description = "Job ID", required = true)
            @PathVariable Long jobId
    ) {
        return jobExecutionRepository.findById(jobId)
                .map(BatchJobResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @Operation(
            summary = "Get job errors",
            description = "Retrieves all error details for failed records in a specific job. Includes coordinates, error type, and messages."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Errors retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Job not found",
                    content = @Content)
    })
    @GetMapping("/{jobId}/errors")
    public ResponseEntity<List<Map<String, ? extends Serializable>>> getJobErrors(
            @Parameter(description = "Job ID", required = true)
            @PathVariable Long jobId
    ) {
        BatchJobExecution job = jobExecutionRepository.findById(jobId)
                .orElse(null);
        
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        
        List<BatchImportError> errors = importErrorRepository.findByJobExecution(job);
        
        List<Map<String, ? extends Serializable>> errorList = errors.stream()
                .map(error -> Map.of(
                        "rowNumber", error.getRowNumber() != null ? error.getRowNumber() : 0,
                        "latitude", error.getLatitude() != null ? error.getLatitude().toString() : "",
                        "longitude", error.getLongitude() != null ? error.getLongitude().toString() : "",
                        "errorType", error.getErrorType(),
                        "errorMessage", error.getErrorMessage() != null ? error.getErrorMessage() : "",
                        "recordData", error.getRecordData() != null ? error.getRecordData() : ""
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(errorList);
    }
    
    @Operation(
            summary = "Get complete job report",
            description = "Retrieves comprehensive job report including job details and all error records. Suitable for export as JSON."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Report generated successfully",
                    content = @Content(schema = @Schema(example = "{\"job\": {...}, \"errors\": [...]}"))),
            @ApiResponse(responseCode = "404", description = "Job not found",
                    content = @Content)
    })
    @GetMapping("/{jobId}/report")
    public ResponseEntity<Map<String, Object>> getJobReport(
            @Parameter(description = "Job ID", required = true)
            @PathVariable Long jobId
    ) {
        BatchJobExecution job = jobExecutionRepository.findById(jobId)
                .orElse(null);
        
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        
        List<BatchImportError> errors = importErrorRepository.findByJobExecution(job);
        
        return ResponseEntity.ok(Map.of(
                "job", BatchJobResponse.fromEntity(job),
                "errors", errors.stream()
                        .map(error -> Map.of(
                                "rowNumber", error.getRowNumber() != null ? error.getRowNumber() : 0,
                                "latitude", error.getLatitude() != null ? error.getLatitude().toString() : "",
                                "longitude", error.getLongitude() != null ? error.getLongitude().toString() : "",
                                "errorType", error.getErrorType(),
                                "errorMessage", error.getErrorMessage() != null ? error.getErrorMessage() : ""
                        ))
                        .collect(Collectors.toList())
        ));
    }
}
