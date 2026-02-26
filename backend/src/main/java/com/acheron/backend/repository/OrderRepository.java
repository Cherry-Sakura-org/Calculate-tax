package com.acheron.backend.repository;

import com.acheron.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    @Query("SELECT o FROM Order o WHERE o.latitude BETWEEN :minLat AND :maxLat AND o.longitude BETWEEN :minLon AND :maxLon")
    List<Order> findWithinBoundingBox(BigDecimal minLat, BigDecimal maxLat,
                                      BigDecimal minLon, BigDecimal maxLon);

    @Query("SELECT COUNT(o) FROM Order o")
    long countAllOrders();

    long countByIsWithinNewYork(Boolean isWithinNewYork);

    @Query("SELECT COALESCE(SUM(o.subtotal), 0) FROM Order o")
    BigDecimal sumSubtotal();

    @Query("SELECT COALESCE(SUM(o.taxAmount), 0) FROM Order o")
    BigDecimal sumTaxAmount();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    BigDecimal sumTotalAmount();

    @Query("SELECT COALESCE(AVG(o.compositeTaxRate), 0) FROM Order o WHERE o.isWithinNewYork = true")
    BigDecimal avgCompositeTaxRate();

    @Query("SELECT COALESCE(MIN(o.subtotal), 0) FROM Order o")
    BigDecimal minSubtotal();

    @Query("SELECT COALESCE(MAX(o.subtotal), 0) FROM Order o")
    BigDecimal maxSubtotal();

    @Query("SELECT o FROM Order o WHERE o.isWithinNewYork = true")
    List<Order> findAllWithinNewYork();
}
