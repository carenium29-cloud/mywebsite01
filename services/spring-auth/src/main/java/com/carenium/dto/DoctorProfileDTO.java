package com.carenium.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DoctorProfileDTO {
    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotNull(message = "Years of experience is required")
    @Min(value = 0, message = "Experience years must be non-negative")
    private Integer experienceYears;

    @NotBlank(message = "Qualification is required")
    private String qualification;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "Department is required")
    private String department;

    private String unit;
    private String availabilitySchedule;
    private String bio;
}
