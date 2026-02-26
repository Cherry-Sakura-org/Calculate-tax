package com.acheron.backend.dto.request;


import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record OrderRequest(
        
        @NotNull(message = "Latitude is required")
        @DecimalMin(value = "-90.0", message = "Latitude must be valid (between -90 and 90)")
        @DecimalMax(value = "90.0", message = "Latitude must be valid (between -90 and 90)")
        BigDecimal latitude,

        @NotNull(message = "Longitude is required")
        @DecimalMin(value = "-180.0", message = "Longitude must be valid (between -180 and 180)")
        @DecimalMax(value = "180.0", message = "Longitude must be valid (between -180 and 180)")
        BigDecimal longitude,

        @NotNull(message = "Subtotal is required")
        @Positive(message = "Subtotal must be strictly greater than zero")
        BigDecimal subtotal
) {
}