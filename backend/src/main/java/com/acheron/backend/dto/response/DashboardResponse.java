package com.acheron.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class DashboardResponse implements Serializable {

    @JsonProperty("total_orders")
    private long totalOrders;

    @JsonProperty("valid_orders")
    private long validOrders;

    @JsonProperty("invalid_orders")
    private long invalidOrders;

    @JsonProperty("total_subtotal")
    private BigDecimal totalSubtotal;

    @JsonProperty("total_tax")
    private BigDecimal totalTax;

    @JsonProperty("total_revenue")
    private BigDecimal totalRevenue;

    @JsonProperty("average_order_value")
    private BigDecimal averageOrderValue;

    @JsonProperty("average_tax_rate")
    private BigDecimal averageTaxRate;

    @JsonProperty("min_subtotal")
    private BigDecimal minSubtotal;

    @JsonProperty("max_subtotal")
    private BigDecimal maxSubtotal;

    @JsonProperty("top_counties")
    private List<CountySummary> topCounties;

    @JsonProperty("tax_rate_distribution")
    private List<TaxRateBucket> taxRateDistribution;

    @JsonProperty("region_breakdown")
    private List<RegionSummary> regionBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CountySummary implements Serializable {
        private String county;

        @JsonProperty("order_count")
        private long orderCount;

        @JsonProperty("total_subtotal")
        private BigDecimal totalSubtotal;

        @JsonProperty("total_revenue")
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxRateBucket implements Serializable {
        @JsonProperty("rate_label")
        private String rateLabel;

        @JsonProperty("order_count")
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegionSummary implements Serializable {
        private String region;

        @JsonProperty("order_count")
        private long orderCount;

        @JsonProperty("total_subtotal")
        private BigDecimal totalSubtotal;

        @JsonProperty("total_revenue")
        private BigDecimal totalRevenue;

        @JsonProperty("average_tax_rate")
        private BigDecimal averageTaxRate;
    }
}
