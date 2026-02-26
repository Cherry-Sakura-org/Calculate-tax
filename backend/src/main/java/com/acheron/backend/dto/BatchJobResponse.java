package com.acheron.backend.dto;

import com.acheron.backend.entity.BatchJobExecution;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchJobResponse {
    private Long jobId;
    private String jobName;
    private String filename;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalRecords;
    private Integer processedRecords;
    private Integer successfulRecords;
    private Integer failedRecords;
    private Integer skippedRecords;
    private String errorMessage;
    private Long durationMs;
    
    public static BatchJobResponse fromEntity(BatchJobExecution entity) {
        BatchJobResponse response = new BatchJobResponse();
        response.setJobId(entity.getId());
        response.setJobName(entity.getJobName());
        response.setFilename(entity.getFilename());
        response.setStatus(entity.getStatus().name());
        response.setStartTime(entity.getStartTime());
        response.setEndTime(entity.getEndTime());
        response.setTotalRecords(entity.getTotalRecords());
        response.setProcessedRecords(entity.getProcessedRecords());
        response.setSuccessfulRecords(entity.getSuccessfulRecords());
        response.setFailedRecords(entity.getFailedRecords());
        response.setSkippedRecords(entity.getSkippedRecords());
        response.setErrorMessage(entity.getErrorMessage());
        
        if (entity.getEndTime() != null && entity.getStartTime() != null) {
            response.setDurationMs(
                java.time.Duration.between(entity.getStartTime(), entity.getEndTime()).toMillis()
            );
        }
        
        return response;
    }
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class BatchImportErrorDto {
    private Integer rowNumber;
    private String latitude;
    private String longitude;
    private String errorType;
    private String errorMessage;
    private String recordData;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class BatchJobReportResponse {
    private BatchJobResponse job;
    private List<BatchImportErrorDto> errors;
}
