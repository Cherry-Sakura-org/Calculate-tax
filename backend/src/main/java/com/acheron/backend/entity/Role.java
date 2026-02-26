package com.acheron.backend.entity;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;

public enum Role implements GrantedAuthority {
    ADMIN, SUPER_ADMIN;

    @Override
    public @Nullable String getAuthority() {
        return name();
    }
}
