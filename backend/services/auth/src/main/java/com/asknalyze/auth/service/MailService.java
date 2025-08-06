package com.asknalyze.auth.service;

import com.asknalyze.auth.dto.MailRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MailService {

    @Autowired
    private JavaMailSender mailSender;


    @Async
    public void sendEmail(MailRequest request) {
        String to = request.getSendTo();
        String context = request.getContext();
        log.info("Sending {} email to {}", context, to);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(request.getSubject());
            message.setText(request.getMessage() + "\n\n- Team Asknalyze");
            mailSender.send(message);
            log.debug("{} Email dispatched successfully to {}", context, to);
        } catch (Exception e){
            log.error("Failed to send {} email to {}. Reason: {}", context,to, e.getMessage(), e);
            throw new RuntimeException("Failed to send" + context + "email");
        }
    }

}
