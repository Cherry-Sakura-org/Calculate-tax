package com.acheron.backend.service.geocoding;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ApiRateLimiter {

    private final long minIntervalMs;
    private long lastRequestTimeMs = 0L;

    public ApiRateLimiter(@Value("${geocoding.api-rate-limit.requests-per-second:1}") int requestsPerSecond) {
        if (requestsPerSecond <= 0) {
            throw new IllegalArgumentException("geocoding.api-rate-limit.requests-per-second must be > 0");
        }
        this.minIntervalMs = Math.max(1L, 1000L / requestsPerSecond);
    }

    public synchronized void acquire() {
        long now = System.currentTimeMillis();
        long elapsed = now - lastRequestTimeMs;

        if (elapsed < minIntervalMs) {
            long sleepMs = minIntervalMs - elapsed;
            try {
                Thread.sleep(sleepMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Interrupted while waiting for API rate limiter", e);
            }
        }

        lastRequestTimeMs = System.currentTimeMillis();
    }
}
