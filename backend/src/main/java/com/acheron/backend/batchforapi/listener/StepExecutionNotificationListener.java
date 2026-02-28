package com.acheron.backend.batchforapi.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.core.listener.StepExecutionListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StepExecutionNotificationListener implements StepExecutionListener {

    @Override
    public void beforeStep(StepExecution stepExecution) {
        log.info("Step started: {} for Job ID: {}",
                stepExecution.getStepName(),
                stepExecution.getJobExecutionId());
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        log.info("Step completed: {} - Read: {}, Written: {}, Skipped: {}, Failed: {}",
                stepExecution.getStepName(),
                stepExecution.getReadCount(),
                stepExecution.getWriteCount(),
                stepExecution.getSkipCount(),
                stepExecution.getProcessSkipCount() + stepExecution.getWriteSkipCount());

        if (stepExecution.getSkipCount() > 0) {
            log.warn("Step {} completed with {} skipped records",
                    stepExecution.getStepName(),
                    stepExecution.getSkipCount());
        }

        return stepExecution.getExitStatus();
    }
}
