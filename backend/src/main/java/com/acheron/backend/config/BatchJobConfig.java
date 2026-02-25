package com.acheron.backend.config;

import com.acheron.backend.batch.OrderCsvItemReader;
import com.acheron.backend.batch.OrderItemProcessor;
import com.acheron.backend.batch.OrderItemWriter;
import com.acheron.backend.batch.listener.BatchJobProgressListener;
import com.acheron.backend.batch.listener.JobCompletionNotificationListener;
import com.acheron.backend.batch.listener.SkipListener;
import com.acheron.backend.batch.listener.StepExecutionNotificationListener;
import com.acheron.backend.dto.batch.OrderCsvRecord;
import com.acheron.backend.entity.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.EnableJdbcJobRepository;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.job.parameters.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.infrastructure.item.file.FlatFileItemReader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.validation.BindException;

@Configuration
@EnableBatchProcessing
@EnableJdbcJobRepository
@RequiredArgsConstructor
public class BatchJobConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final OrderCsvItemReader csvItemReader;
    private final OrderItemProcessor itemProcessor;
    private final OrderItemWriter itemWriter;
    private final JobCompletionNotificationListener jobCompletionListener;
    private final StepExecutionNotificationListener stepExecutionListener;
    private final SkipListener skipListener;
    private final BatchJobProgressListener progressListener;

    private static final int CHUNK_SIZE = 100;
    private static final int SKIP_LIMIT = 200;
    private static final int THREAD_POOL_SIZE = 10;
    private static final int THROTTLE_LIMIT = 10;

    @Bean
    public Job importOrderJob(Step importOrderStep) {
        return new JobBuilder("importOrderJob", jobRepository)
                .incrementer(new RunIdIncrementer())
                .listener(jobCompletionListener)
                .listener(progressListener)
                .start(importOrderStep)
                .build();
    }

    @Bean
    public AsyncTaskExecutor stepTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(THREAD_POOL_SIZE);
        executor.setMaxPoolSize(THREAD_POOL_SIZE);
        executor.setQueueCapacity(CHUNK_SIZE * 2);
        executor.setThreadNamePrefix("batch-step-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    @Bean
    public Step importOrderStep() {
        return new StepBuilder("importOrderStep", jobRepository)
                .<OrderCsvRecord, Order>chunk(CHUNK_SIZE)
                .transactionManager(transactionManager)
                .reader(orderCsvReader(null))
                .processor(itemProcessor)
                .writer(itemWriter)
                .taskExecutor(stepTaskExecutor())
                .faultTolerant()
                .skipPolicy((throwable, skipCount) -> {
                    if (skipCount >= SKIP_LIMIT) {
                        return false;
                    }
                    return throwable instanceof IllegalArgumentException
                            || throwable instanceof DataAccessException
                            || throwable instanceof org.springframework.batch.infrastructure.item.file.FlatFileParseException
                            || throwable instanceof BindException;
                })
                .skip(IllegalArgumentException.class)
                .skip(DataAccessException.class)
                .skip(org.springframework.batch.infrastructure.item.file.FlatFileParseException.class)
                .skip(BindException.class)
                .skipLimit(SKIP_LIMIT)
                .listener(stepExecutionListener)
                .listener(skipListener)
                .build();
    }

    @Bean
    @StepScope
    public FlatFileItemReader<OrderCsvRecord> orderCsvReader(
            @Value("#{jobParameters['filePath']}") String filePath) {
        FileSystemResource resource = new FileSystemResource(filePath);
        return csvItemReader.createReader(resource);
    }
}
