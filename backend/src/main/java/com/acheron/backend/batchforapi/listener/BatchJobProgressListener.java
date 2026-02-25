package com.acheron.backend.batchforapi.listener;

import com.acheron.backend.batchforapi.BatchErrorTracker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BatchJobProgressListener implements JobExecutionListener {
    
    private final BatchErrorTracker errorTracker;
    
    @Override
    public void beforeJob(JobExecution jobExecution) {
        errorTracker.resetErrorCounts();
        log.info("Batch job started: {}", jobExecution.getJobInstance().getJobName());
    }
    
    @Override
    public void afterJob(JobExecution jobExecution) {
        errorTracker.logErrorSummary();
        log.info("Batch job completed: {} with status: {}", 
                jobExecution.getJobInstance().getJobName(),
                jobExecution.getStatus());
    }
}
