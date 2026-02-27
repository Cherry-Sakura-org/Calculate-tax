package com.acheron.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.*;

@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
@ToString(onlyExplicitlyIncluded = true)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE users SET deleted_at = now() WHERE id=?")
@SQLRestriction("deleted_at is NULL")
@Table(name = "users")
@Entity
public class User extends AbstractAuditableEntity implements UserDetails, OAuth2User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @ToString.Include
    private UUID id;

    @Column(nullable = false, unique = true)
    @ToString.Include
    private String email;

    @Column(nullable = false, unique = true)
    @ToString.Include
    private String username;

    @Column(name = "password_hash")
    @JsonIgnore
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.ADMIN;

    @Column(name = "oauth_provider", length = 50)
    private String oauthProvider;

    @Column(name = "oauth_provider_id")
    private String oauthProviderId;

    @Transient
    @JsonIgnore
    @Builder.Default
    private Map<String, Object> oauthAttributes = new HashMap<>();

    // UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(role);
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // OAuth2User
    @Override
    public Map<String, Object> getAttributes() {
        return oauthAttributes;
    }

    @Override
    public String getName() {
        return username;
    }

    public boolean hasPassword() {
        return passwordHash != null && !passwordHash.isEmpty();
    }

    public boolean isOAuthUser() {
        return oauthProvider != null;
    }
}