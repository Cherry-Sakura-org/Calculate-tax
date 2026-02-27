package com.acheron.backend.dto.response;

import com.acheron.backend.entity.Order;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        BigDecimal latitude,
        BigDecimal longitude,
        BigDecimal subtotal,

        @JsonProperty("composite_tax_rate")
        BigDecimal compositeTaxRate,

        @JsonProperty("tax_amount")
        BigDecimal taxAmount,

        @JsonProperty("total_amount")
        BigDecimal totalAmount,

        LocalDateTime timestamp,

        @JsonProperty("is_within_new_york")
        Boolean isWithinNewYork,

        String county,

        String region,

        TaxBreakdown taxBreakdown,

        List<String> jurisdictions
) {
    public record TaxBreakdown(
            @JsonProperty("state_rate")
            BigDecimal stateRate,

            @JsonProperty("county_rate")
            BigDecimal countyRate,

            @JsonProperty("city_rate")
            BigDecimal cityRate,

            @JsonProperty("special_rates")
            BigDecimal specialRates
    ) {}

    public static OrderResponse fromEntity(Order order) {
        TaxBreakdown breakdownDto = null;
        List<String> jurisdictionsList = null;

        if (order.getTaxBreakdown() != null) {
            var tb = order.getTaxBreakdown();
            breakdownDto = new TaxBreakdown(
                    tb.getStateRate(),
                    tb.getCountyRate(),
                    tb.getCityRate(),
                    tb.getSpecialRates()
            );
            jurisdictionsList = tb.getJurisdictions();
        }

        return new OrderResponse(
                order.getId(),
                order.getLatitude(),
                order.getLongitude(),
                order.getSubtotal(),
                order.getCompositeTaxRate(),
                order.getTaxAmount(),
                order.getTotalAmount(),
                order.getOrderedAt(),
                order.getIsWithinNewYork(),
                order.getCounty(),
                order.getRegion(),
                breakdownDto,
                jurisdictionsList
        );
    }
}