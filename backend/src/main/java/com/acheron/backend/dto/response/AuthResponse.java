package com.acheron.backend.dto.response;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
