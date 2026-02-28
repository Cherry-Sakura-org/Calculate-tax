package com.acheron.backend.service;

import com.acheron.backend.dto.TaxCalculationResult;
import com.acheron.backend.dto.request.OrderRequest;
import com.acheron.backend.dto.response.OrderResponse;
import com.acheron.backend.entity.Order;
import com.acheron.backend.entity.OrderTaxBreakdown;
import com.acheron.backend.entity.User;
import com.acheron.backend.repository.OrderRepository;
import com.acheron.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.acheron.backend.entity.Role;
import com.acheron.backend.repository.ImportFileRepository;
import com.acheron.backend.specification.OrderSpecification;
import jakarta.persistence.EntityManager;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ImportFileRepository importFileRepository;
    private final GeoJsonTaxService geoJsonTaxService;
    private final UserService userService;
    private final DashboardService dashboardService;
    private final EntityManager entityManager;

    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(OrderResponse::fromEntity);
    }

    public Page<OrderResponse> getAllOrders(Specification<Order> spec, Pageable pageable) {
        return orderRepository.findAll(spec, pageable)
                .map(OrderResponse::fromEntity);
    }

    public Page<OrderResponse> getAllOrdersForCurrentUser(Specification<Order> spec, Pageable pageable, UUID userIdFilter) {
        User currentUser = userService.getCurrentUser();
        Specification<Order> finalSpec = spec;

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            if (userIdFilter != null) {
                finalSpec = finalSpec.and(OrderSpecification.createdByUserId(userIdFilter));
            }
        } else {
            finalSpec = finalSpec.and(OrderSpecification.createdByUserId(currentUser.getId()));
        }

        return orderRepository.findAll(finalSpec, pageable).map(OrderResponse::fromEntity);
    }

    public List<Order> getAllOrdersListForCurrentUser(Specification<Order> spec, UUID userIdFilter) {
        User currentUser = userService.getCurrentUser();
        Specification<Order> finalSpec = spec;

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            if (userIdFilter != null) {
                finalSpec = finalSpec.and(OrderSpecification.createdByUserId(userIdFilter));
            }
        } else {
            finalSpec = finalSpec.and(OrderSpecification.createdByUserId(currentUser.getId()));
        }

        return orderRepository.findAll(finalSpec);
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        TaxCalculationResult taxResult = geoJsonTaxService.calculateTax(
                request.latitude(),
                request.longitude()
        );

        BigDecimal taxAmount = request.subtotal()
                .multiply(taxResult.getCompositeTaxRate())
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = request.subtotal()
                .add(taxAmount)
                .setScale(2, RoundingMode.HALF_UP);

        User currentUser = getCurrentUser();

        OrderTaxBreakdown taxBreakdown = OrderTaxBreakdown.builder()
                .stateRate(taxResult.getStateRate())
                .countyRate(taxResult.getCountyRate())
                .cityRate(taxResult.getCityRate())
                .specialRates(taxResult.getSpecialRates())
                .jurisdictions(taxResult.getJurisdictions())
                .build();

        Order order = Order.builder()
                .latitude(request.latitude())
                .longitude(request.longitude())
                .subtotal(request.subtotal())
                .orderedAt(LocalDateTime.now())
                .compositeTaxRate(taxResult.getCompositeTaxRate())
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .isWithinNewYork(taxResult.isWithinNewYork())
                .county(taxResult.getCounty())
                .region(taxResult.getRegion())
                .createdByAdmin(currentUser)
                .build();

        order.setTaxBreakdown(taxBreakdown);

        Order savedOrder = orderRepository.save(order);

        log.info("Order created: orderId={}, total={}", savedOrder.getId(), totalAmount);

        return OrderResponse.fromEntity(savedOrder);
    }

    @Transactional
    public long deleteAllOrders() {
        long count = orderRepository.countAllOrders();
        entityManager.createNativeQuery("DELETE FROM order_tax_breakdowns").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM orders").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM import_files").executeUpdate();
        dashboardService.evictAllCaches();
        log.warn("TEST: hard-deleted all orders ({}), tax breakdowns, and import files", count);
        return count;
    }

    @Transactional
    public long deleteByImportFileId(UUID importFileId) {
        User currentUser = userService.getCurrentUser();
        Specification<Order> spec = Specification.where(OrderSpecification.hasImportFileId(importFileId));

        if (currentUser.getRole() != Role.SUPER_ADMIN) {
            spec = spec.and(OrderSpecification.createdByUserId(currentUser.getId()));
        }

        List<Order> orders = orderRepository.findAll(spec);
        orderRepository.deleteAll(orders);
        dashboardService.evictAllCaches();
        log.info("Soft-deleted {} orders for importFileId={}", orders.size(), importFileId);
        return orders.size();
    }

    @Transactional
    public long deleteByFilter(Specification<Order> spec, UUID userIdFilter) {
        User currentUser = userService.getCurrentUser();
        Specification<Order> finalSpec = spec;

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            if (userIdFilter != null) {
                finalSpec = finalSpec.and(OrderSpecification.createdByUserId(userIdFilter));
            }
        } else {
            finalSpec = finalSpec.and(OrderSpecification.createdByUserId(currentUser.getId()));
        }

        List<Order> orders = orderRepository.findAll(finalSpec);
        orderRepository.deleteAll(orders);
        dashboardService.evictAllCaches();
        log.info("Soft-deleted {} orders by filter", orders.size());
        return orders.size();
    }

    @Transactional
    public long deleteByIds(List<UUID> ids) {
        User currentUser = userService.getCurrentUser();
        List<Order> orders = orderRepository.findAllById(ids);

        if (currentUser.getRole() != Role.SUPER_ADMIN) {
            orders = orders.stream()
                    .filter(o -> o.getCreatedByAdmin().getId().equals(currentUser.getId()))
                    .toList();
        }

        orderRepository.deleteAll(orders);
        dashboardService.evictAllCaches();
        log.info("Soft-deleted {} orders by IDs", orders.size());
        return orders.size();
    }

    private User getCurrentUser() {
        return userService.getCurrentUser();
    }
}
