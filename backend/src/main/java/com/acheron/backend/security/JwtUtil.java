package com.acheron.backend.security;

import com.acheron.backend.entity.Role;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.ttl:1080000000}")
    private long ttl;

    private Algorithm algorithm;

    @PostConstruct
    public void init() {
        algorithm = Algorithm.HMAC512(secret);
    }

    public String generateToken(UUID userId, String username, Role role) {
        long nowMillis = System.currentTimeMillis();
        return JWT.create()
                .withSubject(username)
                .withClaim("id", userId.toString())
                .withClaim("role", role.name())
                .withIssuedAt(Instant.ofEpochMilli(nowMillis))
                .withExpiresAt(Instant.ofEpochMilli(nowMillis + ttl))
                .sign(algorithm);
    }

    public String getUsername(String token) {
        return decode(token).getSubject();
    }

    public String getRole(String token) {
        return decode(token).getClaim("role").asString();
    }

    public boolean validateToken(String token) {
        try {
            decode(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private DecodedJWT decode(String token) {
        return JWT.require(algorithm).build().verify(token);
    }
}
