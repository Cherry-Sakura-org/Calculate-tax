package com.acheron.backend.specification;

import com.acheron.backend.entity.Order;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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

    public static Specification<Order> hasCountiesOrRegions(List<String> counties, List<String> regions) {
        return (root, query, cb) -> {
            boolean hasCounties = counties != null && !counties.isEmpty();
            boolean hasRegions = regions != null && !regions.isEmpty();

            if (!hasCounties && !hasRegions) return null;

            if (hasCounties && !hasRegions) {
                return cb.lower(root.get("county")).in(
                        counties.stream().map(String::toLowerCase).toList()
                );
            }

            if (!hasCounties) {
                return cb.lower(root.get("region")).in(
                        regions.stream().map(String::toLowerCase).toList()
                );
            }

            return cb.or(
                    cb.lower(root.get("county")).in(
                            counties.stream().map(String::toLowerCase).toList()
                    ),
                    cb.lower(root.get("region")).in(
                            regions.stream().map(String::toLowerCase).toList()
                    )
            );
        };
    }

    public static Specification<Order> hasImportFileId(UUID importFileId) {
        return (root, query, cb) -> importFileId == null ? null : cb.equal(root.get("importFile").get("id"), importFileId);
    }

    /**
     * Combined source filter (importFileIds + manualOnly) with OR logic:
     * - manualOnly=true  → only manual (importFile IS NULL), ignores importFileIds
     * - manualOnly=false → only imported from selected files (or all imported if no files selected)
     * - manualOnly=null  + importFileIds set → importFile IN (...) OR importFile IS NULL (both)
     * - manualOnly=null  + no importFileIds  → no filter (all orders)
     */
    public static Specification<Order> hasSourceFilter(List<UUID> importFileIds, Boolean manualOnly) {
        return (root, query, cb) -> {
            boolean hasFiles = importFileIds != null && !importFileIds.isEmpty();

            if (manualOnly != null) {
                if (manualOnly) {
                    return cb.isNull(root.get("importFile"));
                } else {
                    if (hasFiles) {
                        return root.get("importFile").get("id").in(importFileIds);
                    }
                    return cb.isNotNull(root.get("importFile"));
                }
            }

            // manualOnly not set — if files selected, show those files + manual
            if (hasFiles) {
                return cb.or(
                        root.get("importFile").get("id").in(importFileIds),
                        cb.isNull(root.get("importFile"))
                );
            }

            return null; // no filter
        };
    }

    public static Specification<Order> createdByUserId(UUID userId) {
        return (root, query, cb) -> userId == null ? null : cb.equal(root.get("createdByAdmin").get("id"), userId);
    }
}
