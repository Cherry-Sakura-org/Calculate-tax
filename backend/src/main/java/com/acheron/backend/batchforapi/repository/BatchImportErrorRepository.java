package com.acheron.backend.batchforapi.repository;

import com.acheron.backend.batchforapi.entity.BatchImportError;
import com.acheron.backend.batchforapi.entity.BatchJobExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchImportErrorRepository extends JpaRepository<BatchImportError, Long> {
    
    List<BatchImportError> findByJobExecution(BatchJobExecution jobExecution);
    
    long countByJobExecution(BatchJobExecution jobExecution);
}
