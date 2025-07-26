package com.asknalyze.auth.service;

import com.asknalyze.auth.dto.ApiResponse;
import com.asknalyze.auth.dto.LoginRequest;
import com.asknalyze.auth.dto.LoginResponse;
import com.asknalyze.auth.dto.RegisterRequest;
import com.asknalyze.auth.model.User;
import com.asknalyze.auth.repository.UserRepository;
import com.asknalyze.auth.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Slf4j
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private static final BCryptPasswordEncoder bcryptPasswordEncoder = new BCryptPasswordEncoder();

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public ApiResponse registerUser(RegisterRequest request) {
        logger.info("Attempting to register user with email: {}", request.email);

        if (userRepository.existsByEmail(request.email)) {
            logger.warn("User already registered: {}", request.email);
            return new ApiResponse("User already registered", false);
        }

        if (!request.password.equals(request.confirmPassword)) {
            logger.warn("Password mismatch for email: {}", request.email);
            return new ApiResponse("Passwords do not match", false);
        }

        User user = new User();
        user.setFullName(request.fullName);
        user.setEmail(request.email);
        user.setExperience(request.experience);
        user.setOrganization(request.organization);
        user.setRole(request.role);
        user.setPassword(passwordEncoder.encode(request.password));

        userRepository.save(user);

        logger.info("User registered successfully: {}", request.email);
        return new ApiResponse("User registered successfully", true);
    }

    public LoginResponse login(LoginRequest request) {
        log.info("Authenticating user: {}", request.getEmail());

        var user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            log.warn("User not found: {}", request.getEmail());
            return LoginResponse.failure("User not found");
        }

        if (!bcryptPasswordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid credentials for user: {}", request.getEmail());
            return LoginResponse.failure("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        log.info("User authenticated successfully: {}", user.getEmail());
        return LoginResponse.success(token);
    }

}
