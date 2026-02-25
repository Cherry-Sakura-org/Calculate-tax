package com.acheron.backend.batch;

import com.acheron.backend.entity.BatchImportError;
import com.acheron.backend.entity.BatchJobExecution;
import com.acheron.backend.repository.BatchImportErrorRepository;
import com.acheron.backend.repository.BatchJobExecutionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
@RequiredArgsConstructor
public class BatchErrorTracker {
    
    private final BatchImportErrorRepository errorRepository;
    private final BatchJobExecutionRepository jobExecutionRepository;
    private final ConcurrentHashMap<String, AtomicInteger> errorCounts = new ConcurrentHashMap<>();
    
    public void trackError(String jobName, Integer rowNumber, BigDecimal lat, BigDecimal lon, 
                          String errorType, String errorMessage, String recordData) {
        try {
            BatchJobExecution job = findRunningJob(jobName);
            if (job == null) {
                log.warn("No running job found for: {}", jobName);
                return;
            }
            
            BatchImportError error = new BatchImportError();
            error.setJobExecution(job);
            error.setRowNumber(rowNumber);
            error.setLatitude(lat);
            error.setLongitude(lon);
            error.setErrorType(errorType);
            error.setErrorMessage(truncate(errorMessage, 1000));
            error.setRecordData(truncate(recordData, 2000));
            
            errorRepository.save(error);
            
            incrementErrorCount(errorType);
            
        } catch (Exception e) {
            log.error("Failed to track error: {}", e.getMessage());
        }
    }
    
    private BatchJobExecution findRunningJob(String jobName) {
        return jobExecutionRepository.findByStatusIn(
                java.util.List.of(
                        BatchJobExecution.JobStatus.RUNNING,
                        BatchJobExecution.JobStatus.QUEUED
                )
        ).stream()
        .filter(job -> job.getJobName().equals(jobName))
        .findFirst()
        .orElse(null);
    }
    
    private void incrementErrorCount(String errorType) {
        errorCounts.computeIfAbsent(errorType, k -> new AtomicInteger(0)).incrementAndGet();
    }
    
    public void logErrorSummary() {
        if (!errorCounts.isEmpty()) {
            log.info("Error Summary:");
            errorCounts.forEach((type, count) -> 
                log.info("  - {}: {} occurrences", type, count.get())
            );
        }
    }
    
    public void resetErrorCounts() {
        errorCounts.clear();
    }
    
    private String truncate(String str, int maxLength) {
        if (str == null) return null;
        return str.length() > maxLength ? str.substring(0, maxLength) : str;
    }
}
