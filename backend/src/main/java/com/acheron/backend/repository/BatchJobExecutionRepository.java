package com.acheron.backend.repository;

import com.acheron.backend.entity.BatchJobExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchJobExecutionRepository extends JpaRepository<BatchJobExecution, Long> {
    
    Page<BatchJobExecution> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    List<BatchJobExecution> findTop10ByOrderByCreatedAtDesc();
    
    List<BatchJobExecution> findByStatusIn(List<BatchJobExecution.JobStatus> statuses);
}
