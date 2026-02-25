package com.acheron.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Instant Wellness Kits API")
                        .version("1.0")
                        .description("""
                                REST API for order management with automatic tax calculation and geocoding.
                                
                                **Key Features:**
                                - 📍 Geocoding with Mapbox (New York State only)
                                - 💰 Automatic tax calculation (state, county, city, MCTD)
                                - 📊 Async CSV batch import with real-time progress
                                - 📡 SSE (Server-Sent Events) for live updates
                                - 📈 Detailed error reporting and job history
                                
                                **Tech Stack:**
                                - Spring Boot 4.0.3
                                - Spring Batch 6.0
                                - PostgreSQL + Redis
                                - Mapbox Geocoding API
                                """)
                        .contact(new Contact()
                                .name("Acheron Team")
                                .email("support@acheron.com")))
                .servers(List.of(
                        new Server()
                                .url("https://api.ya3.uk")
                                .description("Production server"),
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local development server")));
    }
}
