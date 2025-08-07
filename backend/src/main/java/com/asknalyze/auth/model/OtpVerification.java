package com.asknalyze.auth.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document("otp_verification")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtpVerification {

    @Id
    private String id;

    private String email;
    private String otp;
    private LocalDateTime expiresAt;
    private boolean verified;
}
