package com.acheron.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxCalculationResult implements Serializable {
    private BigDecimal compositeTaxRate;
    private BigDecimal stateRate;
    private BigDecimal countyRate;
    private BigDecimal cityRate;
    private BigDecimal specialRates;
    private List<String> jurisdictions;
}
