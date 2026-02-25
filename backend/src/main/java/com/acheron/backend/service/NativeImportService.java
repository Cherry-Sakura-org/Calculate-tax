package com.acheron.backend.service;

import com.acheron.backend.dto.TaxCalculationResult;
import com.acheron.backend.entity.Order;
import com.acheron.backend.entity.OrderTaxBreakdown;
import com.acheron.backend.entity.User;
import com.acheron.backend.repository.OrderRepository;
import com.acheron.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class NativeImportService {

    private final GeoJsonTaxService geoJsonTaxService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PlatformTransactionManager transactionManager;

    private static final int PROCESS_BATCH_SIZE = 1000;
    private static final int SAVE_BATCH_SIZE = 500;
    private static final DateTimeFormatter TIMESTAMP_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss[.SSSSSSSSS][.SSSSSS][.SSS]");

    public record ImportResult(
            int totalRecords,
            int successfulRecords,
            int failedRecords,
            long durationMs,
            double recordsPerSecond,
            List<ImportError> errors
    ) {}

    public record ImportError(
            int lineNumber,
            String errorMessage,
            String recordData
    ) {}

    private record CsvLine(int lineNumber, String[] fields) {}

    public ImportResult importCsv(MultipartFile file) {
        long startTime = System.nanoTime();
        List<CsvLine> parsedLines = parseCsvFile(file);
        int totalRecords = parsedLines.size();

        User currentUser = userRepository.findByUsername("acheron")
                .orElseThrow(() -> new IllegalStateException("User 'acheron' not found"));

        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger failCount = new AtomicInteger();
        CopyOnWriteArrayList<ImportError> errors = new CopyOnWriteArrayList<>();

        List<List<CsvLine>> processBatches = partition(parsedLines, PROCESS_BATCH_SIZE);

        // Phase 1: parallel tax calculation on virtual threads
        List<Order> allOrders;
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<List<Order>>> futures = new ArrayList<>(processBatches.size());

            for (List<CsvLine> batch : processBatches) {
                futures.add(executor.submit(() -> processBatch(batch, currentUser, errors, failCount)));
            }

            allOrders = new ArrayList<>(totalRecords);
            for (Future<List<Order>> future : futures) {
                try {
                    allOrders.addAll(future.get());
                } catch (Exception e) {
                    log.error("Batch tax calc failed: {}", e.getMessage());
                }
            }
        }

        log.info("Phase 1 done: {} orders ready for save, {} failed tax calc", allOrders.size(), failCount.get());

        // Phase 2: parallel DB saves using TransactionTemplate (works from virtual threads)
        TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
        List<List<Order>> saveBatches = partition(allOrders, SAVE_BATCH_SIZE);

        try (ExecutorService saveExecutor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<Integer>> saveFutures = new ArrayList<>(saveBatches.size());

            for (List<Order> batch : saveBatches) {
                saveFutures.add(saveExecutor.submit(() ->
                        txTemplate.execute(status -> {
                            orderRepository.saveAll(batch);
                            return batch.size();
                        })
                ));
            }

            for (Future<Integer> future : saveFutures) {
                try {
                    Integer saved = future.get();
                    if (saved != null) {
                        successCount.addAndGet(saved);
                    }
                } catch (Exception e) {
                    log.error("Batch save failed: {}", e.getMessage());
                }
            }
        }

        long durationMs = (System.nanoTime() - startTime) / 1_000_000;
        double recordsPerSecond = durationMs > 0 ? (totalRecords * 1000.0) / durationMs : 0;

        log.info("Native import: total={}, success={}, failed={}, duration={}ms, throughput={} rec/sec",
                totalRecords, successCount.get(), failCount.get(), durationMs,
                String.format("%.0f", recordsPerSecond));

        List<ImportError> truncatedErrors = errors.size() > 100
                ? new ArrayList<>(errors.subList(0, 100))
                : new ArrayList<>(errors);

        return new ImportResult(
                totalRecords,
                successCount.get(),
                failCount.get(),
                durationMs,
                Math.round(recordsPerSecond * 10.0) / 10.0,
                truncatedErrors
        );
    }

    private List<CsvLine> parseCsvFile(MultipartFile file) {
        List<CsvLine> lines = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8), 131072)) {

            String header = reader.readLine();
            if (header == null) {
                throw new IllegalArgumentException("CSV file is empty");
            }

            int lineNum = 1;
            String line;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                if (!line.isBlank()) {
                    lines.add(new CsvLine(lineNum, line.split(",", -1)));
                }
            }
        } catch (java.io.IOException e) {
            throw new IllegalArgumentException("Failed to read CSV file: " + e.getMessage(), e);
        }
        return lines;
    }

    private List<Order> processBatch(List<CsvLine> batch, User user,
                                     CopyOnWriteArrayList<ImportError> errors,
                                     AtomicInteger failCount) {
        List<Order> orders = new ArrayList<>(batch.size());

        for (CsvLine csvLine : batch) {
            try {
                Order order = processRecord(csvLine.fields(), user);
                orders.add(order);
            } catch (Exception e) {
                failCount.incrementAndGet();
                String recordData = String.join(",", csvLine.fields());
                errors.add(new ImportError(csvLine.lineNumber(), e.getMessage(), truncate(recordData, 200)));
            }
        }

        return orders;
    }

    private Order processRecord(String[] fields, User user) {
        if (fields.length < 5) {
            throw new IllegalArgumentException("Expected 5 columns, got " + fields.length);
        }

        BigDecimal longitude = new BigDecimal(fields[1].trim());
        BigDecimal latitude = new BigDecimal(fields[2].trim());
        LocalDateTime timestamp = LocalDateTime.parse(fields[3].trim(), TIMESTAMP_FORMATTER);
        BigDecimal subtotal = new BigDecimal(fields[4].trim());

        TaxCalculationResult taxResult = geoJsonTaxService.calculateTax(latitude, longitude);

        BigDecimal taxAmount = subtotal
                .multiply(taxResult.getCompositeTaxRate())
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = subtotal
                .add(taxAmount)
                .setScale(2, RoundingMode.HALF_UP);

        OrderTaxBreakdown taxBreakdown = OrderTaxBreakdown.builder()
                .stateRate(taxResult.getStateRate())
                .countyRate(taxResult.getCountyRate())
                .cityRate(taxResult.getCityRate())
                .specialRates(taxResult.getSpecialRates())
                .jurisdictions(taxResult.getJurisdictions())
                .build();

        Order order = Order.builder()
                .latitude(latitude)
                .longitude(longitude)
                .subtotal(subtotal)
                .orderedAt(timestamp)
                .compositeTaxRate(taxResult.getCompositeTaxRate())
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .createdByAdmin(user)
                .build();

        order.setTaxBreakdown(taxBreakdown);
        return order;
    }

    private static <T> List<List<T>> partition(List<T> list, int batchSize) {
        List<List<T>> partitions = new ArrayList<>();
        for (int i = 0; i < list.size(); i += batchSize) {
            partitions.add(list.subList(i, Math.min(i + batchSize, list.size())));
        }
        return partitions;
    }

    private static String truncate(String str, int maxLength) {
        if (str == null) return null;
        return str.length() > maxLength ? str.substring(0, maxLength) + "..." : str;
    }
}
