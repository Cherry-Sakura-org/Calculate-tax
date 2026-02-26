package com.acheron.backend.dto.response;

import com.acheron.backend.entity.ImportFile;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.UUID;

public record ImportFileResponse(
        UUID id,

        @JsonProperty("original_filename")
        String originalFilename,

        @JsonProperty("file_size_bytes")
        Long fileSizeBytes,

        @JsonProperty("total_records")
        Integer totalRecords,

        @JsonProperty("successful_records")
        Integer successfulRecords,

        @JsonProperty("failed_records")
        Integer failedRecords,

        @JsonProperty("out_of_ny_records")
        Integer outOfNyRecords,

        @JsonProperty("duration_ms")
        Long durationMs,

        @JsonProperty("records_per_second")
        Double recordsPerSecond,

        @JsonProperty("imported_at")
        LocalDateTime importedAt,

        String status
) {
    public static ImportFileResponse fromEntity(ImportFile entity) {
        return new ImportFileResponse(
                entity.getId(),
                entity.getOriginalFilename(),
                entity.getFileSizeBytes(),
                entity.getTotalRecords(),
                entity.getSuccessfulRecords(),
                entity.getFailedRecords(),
                entity.getOutOfNyRecords(),
                entity.getDurationMs(),
                entity.getRecordsPerSecond(),
                entity.getImportedAt(),
                entity.getStatus()
        );
    }
}
