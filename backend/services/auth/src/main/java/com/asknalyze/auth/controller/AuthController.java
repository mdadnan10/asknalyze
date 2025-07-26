package com.asknalyze.auth.controller;

import com.asknalyze.auth.dto.*;
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
                case "You are not Registered" -> HttpStatus.NOT_FOUND;
                case "Wrong Password" -> HttpStatus.UNAUTHORIZED;
                default -> HttpStatus.BAD_REQUEST;
            };
            return ResponseEntity.status(status).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password/request")
    public ResponseEntity<ApiResponse> requestOtp(@RequestBody RequestOtp dto) {
        ApiResponse response = authService.sendOtp(dto);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST).body(response);
    }

    @PostMapping("/forgot-password/verify")
    public ApiResponse verifyOtp(@RequestBody VerifyOtp dto) {
        boolean success = authService.verifyOtp(dto);
        return new ApiResponse(success ? "OTP verified" : "Invalid or expired OTP", success);
    }

    @PostMapping("/forgot-password/reset")
    public ApiResponse resetPassword(@RequestBody ResetPassword dto) {
        return authService.resetPassword(dto);
    }

    @GetMapping()
    public String check() {
        return "success";
    }


}
