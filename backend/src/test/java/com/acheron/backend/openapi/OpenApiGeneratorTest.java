package com.acheron.backend.openapi;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc(addFilters = false)
class OpenApiGeneratorTest {

    @Autowired
    private MockMvc mockMvc;

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18-alpine");

    @Container
    @ServiceConnection(name = "redis")
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:8.0-alpine"))
            .withExposedPorts(6379);

    @Test
    void generateOpenApiYaml() throws Exception {
        byte[] apiDocs = mockMvc.perform(get("/v3/api-docs.yaml"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        Path directory = Paths.get("requests");
        if (!Files.exists(directory)) {
            Files.createDirectories(directory);
        }

        Path path = Paths.get("requests/openapi.yaml");
        Files.write(path, apiDocs);

        System.out.println("✅ OpenAPI spec generated: " + path.toAbsolutePath());
    }
    
    @Test
    void generateOpenApiJson() throws Exception {
        byte[] apiDocs = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        Path directory = Paths.get("requests");
        if (!Files.exists(directory)) {
            Files.createDirectories(directory);
        }

        Path path = Paths.get("requests/openapi.json");
        Files.write(path, apiDocs);

        System.out.println("✅ OpenAPI spec generated: " + path.toAbsolutePath());
    }
}
