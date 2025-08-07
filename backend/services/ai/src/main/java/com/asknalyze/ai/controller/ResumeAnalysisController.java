package com.asknalyze.ai.controller;

import com.asknalyze.ai.dto.ApiResponse;
import com.asknalyze.ai.dto.ResumeAnalysisResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Slf4j
@RequestMapping("/api/ai/resume")
public class ResumeAnalysisController {

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> analyzeResume(
            @RequestParam("file")MultipartFile resume,
            @RequestParam(value = "jobDescription", required = false) String jobDescription,
            Authentication authentication
            ) {

        log.info("Resume analysis request received from user: {}", authentication.getName());

        String email = authentication.getName();

        ResumeAnalysisResponse result = new ResumeAnalysisResponse();

        log.info("File : {}", resume);
        log.info("JD : {}", jobDescription);

        return ResponseEntity.ok(new ApiResponse<>(true, "Resume analyzed successfully", result));
    }

}
