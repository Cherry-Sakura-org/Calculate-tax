package com.acheron.backend.batchforapi.service;

import com.acheron.backend.batchforapi.entity.BatchJobExecution;
import com.acheron.backend.batchforapi.repository.BatchJobExecutionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.*;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncBatchService {
    
    private final JobOperator jobOperator;
    private final Job importOrderJob;
    private final BatchJobExecutionRepository jobExecutionRepository;
    
    @Async("batchTaskExecutor")
    public void executeImportJobAsync(Long trackingId, Path tempFilePath, String originalFilename) {
        BatchJobExecution tracking = jobExecutionRepository.findById(trackingId)
                .orElseThrow(() -> new IllegalStateException("Tracking record not found"));
        
        try {
            tracking.setStatus(BatchJobExecution.JobStatus.RUNNING);
            jobExecutionRepository.save(tracking);
            
            JobParameters jobParameters = new JobParametersBuilder()
                    .addString("filename", originalFilename)
                    .addString("filePath", tempFilePath.toString())
                    .addLong("timestamp", System.currentTimeMillis())
                    .toJobParameters();
            
            log.info("Starting async batch job for file: {}", originalFilename);
            // JobOperator extends JobLauncher in Spring Batch 6
            JobExecution execution = jobOperator.start(importOrderJob, jobParameters);
            
            updateTrackingFromExecution(tracking, execution);
            
        } catch (Exception e) {
            log.error("Batch job execution failed for tracking ID {}: {}", trackingId, e.getMessage(), e);
            tracking.setStatus(BatchJobExecution.JobStatus.FAILED);
            tracking.setErrorMessage(e.getMessage());
            tracking.setEndTime(LocalDateTime.now());
            jobExecutionRepository.save(tracking);
        } finally {
            try {
                Files.deleteIfExists(tempFilePath);
            } catch (IOException e) {
                log.warn("Failed to delete temp file: {}", tempFilePath, e);
            }
        }
    }
    
    private void updateTrackingFromExecution(BatchJobExecution tracking, JobExecution execution) {
        tracking.setEndTime(LocalDateTime.now());
        
        if (execution.getStatus() == BatchStatus.COMPLETED) {
            tracking.setStatus(BatchJobExecution.JobStatus.COMPLETED);
        } else if (execution.getStatus() == BatchStatus.FAILED) {
            tracking.setStatus(BatchJobExecution.JobStatus.FAILED);
            
            if (!execution.getAllFailureExceptions().isEmpty()) {
                Throwable firstException = execution.getAllFailureExceptions().get(0);
                tracking.setErrorMessage(firstException.getMessage());
            }
        }
        
        StepExecution stepExecution = execution.getStepExecutions().stream()
                .findFirst()
                .orElse(null);
        
        if (stepExecution != null) {
            tracking.setTotalRecords((int) stepExecution.getReadCount());
            tracking.setProcessedRecords((int) stepExecution.getReadCount());
            tracking.setSuccessfulRecords((int) stepExecution.getWriteCount());
            tracking.setFailedRecords((int) (stepExecution.getWriteSkipCount() + stepExecution.getProcessSkipCount()));
            tracking.setSkippedRecords((int) stepExecution.getReadSkipCount());
        }
        
        jobExecutionRepository.save(tracking);
    }
    
    public BatchJobExecution createTrackingRecord(String filename) {
        BatchJobExecution tracking = new BatchJobExecution();
        tracking.setJobName("importOrderJob");
        tracking.setFilename(filename);
        tracking.setStatus(BatchJobExecution.JobStatus.QUEUED);
        tracking.setStartTime(LocalDateTime.now());
        return jobExecutionRepository.save(tracking);
    }
    
    public Path saveTempFile(MultipartFile file) throws IOException {
        Path tempDir = Files.createTempDirectory("batch-csv-");
        String uniqueFilename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path tempFile = tempDir.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);
        return tempFile;
    }
}
