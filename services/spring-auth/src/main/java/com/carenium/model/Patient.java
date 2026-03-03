package com.carenium.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Data
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank
    @Column(nullable = false)
    private String fullName;

    private String wardInfo;
    
    @NotBlank
    @Column(name = "medical_unit", nullable = false)
    private String medicalUnit;

    @Column(nullable = false)
    private String status = "STABLE";

    private String assignedDocId;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deletedAt;
}
