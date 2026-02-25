package com.acheron.backend.service;

import com.acheron.backend.entity.Role;
import com.acheron.backend.entity.User;
import com.acheron.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        if (!userRepository.existsByUsername("acheron")) {
            userRepository.save(User.builder()
                    .email("test@test.com")
                    .username("acheron")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(Role.ADMIN)
                    .build());
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username).get();
    }
}
