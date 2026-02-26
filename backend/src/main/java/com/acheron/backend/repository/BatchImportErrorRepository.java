package com.acheron.backend.repository;

import com.acheron.backend.entity.BatchImportError;
import com.acheron.backend.entity.BatchJobExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchImportErrorRepository extends JpaRepository<BatchImportError, Long> {
    
    List<BatchImportError> findByJobExecution(BatchJobExecution jobExecution);
    
    long countByJobExecution(BatchJobExecution jobExecution);
}
