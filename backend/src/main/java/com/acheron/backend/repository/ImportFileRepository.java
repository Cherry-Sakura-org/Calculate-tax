package com.acheron.backend.repository;

import com.acheron.backend.entity.ImportFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ImportFileRepository extends JpaRepository<ImportFile, UUID> {

    Page<ImportFile> findAllByOrderByImportedAtDesc(Pageable pageable);

    Page<ImportFile> findAllByImportedByUserIdOrderByImportedAtDesc(UUID userId, Pageable pageable);
}
