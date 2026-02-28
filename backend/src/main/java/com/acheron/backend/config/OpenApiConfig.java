package com.acheron.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
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
                        .version("2.0")
                        .description("""
                                REST API for order management with automatic NY State tax calculation.
                                
                                ## Key Features
                                - **Native GeoJSON tax calculation** — point-in-polygon lookup, no external API calls
                                - **Tax breakdown** — state, county, city, and special district rates
                                - **Region classification** — NYC, Long Island, Hudson Valley, Capital District, Upstate
                                - **High-performance CSV import** — virtual threads, ~11k records/sec
                                - **Multi-file upload** — import multiple CSVs in one request
                                - **CSV export** — download filtered orders as CSV
                                - **Import file tracking** — per-file metadata with out-of-NY detection
                                - **Dashboard analytics** — cached aggregated stats with region/county breakdown
                                - **Map visualization** — GeoJSON order points, county aggregations, boundary layers
                                
                                ## Authentication
                                Currently all endpoints are open (no auth required).
                                
                                ## Pagination
                                All list endpoints support Spring Data pagination:
                                - `page` — 0-indexed page number (default: 0)
                                - `size` — page size (default: 20)
                                - `sort` — field + direction, e.g. `sort=totalAmount,desc`
                                
                                ## Regions
                                Orders within NY are classified into regions:
                                | Region | Description |
                                |--------|-------------|
                                | `NYC` | Five boroughs (Manhattan, Brooklyn, Queens, Bronx, Staten Island) |
                                | `Long Island` | Nassau, Suffolk counties |
                                | `Hudson Valley` | Westchester, Rockland, Putnam, Dutchess, Orange, Sullivan, Ulster |
                                | `Capital District` | Albany, Rensselaer, Saratoga, Schenectady |
                                | `Upstate` | All other NY counties |
                                | `Out of State` | Coordinates outside New York State |
                                
                                ## Tech Stack
                                Spring Boot 4.0 · PostgreSQL · Redis · GeoJSON (JTS Topology Suite)
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
                                .description("Local development server")))
                .tags(List.of(
                        new Tag().name("Orders")
                                .description("CRUD, filtering, CSV import/export, and import file tracking for orders"),
                        new Tag().name("Dashboard")
                                .description("Aggregated analytics — totals, top counties, region breakdown, tax rate distribution"),
                        new Tag().name("Map")
                                .description("GeoJSON order points, per-county aggregations, NY boundary layers, CSV preview"),
                        new Tag().name("Tax Localities")
                                .description("NY State tax locality data — rates, counties, special districts, reload/import")
                ));
    }
}
