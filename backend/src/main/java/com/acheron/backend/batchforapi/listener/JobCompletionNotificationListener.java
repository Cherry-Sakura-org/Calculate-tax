package com.acheron.backend.batchforapi.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JobCompletionNotificationListener implements JobExecutionListener {

    @Override
    public void beforeJob(JobExecution jobExecution) {
        log.info("CSV Import Job started: Job ID = {}, Job Parameters = {}",
                jobExecution.getJobInstanceId(),
                jobExecution.getJobParameters());
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
            log.info("CSV Import Job completed successfully: Job ID = {}, Read Count = {}, Write Count = {}, Skip Count = {}",
                    jobExecution.getJobInstanceId(),
                    jobExecution.getStepExecutions().stream().mapToLong(se -> se.getReadCount()).sum(),
                    jobExecution.getStepExecutions().stream().mapToLong(se -> se.getWriteCount()).sum(),
                    jobExecution.getStepExecutions().stream().mapToLong(se -> se.getSkipCount()).sum());
        } else if (jobExecution.getStatus() == BatchStatus.FAILED) {
            log.error("CSV Import Job failed: Job ID = {}, Exit Status = {}",
                    jobExecution.getJobInstanceId(),
                    jobExecution.getExitStatus().getExitCode());
            
            jobExecution.getAllFailureExceptions().forEach(throwable ->
                    log.error("Job failure exception: ", throwable)
            );
        }
    }
}
