package com.asknalyze.auth.service;

import com.asknalyze.auth.dto.*;
import com.asknalyze.auth.model.OtpVerification;
import com.asknalyze.auth.model.User;
import com.asknalyze.auth.repository.OtpVerificationRepository;
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

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@Slf4j
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private MailService mailService;

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
            return LoginResponse.failure("You are not Registered");
        }

        if (!bcryptPasswordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Wrong Password for user: {}", request.getEmail());
            return LoginResponse.failure("Wrong Password");
        }

        String token = jwtUtil.generateToken(user);
        log.info("User authenticated successfully: {}", user.getEmail());
        return LoginResponse.success(token);
    }

    public ApiResponse sendOtp(RequestOtp dto) {
        log.info("Initiating OTP generation for email: {}", dto.getEmail());

        boolean userExists = userRepository.existsByEmail(dto.getEmail());
        if (!userExists) {
            log.warn("OTP request failed: No registered user with email: {}", dto.getEmail());
            return new ApiResponse("You are not registered with the provided email.", false);
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        OtpVerification record = new OtpVerification();
        record.setEmail(dto.getEmail());
        record.setOtp(otp);
        record.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        record.setVerified(false);

        otpVerificationRepository.save(record);
        log.debug("OTP record saved for email: {} with expiry at {}", dto.getEmail(), record.getExpiresAt());

        try {
            mailService.sendOtpEmail(dto.getEmail(), otp);
            log.info("OTP email sent to: {}", dto.getEmail());
            return new ApiResponse("OTP sent to your registered email address.", true);
        } catch (Exception e) {
            log.error("Error sending OTP email to {}: {}", dto.getEmail(), e.getMessage());
            return new ApiResponse("Failed to send OTP email. Please try again.", false);
        }
    }

    public boolean verifyOtp(VerifyOtp dto) {
        log.info("Verifying OTP for email: {}", dto.getEmail());

        var recordOpt = otpVerificationRepository.findByEmailAndOtpAndVerifiedFalse(dto.getEmail(), dto.getOtp());
        if (recordOpt.isEmpty()) {
            log.warn("OTP not found or already used for email: {}", dto.getEmail());
            return false;
        }

        var record = recordOpt.get();

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("OTP expired for email: {}", dto.getEmail());
            return false;
        }

        record.setVerified(true);
        otpVerificationRepository.save(record);
        log.info("OTP verified successfully for email: {}", dto.getEmail());
        return true;
    }

    @Transactional
    public ApiResponse resetPassword(ResetPassword dto) {
        log.info("Attempting password reset for email: {}", dto.getEmail());

        var latestOtp = otpVerificationRepository.findTopByEmailOrderByExpiresAtDesc(dto.getEmail());

        if (latestOtp.isEmpty() || !latestOtp.get().isVerified()) {
            log.warn("No OTP found for email: {}", dto.getEmail());
            return new ApiResponse("OTP not verified or expired", false);
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            log.warn("Password mismatch for email: {}", dto.getEmail());
            return new ApiResponse("Passwords do not match", false);
        }

        var userOpt = userRepository.findByEmail(dto.getEmail());
        if (userOpt.isEmpty()) {
            log.warn("User not found for password reset: {}", dto.getEmail());
            return new ApiResponse("User not found", false);
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
        log.info("Password reset successfully for email: {}", dto.getEmail());

        return new ApiResponse("Password reset successfully", true);
    }

    @Transactional
    public ApiResponse updateProfile(UpdateProfileRequest request) {
        Optional<User> userInDb = Optional.empty();
        if (userRepository.existsByEmail(request.email)) {
            userInDb = userRepository.findByEmail(request.email);
            log.info("User loaded {} ", request.email);
        }

        if (userInDb.isPresent()) {
            log.info("Updating User for {}", request.email);
            userInDb.get().setFullName(request.fullName);
            userInDb.get().setRole(request.role);
            userInDb.get().setOrganization(request.organization);
            userInDb.get().setExperience(request.experience);
            userRepository.save(userInDb.get());
            log.info("Profile updated for {}", request.email);
            return new ApiResponse("Profile Updated Successfully, Re-login to update.", true);
        }

        return new ApiResponse("Unable to update you", false);
    }

}
