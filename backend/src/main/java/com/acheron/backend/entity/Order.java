package com.acheron.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
@ToString(onlyExplicitlyIncluded = true)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE orders SET deleted_at = now() WHERE id=?")
@SQLRestriction("deleted_at is NULL")
@Table(name = "orders")
@Entity
public class Order extends AbstractAuditableEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @ToString.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_admin_id", nullable = false)
    private User createdByAdmin;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt;

    @Column(name = "composite_tax_rate", nullable = false, precision = 8, scale = 5)
    private BigDecimal compositeTaxRate;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private OrderTaxBreakdown taxBreakdown;

    public void setTaxBreakdown(OrderTaxBreakdown taxBreakdown) {
        if (taxBreakdown == null) {
            if (this.taxBreakdown != null) {
                this.taxBreakdown.setOrder(null);
            }
        } else {
            taxBreakdown.setOrder(this);
        }
        this.taxBreakdown = taxBreakdown;
    }
}
