package com.acheron.backend.batch.listener;

import com.acheron.backend.dto.batch.OrderCsvRecord;
import com.acheron.backend.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.infrastructure.item.file.FlatFileParseException;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindException;

@Slf4j
@Component
public class SkipListener implements org.springframework.batch.core.listener.SkipListener<OrderCsvRecord, Order> {

    @Override
    public void onSkipInRead(Throwable t) {
        String errorCategory = categorizeError(t);
        String errorDetails = extractErrorDetails(t);
        
        log.error("┌─────────────────────────────────────────────────────────");
        log.error("│ ⚠️  CSV READ ERROR - Record Skipped");
        log.error("├─────────────────────────────────────────────────────────");
        log.error("│ Category: {}", errorCategory);
        log.error("│ Details:  {}", errorDetails);
        log.error("│ Type:     {}", t.getClass().getSimpleName());
        log.error("└─────────────────────────────────────────────────────────");
        
        if (log.isDebugEnabled()) {
            log.debug("Full stack trace:", t);
        }
    }

    @Override
    public void onSkipInProcess(OrderCsvRecord item, Throwable t) {
        String errorCategory = categorizeError(t);
        String errorDetails = extractErrorDetails(t);
        
        log.error("┌─────────────────────────────────────────────────────────");
        log.error("│ ⚠️  PROCESSING ERROR - Record Skipped");
        log.error("├─────────────────────────────────────────────────────────");
        log.error("│ Record ID:  {}", item.getId());
        log.error("│ Latitude:   {}", item.getLatitude());
        log.error("│ Longitude:  {}", item.getLongitude());
        log.error("│ Subtotal:   ${}", item.getSubtotal());
        log.error("│ Timestamp:  {}", item.getTimestamp());
        log.error("├─────────────────────────────────────────────────────────");
        log.error("│ Category:   {}", errorCategory);
        log.error("│ Details:    {}", errorDetails);
        log.error("│ Type:       {}", t.getClass().getSimpleName());
        log.error("└─────────────────────────────────────────────────────────");
        
        if (log.isDebugEnabled()) {
            log.debug("Full stack trace:", t);
        }
    }

    @Override
    public void onSkipInWrite(Order item, Throwable t) {
        String errorCategory = categorizeError(t);
        String errorDetails = extractErrorDetails(t);
        
        log.error("┌─────────────────────────────────────────────────────────");
        log.error("│ ⚠️  DATABASE WRITE ERROR - Order Skipped");
        log.error("├─────────────────────────────────────────────────────────");
        log.error("│ Order ID:   {}", item.getId());
        log.error("│ Location:   ({}, {})", item.getLatitude(), item.getLongitude());
        log.error("│ Amount:     ${}", item.getTotalAmount());
        log.error("│ Tax Rate:   {}%", item.getCompositeTaxRate().multiply(java.math.BigDecimal.valueOf(100)));
        log.error("├─────────────────────────────────────────────────────────");
        log.error("│ Category:   {}", errorCategory);
        log.error("│ Details:    {}", errorDetails);
        log.error("│ Type:       {}", t.getClass().getSimpleName());
        log.error("└─────────────────────────────────────────────────────────");
        
        if (log.isDebugEnabled()) {
            log.debug("Full stack trace:", t);
        }
    }
    
    private String categorizeError(Throwable t) {
        if (t instanceof FlatFileParseException) {
            return "CSV_PARSING_ERROR";
        } else if (t instanceof BindException) {
            return "DATA_BINDING_ERROR";
        } else if (t instanceof IllegalArgumentException) {
            if (t.getMessage() != null && t.getMessage().contains("Tax locality not found")) {
                return "TAX_LOCALITY_NOT_FOUND";
            } else if (t.getMessage() != null && t.getMessage().contains("timestamp")) {
                return "INVALID_TIMESTAMP_FORMAT";
            }
            return "INVALID_DATA";
        } else if (t instanceof DataAccessException) {
            return "DATABASE_ERROR";
        } else if (t instanceof org.springframework.web.client.RestClientException) {
            return "GEOCODING_API_ERROR";
        }
        return "UNKNOWN_ERROR";
    }
    
    private String extractErrorDetails(Throwable t) {
        if (t.getMessage() != null && !t.getMessage().isEmpty()) {
            String msg = t.getMessage();
            if (msg.length() > 150) {
                return msg.substring(0, 147) + "...";
            }
            return msg;
        }
        
        Throwable cause = t.getCause();
        if (cause != null && cause.getMessage() != null) {
            String causeMsg = cause.getMessage();
            if (causeMsg.length() > 150) {
                return causeMsg.substring(0, 147) + "...";
            }
            return causeMsg;
        }
        
        return "No error message available";
    }
}
