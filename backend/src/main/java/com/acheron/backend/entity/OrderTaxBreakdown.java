package com.acheron.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ToString(onlyExplicitlyIncluded = true)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "order_tax_breakdowns")
@Entity
public class OrderTaxBreakdown {

    @Id
    @Column(name = "order_id")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "state_rate", nullable = false, precision = 8, scale = 5)
    private BigDecimal stateRate = BigDecimal.ZERO;

    @Column(name = "county_rate", nullable = false, precision = 8, scale = 5)
    private BigDecimal countyRate = BigDecimal.ZERO;

    @Column(name = "city_rate", nullable = false, precision = 8, scale = 5)
    private BigDecimal cityRate = BigDecimal.ZERO;

    @Column(name = "special_rates", nullable = false, precision = 8, scale = 5)
    private BigDecimal specialRates = BigDecimal.ZERO;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "jurisdictions", columnDefinition = "jsonb")
    private List<String> jurisdictions = new ArrayList<>();
}
