package com.acheron.backend.service;

import com.acheron.backend.dto.TaxCalculationResult;
import com.acheron.backend.dto.batch.BatchJobExecutionResult;
import com.acheron.backend.dto.request.OrderRequest;
import com.acheron.backend.dto.response.OrderResponse;
import com.acheron.backend.entity.Order;
import com.acheron.backend.entity.OrderTaxBreakdown;
import com.acheron.backend.entity.User;
import com.acheron.backend.repository.OrderRepository;
import com.acheron.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final TaxCalculationService taxCalculationService;
    private final JobLauncher jobLauncher;
    private final Job importOrderJob;

    public List<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        TaxCalculationResult taxResult = taxCalculationService.calculateTaxForLocation(
                request.latitude(),
                request.longitude()
        );

        BigDecimal taxAmount = request.subtotal()
                .multiply(taxResult.getCompositeTaxRate())
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = request.subtotal()
                .add(taxAmount)
                .setScale(2, RoundingMode.HALF_UP);

        User currentUser = getCurrentUser();

        OrderTaxBreakdown taxBreakdown = OrderTaxBreakdown.builder()
                .stateRate(taxResult.getStateRate())
                .countyRate(taxResult.getCountyRate())
                .cityRate(taxResult.getCityRate())
                .specialRates(taxResult.getSpecialRates())
                .jurisdictions(taxResult.getJurisdictions())
                .build();

        Order order = Order.builder()
                .latitude(request.latitude())
                .longitude(request.longitude())
                .subtotal(request.subtotal())
                .orderedAt(LocalDateTime.now())
                .compositeTaxRate(taxResult.getCompositeTaxRate())
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .createdByAdmin(currentUser)
                .build();

        order.setTaxBreakdown(taxBreakdown);

        Order savedOrder = orderRepository.save(order);

        log.info("Order created successfully: orderId={}, totalAmount={}", savedOrder.getId(), totalAmount);

        return OrderResponse.fromEntity(savedOrder);
    }

    @Deprecated(since = "6.0", forRemoval = true)
    public BatchJobExecutionResult importFromCsv(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("CSV file is empty");
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".csv")) {
                throw new IllegalArgumentException("File must be a CSV file");
            }

            Path tempDir = Files.createTempDirectory("batch-csv-");
            String uniqueFilename = UUID.randomUUID() + "_" + originalFilename;
            Path tempFile = tempDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);

            log.info("Saved temporary CSV file: {}", tempFile.toAbsolutePath());

            JobParameters jobParameters = new JobParametersBuilder()
                    .addString("filename", originalFilename)
                    .addLong("timestamp", System.currentTimeMillis())
                    .addString("filePath", tempFile.toAbsolutePath().toString())
                    .toJobParameters();

            JobExecution jobExecution = jobLauncher.run(importOrderJob, jobParameters);

            return buildBatchJobResult(jobExecution);

        } catch (IOException e) {
            log.error("Failed to read CSV file", e);
            throw new IllegalArgumentException("Failed to read CSV file: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Failed to execute batch job", e);
            throw new IllegalStateException("Failed to execute CSV import job: " + e.getMessage(), e);
        }
    }

    private BatchJobExecutionResult buildBatchJobResult(JobExecution jobExecution) {
        StepExecution stepExecution = jobExecution.getStepExecutions().stream()
                .findFirst()
                .orElse(null);

        int totalRecords = 0;
        int processedRecords = 0;
        int failedRecords = 0;

        if (stepExecution != null) {
            totalRecords = (int) (stepExecution.getReadCount() + stepExecution.getReadSkipCount());
            processedRecords = (int) stepExecution.getWriteCount();
            failedRecords = (int) stepExecution.getSkipCount();
        }

        String errorMessage = null;
        if (jobExecution.getStatus() == BatchStatus.FAILED) {
            errorMessage = jobExecution.getAllFailureExceptions().stream()
                    .map(Throwable::getMessage)
                    .reduce((msg1, msg2) -> msg1 + "; " + msg2)
                    .orElse("Unknown error");
        }

        return BatchJobExecutionResult.builder()
                .executionId(jobExecution.getJobInstanceId())
                .status(jobExecution.getStatus().name())
                .totalRecords(totalRecords)
                .processedRecords(processedRecords)
                .failedRecords(failedRecords)
                .startTime(jobExecution.getStartTime())
                .endTime(jobExecution.getEndTime())
                .errorMessage(errorMessage)
                .build();
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername("acheron")
                .orElseThrow(() -> new IllegalStateException("Current user not found: " + username));
    }
}
