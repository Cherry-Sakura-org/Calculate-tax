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
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final GeoJsonTaxService geoJsonTaxService;

    public List<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
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
                .createdByAdmin(currentUser)
                .build();

        order.setTaxBreakdown(taxBreakdown);

        Order savedOrder = orderRepository.save(order);

        log.info("Order created: orderId={}, total={}", savedOrder.getId(), totalAmount);

        return OrderResponse.fromEntity(savedOrder);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername("acheron")
                .orElseThrow(() -> new IllegalStateException("Current user not found: " + username));
    }
}
