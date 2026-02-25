package com.acheron.backend.batchforapi;

import com.acheron.backend.dto.TaxCalculationResult;
import com.acheron.backend.batchforapi.dto.OrderCsvRecord;
import com.acheron.backend.entity.Order;
import com.acheron.backend.entity.OrderTaxBreakdown;
import com.acheron.backend.entity.User;
import com.acheron.backend.repository.UserRepository;
import com.acheron.backend.service.TaxCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.infrastructure.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderItemProcessor implements ItemProcessor<OrderCsvRecord, Order> {

    private final TaxCalculationService taxCalculationService;
    private final UserRepository userRepository;
    private final BatchErrorTracker errorTracker;

    @Override
    public Order process(OrderCsvRecord csvRecord) {
        try {
            TaxCalculationResult taxResult = taxCalculationService.calculateTaxForLocation(
                    csvRecord.getLatitude(),
                    csvRecord.getLongitude()
            );

            BigDecimal taxAmount = csvRecord.getSubtotal()
                    .multiply(taxResult.getCompositeTaxRate())
                    .setScale(2, RoundingMode.HALF_UP);

            BigDecimal totalAmount = csvRecord.getSubtotal()
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
                    .latitude(csvRecord.getLatitude())
                    .longitude(csvRecord.getLongitude())
                    .subtotal(csvRecord.getSubtotal())
                    .orderedAt(csvRecord.getTimestamp())
                    .compositeTaxRate(taxResult.getCompositeTaxRate())
                    .taxAmount(taxAmount)
                    .totalAmount(totalAmount)
                    .createdByAdmin(currentUser)
                    .build();

            order.setTaxBreakdown(taxBreakdown);

            log.debug("Processed order: lat={}, lon={}, subtotal={}, tax={}, total={}",
                    csvRecord.getLatitude(), csvRecord.getLongitude(),
                    csvRecord.getSubtotal(), taxAmount, totalAmount);

            return order;

        } catch (Exception e) {
            String errorType = e.getClass().getSimpleName();
            String recordData = String.format("lat=%s,lon=%s,subtotal=%s", 
                    csvRecord.getLatitude(), csvRecord.getLongitude(), csvRecord.getSubtotal());
            
            errorTracker.trackError(
                    "importOrderJob",
                    null,
                    csvRecord.getLatitude(),
                    csvRecord.getLongitude(),
                    errorType,
                    e.getMessage(),
                    recordData
            );
            
            throw new IllegalArgumentException(
                    String.format("Processing failed: %s", e.getMessage()),
                    e
            );
        }
    }

    private User getCurrentUser() {
        return userRepository.findByUsername("acheron")
                .orElseThrow(() -> new IllegalStateException("User 'acheron' not found"));
    }
}
