package com.asknalyze.ai.model;

import com.asknalyze.ai.dto.ResumeAnalysisResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document("resumes")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Resume {
    @Id
    private String id;
    private String userEmail;
    private String fileName;
    private long fileSize;
    private String fileType;
    private String jobDescription;
    private ResumeAnalysisResponse analysisResult;
    private LocalDateTime createdAt;
}
