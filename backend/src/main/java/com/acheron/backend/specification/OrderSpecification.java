package com.acheron.backend.specification;

import com.acheron.backend.entity.Order;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public final class OrderSpecification {

    private OrderSpecification() {
    }

    public static Specification<Order> hasMinLatitude(BigDecimal minLat) {
        return (root, query, cb) -> minLat == null ? null : cb.greaterThanOrEqualTo(root.get("latitude"), minLat);
    }

    public static Specification<Order> hasMaxLatitude(BigDecimal maxLat) {
        return (root, query, cb) -> maxLat == null ? null : cb.lessThanOrEqualTo(root.get("latitude"), maxLat);
    }

    public static Specification<Order> hasMinLongitude(BigDecimal minLon) {
        return (root, query, cb) -> minLon == null ? null : cb.greaterThanOrEqualTo(root.get("longitude"), minLon);
    }

    public static Specification<Order> hasMaxLongitude(BigDecimal maxLon) {
        return (root, query, cb) -> maxLon == null ? null : cb.lessThanOrEqualTo(root.get("longitude"), maxLon);
    }

    public static Specification<Order> hasMinSubtotal(BigDecimal minSubtotal) {
        return (root, query, cb) -> minSubtotal == null ? null : cb.greaterThanOrEqualTo(root.get("subtotal"), minSubtotal);
    }

    public static Specification<Order> hasMaxSubtotal(BigDecimal maxSubtotal) {
        return (root, query, cb) -> maxSubtotal == null ? null : cb.lessThanOrEqualTo(root.get("subtotal"), maxSubtotal);
    }

    public static Specification<Order> hasMinTaxRate(BigDecimal minTaxRate) {
        return (root, query, cb) -> minTaxRate == null ? null : cb.greaterThanOrEqualTo(root.get("compositeTaxRate"), minTaxRate);
    }

    public static Specification<Order> hasMaxTaxRate(BigDecimal maxTaxRate) {
        return (root, query, cb) -> maxTaxRate == null ? null : cb.lessThanOrEqualTo(root.get("compositeTaxRate"), maxTaxRate);
    }

    public static Specification<Order> orderedAfter(LocalDateTime from) {
        return (root, query, cb) -> from == null ? null : cb.greaterThanOrEqualTo(root.get("orderedAt"), from);
    }

    public static Specification<Order> orderedBefore(LocalDateTime to) {
        return (root, query, cb) -> to == null ? null : cb.lessThanOrEqualTo(root.get("orderedAt"), to);
    }

    public static Specification<Order> isWithinNewYork(Boolean withinNewYork) {
        return (root, query, cb) -> withinNewYork == null ? null : cb.equal(root.get("isWithinNewYork"), withinNewYork);
    }

    public static Specification<Order> hasMinTotalAmount(BigDecimal minTotal) {
        return (root, query, cb) -> minTotal == null ? null : cb.greaterThanOrEqualTo(root.get("totalAmount"), minTotal);
    }

    public static Specification<Order> hasMaxTotalAmount(BigDecimal maxTotal) {
        return (root, query, cb) -> maxTotal == null ? null : cb.lessThanOrEqualTo(root.get("totalAmount"), maxTotal);
    }

    public static Specification<Order> hasCounty(String county) {
        return (root, query, cb) -> county == null ? null : cb.equal(cb.lower(root.get("county")), county.toLowerCase());
    }

    public static Specification<Order> hasRegion(String region) {
        return (root, query, cb) -> region == null ? null : cb.equal(cb.lower(root.get("region")), region.toLowerCase());
    }

    public static Specification<Order> hasImportFileId(UUID importFileId) {
        return (root, query, cb) -> importFileId == null ? null : cb.equal(root.get("importFile").get("id"), importFileId);
    }
}
