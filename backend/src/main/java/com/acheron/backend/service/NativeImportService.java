package com.acheron.backend.service;

import com.acheron.backend.dto.TaxCalculationResult;
import com.acheron.backend.entity.ImportFile;
import com.acheron.backend.entity.Order;
import com.acheron.backend.entity.OrderTaxBreakdown;
import com.acheron.backend.entity.User;
import com.acheron.backend.repository.ImportFileRepository;
import com.acheron.backend.repository.OrderRepository;
import com.acheron.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
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
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
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
    private final ImportFileRepository importFileRepository;
    private final PlatformTransactionManager transactionManager;
    private final EntityManager entityManager;
    private final UserService userService;

    private static final int PROCESS_BATCH_SIZE = 1000;
    private static final int SAVE_BATCH_SIZE = 500;
    private static final DateTimeFormatter TIMESTAMP_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss[.SSSSSSSSS][.SSSSSS][.SSS]");

    public record ImportResult(
            UUID importFileId,
            String filename,
            int totalRecords,
            int successfulRecords,
            int failedRecords,
            int outOfNyRecords,
            long durationMs,
            double recordsPerSecond,
            List<ImportError> errors,
            List<OutOfNyRow> outOfNyRows
    ) {}

    public record OutOfNyRow(
            int lineNumber,
            BigDecimal latitude,
            BigDecimal longitude,
            BigDecimal subtotal
    ) {}

    public record ImportError(
            int lineNumber,
            String errorMessage,
            String recordData
    ) {}

    private record CsvLine(int lineNumber, String[] fields) {}

    private record ParsedOrder(
            BigDecimal latitude,
            BigDecimal longitude,
            BigDecimal subtotal,
            LocalDateTime orderedAt,
            TaxCalculationResult taxResult
    ) {}

    public ImportResult importCsv(MultipartFile file) {
        log.info("Starting CSV import. File size: {} bytes", file.getSize());
        long startTime = System.nanoTime();

        List<CsvLine> parsedLines = parseCsvFile(file);
        int totalRecords = parsedLines.size();
        log.info("Parsed {} lines from CSV (excluding header).", totalRecords);

        if (totalRecords == 0) {
            log.warn("CSV file has no data rows!");
            return new ImportResult(null, file.getOriginalFilename(), 0, 0, 0, 0, 0, 0, List.of(), List.of());
        }

        UUID userId = userRepository.findByUsername(userService.getCurrentUser().getUsername())
                .orElseThrow(() -> new IllegalStateException("User 'acheron' not found"))
                .getId();

        AtomicInteger failCount = new AtomicInteger();
        CopyOnWriteArrayList<ImportError> errors = new CopyOnWriteArrayList<>();
        CopyOnWriteArrayList<OutOfNyRow> outOfNyRows = new CopyOnWriteArrayList<>();

        List<List<CsvLine>> processBatches = partition(parsedLines, PROCESS_BATCH_SIZE);
        log.info("Phase 1: Submitting {} batches for parallel tax calculation...", processBatches.size());

        List<ParsedOrder> allParsed = new ArrayList<>(totalRecords);
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<List<ParsedOrder>>> futures = new ArrayList<>(processBatches.size());

            for (List<CsvLine> batch : processBatches) {
                futures.add(executor.submit(() -> parseAndCalcTax(batch, errors, failCount, outOfNyRows)));
            }

            for (Future<List<ParsedOrder>> future : futures) {
                try {
                    allParsed.addAll(future.get());
                } catch (Exception e) {
                    log.error("Batch tax calc task failed completely: {}", e.getMessage(), e);
                }
            }
        }

        log.info("Phase 1 done: {} parsed orders ready, {} failed during parsing/tax calc",
                allParsed.size(), failCount.get());

        ImportFile importFileEntity = createImportFileRecord(file, userId, totalRecords);

        TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
        List<List<ParsedOrder>> saveBatches = partition(allParsed, SAVE_BATCH_SIZE);
        AtomicInteger successCount = new AtomicInteger();

        log.info("Phase 2: Saving {} batches to database (Batch size: {})...", saveBatches.size(), SAVE_BATCH_SIZE);

        for (int i = 0; i < saveBatches.size(); i++) {
            List<ParsedOrder> batch = saveBatches.get(i);
            int batchIndex = i + 1;

            try {
                txTemplate.executeWithoutResult(status -> {
                    User userRef = entityManager.getReference(User.class, userId);

                    List<Order> orders = new ArrayList<>(batch.size());
                    for (ParsedOrder po : batch) {
                        orders.add(toOrder(po, userRef, importFileEntity));
                    }
                    orderRepository.saveAll(orders);
                    entityManager.flush();
                    entityManager.clear();
                });

                successCount.addAndGet(batch.size());
                log.debug("DB Batch {}/{} saved successfully.", batchIndex, saveBatches.size());

            } catch (Exception e) {
                Throwable rootCause = getRootCause(e);
                log.error("DB Batch {}/{} FAILED! Reason: {}", batchIndex, saveBatches.size(), rootCause.getMessage());

                failCount.addAndGet(batch.size());
                errors.add(new ImportError(-1, "DB Batch save failed: " + rootCause.getMessage(), "Batch " + batchIndex));
            }
        }

        long durationMs = (System.nanoTime() - startTime) / 1_000_000;
        double recordsPerSecond = durationMs > 0 ? (totalRecords * 1000.0) / durationMs : 0;

        log.info("Native import finished: total={}, success={}, failed={}, duration={}ms, throughput={} rec/sec",
                totalRecords, successCount.get(), failCount.get(), durationMs,
                String.format("%.1f", recordsPerSecond));

        List<ImportError> truncatedErrors = errors.size() > 100
                ? new ArrayList<>(errors.subList(0, 100))
                : new ArrayList<>(errors);

        List<OutOfNyRow> truncatedOutOfNy = outOfNyRows.size() > 200
                ? new ArrayList<>(outOfNyRows.subList(0, 200))
                : new ArrayList<>(outOfNyRows);

        int outOfNyCount = outOfNyRows.size();

        updateImportFileRecord(importFileEntity, successCount.get(), failCount.get(), outOfNyCount, durationMs, recordsPerSecond);

        return new ImportResult(
                importFileEntity.getId(),
                file.getOriginalFilename(),
                totalRecords,
                successCount.get(),
                failCount.get(),
                outOfNyCount,
                durationMs,
                Math.round(recordsPerSecond * 10.0) / 10.0,
                truncatedErrors,
                truncatedOutOfNy
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
            log.info("CSV Header: {}", header);

            int lineNum = 1;
            String line;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                if (!line.isBlank()) {
                    lines.add(new CsvLine(lineNum, line.split(",", -1)));
                }
            }
        } catch (java.io.IOException e) {
            log.error("Failed to read CSV file IO", e);
            throw new IllegalArgumentException("Failed to read CSV file: " + e.getMessage(), e);
        }
        return lines;
    }

    private List<ParsedOrder> parseAndCalcTax(List<CsvLine> batch,
                                              CopyOnWriteArrayList<ImportError> errors,
                                              AtomicInteger failCount,
                                              CopyOnWriteArrayList<OutOfNyRow> outOfNyRows) {
        List<ParsedOrder> results = new ArrayList<>(batch.size());

        for (CsvLine csvLine : batch) {
            try {
                String[] fields = csvLine.fields();

                if (csvLine.lineNumber() == 2) {
                    log.info("DEBUG - First data row fields: {}", Arrays.toString(fields));
                }

                if (fields.length < 5) {
                    throw new IllegalArgumentException("Expected at least 5 columns, got " + fields.length + ". Data: " + Arrays.toString(fields));
                }

                BigDecimal longitude = new BigDecimal(fields[1].trim());
                BigDecimal latitude = new BigDecimal(fields[2].trim());
                LocalDateTime timestamp = LocalDateTime.parse(fields[3].trim(), TIMESTAMP_FORMATTER);
                BigDecimal subtotal = new BigDecimal(fields[4].trim());

                TaxCalculationResult taxResult = geoJsonTaxService.calculateTax(latitude, longitude);

                if (!taxResult.isWithinNewYork()) {
                    outOfNyRows.add(new OutOfNyRow(csvLine.lineNumber(), latitude, longitude, subtotal));
                }

                results.add(new ParsedOrder(latitude, longitude, subtotal, timestamp, taxResult));
            } catch (Exception e) {
                failCount.incrementAndGet();
                String recordData = String.join(",", csvLine.fields());

                if (failCount.get() <= 5) {
                    log.warn("Parse error on line {}: {}", csvLine.lineNumber(), e.getMessage());
                }

                errors.add(new ImportError(csvLine.lineNumber(), e.getMessage(), truncate(recordData, 200)));
            }
        }

        return results;
    }

    private ImportFile createImportFileRecord(MultipartFile file, UUID userId, int totalRecords) {
        TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
        return txTemplate.execute(status -> {
            User userRef = entityManager.getReference(User.class, userId);
            ImportFile importFile = ImportFile.builder()
                    .originalFilename(file.getOriginalFilename())
                    .fileSizeBytes(file.getSize())
                    .totalRecords(totalRecords)
                    .successfulRecords(0)
                    .failedRecords(0)
                    .outOfNyRecords(0)
                    .importedAt(LocalDateTime.now())
                    .importedByUser(userRef)
                    .status("PROCESSING")
                    .build();
            return importFileRepository.save(importFile);
        });
    }

    private void updateImportFileRecord(ImportFile importFile, int success, int failed, int outOfNy, long durationMs, double rps) {
        TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
        txTemplate.executeWithoutResult(status -> {
            importFile.setSuccessfulRecords(success);
            importFile.setFailedRecords(failed);
            importFile.setOutOfNyRecords(outOfNy);
            importFile.setDurationMs(durationMs);
            importFile.setRecordsPerSecond(Math.round(rps * 10.0) / 10.0);
            importFile.setStatus(failed > 0 ? "COMPLETED_WITH_ERRORS" : "COMPLETED");
            importFileRepository.save(importFile);
        });
    }

    private Order toOrder(ParsedOrder po, User user, ImportFile importFile) {
        TaxCalculationResult taxResult = po.taxResult();

        BigDecimal taxAmount = po.subtotal()
                .multiply(taxResult.getCompositeTaxRate())
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = po.subtotal()
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
                .latitude(po.latitude())
                .longitude(po.longitude())
                .subtotal(po.subtotal())
                .orderedAt(po.orderedAt())
                .compositeTaxRate(taxResult.getCompositeTaxRate())
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .isWithinNewYork(taxResult.isWithinNewYork())
                .county(taxResult.getCounty())
                .region(taxResult.getRegion())
                .importFile(importFile)
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

    private Throwable getRootCause(Throwable e) {
        Throwable cause = e;
        while (cause.getCause() != null && cause != cause.getCause()) {
            cause = cause.getCause();
        }
        return cause;
    }
}