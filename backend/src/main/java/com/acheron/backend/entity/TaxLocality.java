package com.acheron.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
@ToString(onlyExplicitlyIncluded = true)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "tax_localities")
@Entity
public class TaxLocality extends AbstractAuditableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @ToString.Include
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    @ToString.Include
    private String locality;

    @Column(name = "tax_rate_percent", precision = 6, scale = 3)
    private BigDecimal taxRatePercent;

    @Column(name = "reporting_code", length = 10)
    private String reportingCode;

    @Column(name = "see_reference", length = 100)
    private String seeReference;

    @Column(name = "is_special_district")
    private Boolean isSpecialDistrict = false;

    @Column(name = "is_mctd_district")
    private Boolean isMctdDistrict = false;

    @Column(name = "parent_county", length = 100)
    private String parentCounty;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
