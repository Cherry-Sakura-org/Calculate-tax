package com.acheron.backend.api;

import com.acheron.backend.dto.request.LoginRequest;
import com.acheron.backend.dto.request.RegisterRequest;
import com.acheron.backend.dto.response.UserResponse;
import com.acheron.backend.entity.User;
import com.acheron.backend.repository.UserRepository;
import com.acheron.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
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
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request,
                                                  HttpServletResponse response) {
        UserResponse userResponse = userService.register(request);
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        userService.issueJwtCookie(user, response);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    @Operation(summary = "Login with email and password")
    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletResponse response) {
        UserResponse userResponse = userService.login(request);
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        userService.issueJwtCookie(user, response);
        return ResponseEntity.ok(userResponse);
    }

    @Operation(summary = "Get current authenticated user")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @Operation(summary = "Logout (clear cookie)")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        userService.clearJwtCookie(response);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get CSRF token")
    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken csrfToken) {
        return csrfToken;
    }
}
