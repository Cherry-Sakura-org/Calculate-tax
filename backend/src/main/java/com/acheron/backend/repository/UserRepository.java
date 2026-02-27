package com.acheron.backend.repository;

import com.acheron.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByOauthProviderAndOauthProviderId(String oauthProvider, String oauthProviderId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
