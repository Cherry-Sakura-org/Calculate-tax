package com.acheron.backend.dto.batch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCsvRecord {
    private Long id;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private BigDecimal subtotal;
    private LocalDateTime timestamp;
}
