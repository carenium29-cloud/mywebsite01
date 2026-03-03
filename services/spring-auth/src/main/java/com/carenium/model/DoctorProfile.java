package com.carenium.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_profiles", indexes = {
    @Index(name = "idx_doctor_profiles_specialization", columnList = "specialization"),
    @Index(name = "idx_doctor_profiles_user_id", columnList = "userId")
})
@Data
public class DoctorProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    @Column(nullable = false)
    private String specialization;

    @Column(name = "experience_years", nullable = false)
    private int experienceYears;

    @Column(nullable = false)
    private String qualification;

    @Column(name = "license_number", nullable = false)
    private String licenseNumber;

    @Column(nullable = false)
    private String department;

    private String unit;

    @Column(name = "availability_schedule", columnDefinition = "jsonb")
    private String availabilitySchedule = "{\"monday\":true,\"tuesday\":true,\"wednesday\":true,\"thursday\":true,\"friday\":true,\"saturday\":false,\"sunday\":false,\"shift\":\"morning\"}";

    private String bio;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
