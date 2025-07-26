package com.asknalyze.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private String token;

    public static LoginResponse success(String token) {
        return new LoginResponse(true, "Login successful", token);
    }

    public static LoginResponse failure(String message) {
        return new LoginResponse(false, message, null);
    }
}
