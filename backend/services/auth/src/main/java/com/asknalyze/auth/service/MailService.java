package com.asknalyze.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        log.info("Sending OTP email to {}", to);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("OTP for Password Reset");
            message.setText("Your OTP code is: " + otp + "\n\nThis will expire in 5 minutes.\n\n- Team Asknalyze");
            mailSender.send(message);
            log.debug("Email dispatched successfully to {}", to);
        } catch (Exception e){
            log.error("Failed to send OTP email to {}. Reason: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send OTP email");
        }
    }

}
