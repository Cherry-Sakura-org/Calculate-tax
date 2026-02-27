package com.acheron.backend.security;

import com.acheron.backend.entity.User;
import com.acheron.backend.repository.UserRepository;
import com.acheron.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final UserRepository userRepository;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        Object principal = authentication.getPrincipal();

        User user;
        if (principal instanceof User u) {
            user = u;
        } else if (principal instanceof OAuth2User oauthUser) {
            String email = oauthUser.getAttribute("email");
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("OAuth user not found after login: " + email));
        } else {
            throw new IllegalStateException("Unexpected principal type: " + principal.getClass().getName());
        }

        userService.issueJwtCookie(user, response);
        log.info("OAuth2 login success: {} ({})", user.getUsername(), user.getOauthProvider());
        response.sendRedirect(frontendUrl + "/?oauth=success");
    }
}
