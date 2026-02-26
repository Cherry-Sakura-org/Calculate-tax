package com.acheron.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "batch_import_errors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchImportError {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_execution_id", nullable = false)
    private BatchJobExecution jobExecution;
    
    private Integer rowNumber;
    
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    @Column(nullable = false)
    private String errorType;
    
    @Column(length = 1000)
    private String errorMessage;
    
    @Column(length = 2000)
    private String recordData;
}
