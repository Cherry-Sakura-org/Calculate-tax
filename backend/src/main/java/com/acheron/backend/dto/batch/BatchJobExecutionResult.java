package com.acheron.backend.dto.batch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchJobExecutionResult {
    private Long executionId;
    private String status;
    private Integer totalRecords;
    private Integer processedRecords;
    private Integer failedRecords;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String errorMessage;
}
