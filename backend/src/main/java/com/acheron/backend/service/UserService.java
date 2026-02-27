package com.acheron.backend.service;

import com.acheron.backend.dto.request.LoginRequest;
import com.acheron.backend.dto.request.RegisterRequest;
import com.acheron.backend.dto.response.UserResponse;
import com.acheron.backend.entity.Role;
import com.acheron.backend.entity.User;
import com.acheron.backend.repository.UserRepository;
import com.acheron.backend.security.JwtUtil;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
public class UserService implements UserDetailsService, OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostConstruct
    void seedDefaultAdmin() {
        var existing = userRepository.findByEmail("test@test.com");
        if (existing.isPresent()) {
            User user = existing.get();
            if (!"acheron".equals(user.getUsername())) {
                user.setUsername("acheron");
                user.setRole(Role.SUPER_ADMIN);
                user.setPasswordHash(passwordEncoder.encode("password"));
                userRepository.save(user);
                log.info("Default SUPER_ADMIN user 'acheron' repaired (was '{}')", user.getUsername());
            }
            return;
        }
        if (!userRepository.existsByUsername("acheron")) {
            userRepository.save(User.builder()
                    .email("test@test.com")
                    .username("acheron")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(Role.SUPER_ADMIN)
                    .build());
            log.info("Default SUPER_ADMIN user 'acheron' seeded");
        }
    }

    // ── Auth ──────────────────────────────────────────────

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        User user = userRepository.save(User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.ADMIN)
                .build());

        log.info("User registered: {}", user.getUsername());
        return UserResponse.fromEntity(user);
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.hasPassword() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return UserResponse.fromEntity(user);
    }

    public String generateToken(User user) {
        return jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
    }

    // ── OAuth2 ──────────────────────────────────────────────

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauthUser = new DefaultOAuth2UserService().loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        return resolveOAuthUser(oauthUser, registrationId);
    }

    @Transactional
    public OidcUser loadOidcUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = new OidcUserService().loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        resolveOAuthUser(oidcUser, registrationId);
        return oidcUser;
    }

    private User resolveOAuthUser(OAuth2User oauthUser, String registrationId) {
        String providerId = extractProviderId(oauthUser, registrationId);
        String email = extractEmail(oauthUser);
        String login = extractLogin(oauthUser, registrationId);

        User user = userRepository.findByOauthProviderAndOauthProviderId(registrationId, providerId)
                .orElseGet(() -> {
                    String username = generateUniqueUsername(login);
                    User newUser = User.builder()
                            .email(email)
                            .username(username)
                            .oauthProvider(registrationId)
                            .oauthProviderId(providerId)
                            .role(Role.ADMIN)
                            .build();
                    log.info("OAuth2 user created: {} ({})", username, registrationId);
                    return userRepository.save(newUser);
                });

        user.setOauthAttributes(oauthUser.getAttributes());
        return user;
    }

    private String extractProviderId(OAuth2User oauthUser, String registrationId) {
        return switch (registrationId) {
            case "github" -> oauthUser.getAttribute("id").toString();
            case "google" -> oauthUser.getAttribute("sub");
            default -> throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        };
    }

    private String extractEmail(OAuth2User oauthUser) {
        String email = oauthUser.getAttribute("email");
        if (email == null) {
            throw new OAuth2AuthenticationException("Email not available from OAuth provider");
        }
        return email;
    }

    private String extractLogin(OAuth2User oauthUser, String registrationId) {
        return switch (registrationId) {
            case "github" -> oauthUser.getAttribute("login");
            case "google" -> oauthUser.getAttribute("name");
            default -> "user";
        };
    }

    private String generateUniqueUsername(String base) {
        if (base == null || base.isBlank()) {
            base = "user_" + UUID.randomUUID().toString().substring(0, 6);
        }
        String clean = base.replaceAll("[^\\p{L}\\p{N}_-]", "_");
        if (clean.matches("^_+$")) {
            clean = "user_" + UUID.randomUUID().toString().substring(0, 6);
        }
        if (!userRepository.existsByUsername(clean)) return clean;
        for (int i = 1; i < 1000; i++) {
            String candidate = clean + "_" + i;
            if (!userRepository.existsByUsername(candidate)) return candidate;
        }
        return clean + "_" + UUID.randomUUID().toString().substring(0, 6);
    }

    // ── UserDetailsService ──────────────────────────────────

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    // ── Helpers ──────────────────────────────────────────────

    public User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw new IllegalStateException("No authenticated user");
        }
        return user;
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::fromEntity);
    }
}
