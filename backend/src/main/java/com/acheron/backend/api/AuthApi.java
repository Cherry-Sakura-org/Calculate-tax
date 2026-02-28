package com.acheron.backend.api;

import com.acheron.backend.dto.request.LoginRequest;
import com.acheron.backend.dto.request.RegisterRequest;
import com.acheron.backend.dto.response.AuthResponse;
import com.acheron.backend.dto.response.UserResponse;
import com.acheron.backend.entity.User;
import com.acheron.backend.repository.UserRepository;
import com.acheron.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "Authentication endpoints")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthApi {

    private final UserService userService;
    private final UserRepository userRepository;

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse userResponse = userService.register(request);
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        String token = userService.generateToken(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, userResponse));
    }

    @Operation(summary = "Login with email and password")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        UserResponse userResponse = userService.login(request);
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        String token = userService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, userResponse));
    }

    @Operation(summary = "Get current authenticated user")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }
}
