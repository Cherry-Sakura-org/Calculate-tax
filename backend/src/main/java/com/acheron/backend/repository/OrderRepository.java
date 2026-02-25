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
}
