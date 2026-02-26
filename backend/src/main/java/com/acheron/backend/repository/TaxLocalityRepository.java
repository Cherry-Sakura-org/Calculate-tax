package com.acheron.backend.repository;

import com.acheron.backend.entity.TaxLocality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaxLocalityRepository extends JpaRepository<TaxLocality, UUID> {
    
    Optional<TaxLocality> findByLocalityIgnoreCase(String locality);
    
    @Query("SELECT t FROM TaxLocality t WHERE LOWER(t.locality) = LOWER(?1) OR LOWER(t.parentCounty) = LOWER(?1)")
    Optional<TaxLocality> findByLocalityOrCounty(String name);
    
    boolean existsByLocality(String locality);
}
