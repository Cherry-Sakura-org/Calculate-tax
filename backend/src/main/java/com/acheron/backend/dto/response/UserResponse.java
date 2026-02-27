package com.acheron.backend.dto.response;

import com.acheron.backend.entity.Role;
import com.acheron.backend.entity.User;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String username,
        String email,
        Role role,
        String oauthProvider
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getOauthProvider()
        );
    }
}
