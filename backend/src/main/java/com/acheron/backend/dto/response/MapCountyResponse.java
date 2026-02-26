package com.acheron.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapCountyResponse implements Serializable {

    private String county;

    @JsonProperty("order_count")
    private long orderCount;

    @JsonProperty("total_subtotal")
    private BigDecimal totalSubtotal;

    @JsonProperty("total_tax")
    private BigDecimal totalTax;

    @JsonProperty("total_revenue")
    private BigDecimal totalRevenue;

    @JsonProperty("average_tax_rate")
    private BigDecimal averageTaxRate;

    @JsonProperty("average_order_value")
    private BigDecimal averageOrderValue;
}
