package com.acheron.backend.service;

import com.acheron.backend.dto.response.DashboardResponse;
import com.acheron.backend.dto.response.DashboardResponse.CountySummary;
import com.acheron.backend.dto.response.DashboardResponse.RegionSummary;
import com.acheron.backend.dto.response.DashboardResponse.TaxRateBucket;
import com.acheron.backend.dto.response.MapCountyResponse;
import com.acheron.backend.entity.Order;
import com.acheron.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final String CACHE_MAP = "map-county-data";
    private static final long DASHBOARD_CACHE_TTL_MS = 10 * 60 * 1000L;

    private final OrderRepository orderRepository;
    private final GeoJsonTaxService geoJsonTaxService;

    private final ConcurrentHashMap<String, CachedValue<DashboardResponse>> dashboardCache = new ConcurrentHashMap<>();

    private record CachedValue<T>(T value, Instant expiresAt) {
        boolean isExpired() { return Instant.now().isAfter(expiresAt); }
    }

    public DashboardResponse getDashboardStats() {
        CachedValue<DashboardResponse> cached = dashboardCache.get("stats");
        if (cached != null && !cached.isExpired()) {
            log.debug("Dashboard stats served from in-memory cache");
            return cached.value();
        }

        log.info("Computing dashboard stats (cache miss)...");

        long totalOrders = orderRepository.countAllOrders();
        long validOrders = orderRepository.countByIsWithinNewYork(true);
        long invalidOrders = orderRepository.countByIsWithinNewYork(false);

        BigDecimal totalSubtotal = orderRepository.sumSubtotal();
        BigDecimal totalTax = orderRepository.sumTaxAmount();
        BigDecimal totalRevenue = orderRepository.sumTotalAmount();
        BigDecimal avgTaxRate = orderRepository.avgCompositeTaxRate();
        BigDecimal minSubtotal = orderRepository.minSubtotal();
        BigDecimal maxSubtotal = orderRepository.maxSubtotal();

        BigDecimal avgOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<Order> validOrdersList = orderRepository.findAllWithinNewYork();
        List<CountySummary> topCounties = computeTopCounties(validOrdersList, 10);
        List<TaxRateBucket> taxRateDistribution = computeTaxRateDistribution(validOrdersList);
        List<RegionSummary> regionBreakdown = computeRegionBreakdown(validOrdersList);

        DashboardResponse response = DashboardResponse.builder()
                .totalOrders(totalOrders)
                .validOrders(validOrders)
                .invalidOrders(invalidOrders)
                .totalSubtotal(totalSubtotal)
                .totalTax(totalTax)
                .totalRevenue(totalRevenue)
                .averageOrderValue(avgOrderValue)
                .averageTaxRate(avgTaxRate.setScale(5, RoundingMode.HALF_UP))
                .minSubtotal(minSubtotal)
                .maxSubtotal(maxSubtotal)
                .topCounties(topCounties)
                .taxRateDistribution(taxRateDistribution)
                .regionBreakdown(regionBreakdown)
                .build();

        dashboardCache.put("stats", new CachedValue<>(response, Instant.now().plusMillis(DASHBOARD_CACHE_TTL_MS)));
        return response;
    }

    @Cacheable(cacheNames = CACHE_MAP)
    public List<MapCountyResponse> getMapCountyData() {
        log.info("Computing map county data (cache miss)...");

        List<Order> validOrders = orderRepository.findAllWithinNewYork();

        Map<String, List<Order>> ordersByCounty = new LinkedHashMap<>();
        for (Order order : validOrders) {
            String county = order.getCounty() != null
                    ? order.getCounty()
                    : geoJsonTaxService.findCounty(
                            order.getLatitude().doubleValue(),
                            order.getLongitude().doubleValue()
                    ).orElse("Unknown");
            ordersByCounty.computeIfAbsent(county, k -> new ArrayList<>()).add(order);
        }

        return ordersByCounty.entrySet().stream()
                .map(entry -> buildCountyResponse(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparingLong(MapCountyResponse::getOrderCount).reversed())
                .collect(Collectors.toList());
    }

    @CacheEvict(cacheNames = {CACHE_MAP}, allEntries = true)
    public void evictAllCaches() {
        dashboardCache.clear();
        log.info("Dashboard (in-memory) and map (Redis) caches evicted");
    }

    private List<CountySummary> computeTopCounties(List<Order> orders, int limit) {
        Map<String, List<Order>> byCounty = new LinkedHashMap<>();
        for (Order order : orders) {
            String county = order.getCounty() != null
                    ? order.getCounty()
                    : geoJsonTaxService.findCounty(
                            order.getLatitude().doubleValue(),
                            order.getLongitude().doubleValue()
                    ).orElse("Unknown");
            byCounty.computeIfAbsent(county, k -> new ArrayList<>()).add(order);
        }

        return byCounty.entrySet().stream()
                .map(entry -> {
                    List<Order> countyOrders = entry.getValue();
                    BigDecimal subtotal = countyOrders.stream()
                            .map(Order::getSubtotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal revenue = countyOrders.stream()
                            .map(Order::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return CountySummary.builder()
                            .county(entry.getKey())
                            .orderCount(countyOrders.size())
                            .totalSubtotal(subtotal)
                            .totalRevenue(revenue)
                            .build();
                })
                .sorted(Comparator.comparingLong(CountySummary::getOrderCount).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<RegionSummary> computeRegionBreakdown(List<Order> orders) {
        Map<String, List<Order>> byRegion = new LinkedHashMap<>();
        for (Order order : orders) {
            String region = order.getRegion() != null ? order.getRegion() : "Unknown";
            byRegion.computeIfAbsent(region, k -> new ArrayList<>()).add(order);
        }

        return byRegion.entrySet().stream()
                .map(entry -> {
                    List<Order> regionOrders = entry.getValue();
                    BigDecimal subtotal = regionOrders.stream()
                            .map(Order::getSubtotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal revenue = regionOrders.stream()
                            .map(Order::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal sumRate = regionOrders.stream()
                            .map(Order::getCompositeTaxRate)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal avgRate = !regionOrders.isEmpty()
                            ? sumRate.divide(BigDecimal.valueOf(regionOrders.size()), 5, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;

                    return RegionSummary.builder()
                            .region(entry.getKey())
                            .orderCount(regionOrders.size())
                            .totalSubtotal(subtotal)
                            .totalRevenue(revenue)
                            .averageTaxRate(avgRate)
                            .build();
                })
                .sorted(Comparator.comparingLong(RegionSummary::getOrderCount).reversed())
                .collect(Collectors.toList());
    }

    private List<TaxRateBucket> computeTaxRateDistribution(List<Order> orders) {
        Map<String, Long> buckets = new TreeMap<>();
        for (Order order : orders) {
            BigDecimal rate = order.getCompositeTaxRate();
            double ratePercent = rate.multiply(BigDecimal.valueOf(100)).doubleValue();
            String label;
            if (ratePercent < 4) {
                label = "< 4%";
            } else if (ratePercent < 7) {
                label = "4% - 7%";
            } else if (ratePercent < 8) {
                label = "7% - 8%";
            } else if (ratePercent < 9) {
                label = "8% - 9%";
            } else {
                label = ">= 9%";
            }
            buckets.merge(label, 1L, Long::sum);
        }

        return buckets.entrySet().stream()
                .map(e -> TaxRateBucket.builder()
                        .rateLabel(e.getKey())
                        .orderCount(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private MapCountyResponse buildCountyResponse(String county, List<Order> orders) {
        BigDecimal totalSubtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal sumTaxRate = BigDecimal.ZERO;

        for (Order order : orders) {
            totalSubtotal = totalSubtotal.add(order.getSubtotal());
            totalTax = totalTax.add(order.getTaxAmount());
            totalRevenue = totalRevenue.add(order.getTotalAmount());
            sumTaxRate = sumTaxRate.add(order.getCompositeTaxRate());
        }

        int count = orders.size();
        BigDecimal avgTaxRate = count > 0
                ? sumTaxRate.divide(BigDecimal.valueOf(count), 5, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal avgOrderValue = count > 0
                ? totalRevenue.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return MapCountyResponse.builder()
                .county(county)
                .orderCount(count)
                .totalSubtotal(totalSubtotal)
                .totalTax(totalTax)
                .totalRevenue(totalRevenue)
                .averageTaxRate(avgTaxRate)
                .averageOrderValue(avgOrderValue)
                .build();
    }
}
