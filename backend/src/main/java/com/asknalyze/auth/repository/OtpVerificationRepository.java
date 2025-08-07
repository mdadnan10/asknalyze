package com.asknalyze.auth.repository;

import com.asknalyze.auth.model.OtpVerification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OtpVerificationRepository extends MongoRepository<OtpVerification, String> {
    Optional<OtpVerification> findByEmailAndOtpAndVerifiedFalse(String email, String otp);
    Optional<OtpVerification> findTopByEmailOrderByExpiresAtDesc(String email);
}
