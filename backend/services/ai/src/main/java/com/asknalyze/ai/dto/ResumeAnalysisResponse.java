package com.asknalyze.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumeAnalysisResponse {
    private String id;
    private List<String> skills;
    private List<String> experience;
    private List<String> education;
    private List<String> strengths;
    private List<String> suggestions;
    private int jobFit;
    private String summary;
}
