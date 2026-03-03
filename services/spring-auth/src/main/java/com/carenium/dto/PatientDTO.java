package com.carenium.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PatientDTO {
    @NotBlank(message = "Patient name is required")
    private String fullName;
    
    private String wardInfo;
    
    @NotBlank(message = "Medical Unit is required for admission")
    private String medicalUnit;
    
    private String status;
    private String assignedDocId;
}
