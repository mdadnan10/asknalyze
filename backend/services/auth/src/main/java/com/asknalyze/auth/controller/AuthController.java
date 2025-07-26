package com.asknalyze.auth.controller;

import com.asknalyze.auth.dto.ApiResponse;
import com.asknalyze.auth.dto.LoginRequest;
import com.asknalyze.auth.dto.LoginResponse;
import com.asknalyze.auth.dto.RegisterRequest;
import com.asknalyze.auth.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest request) {
        logger.debug("Received registration request for: {}", request.email);
        ApiResponse response = authService.registerUser(request);

        if (!response.isSuccess()) {
            logger.error("Registration failed for: {}", request.email);
            return ResponseEntity.badRequest().body(response);
        }

        logger.info("Registration successful for: {}", request.email);
        return ResponseEntity.status(201).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);

        if (!response.isSuccess()) {
            HttpStatus status = switch (response.getMessage()) {
                case "User not found" -> HttpStatus.NOT_FOUND;
                case "Invalid credentials" -> HttpStatus.UNAUTHORIZED;
                default -> HttpStatus.BAD_REQUEST;
            };
            return ResponseEntity.status(status).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping()
    public String check() {
        return "success";
    }


}
