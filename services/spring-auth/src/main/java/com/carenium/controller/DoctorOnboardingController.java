package com.carenium.controller;

import com.carenium.dto.DoctorProfileDTO;
import com.carenium.model.DoctorProfile;
import com.carenium.repository.DoctorProfileRepository;
import com.carenium.service.AuditService;
import com.carenium.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/doctor")
public class DoctorOnboardingController {

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private AuditService auditService;

    /**
     * Check if the current doctor has completed onboarding.
     */
    @GetMapping("/check-onboarding")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> checkOnboarding() {
        String userId = getCurrentUserId();
        boolean onboarded = doctorProfileRepository.existsByUserId(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("onboarded", onboarded);

        if (onboarded) {
            DoctorProfile profile = doctorProfileRepository.findByUserId(userId).orElse(null);
            if (profile != null) {
                response.put("specialization", profile.getSpecialization());
                response.put("department", profile.getDepartment());
                response.put("unit", profile.getUnit());
            }
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Save doctor profile during first-login onboarding.
     */
    @PostMapping("/onboarding")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> completeOnboarding(@Valid @RequestBody DoctorProfileDTO dto) {
        String userId = getCurrentUserId();

        // Prevent duplicate onboarding
        if (doctorProfileRepository.existsByUserId(userId)) {
            return ResponseEntity.badRequest().body("Profile already exists. Use PUT /api/doctor/profile to update.");
        }

        DoctorProfile profile = new DoctorProfile();
        profile.setUserId(userId);
        profile.setSpecialization(dto.getSpecialization());
        profile.setExperienceYears(dto.getExperienceYears());
        profile.setQualification(dto.getQualification());
        profile.setLicenseNumber(dto.getLicenseNumber());
        profile.setDepartment(dto.getDepartment());
        profile.setUnit(dto.getUnit());
        profile.setBio(dto.getBio());

        if (dto.getAvailabilitySchedule() != null) {
            profile.setAvailabilitySchedule(dto.getAvailabilitySchedule());
        }

        DoctorProfile saved = doctorProfileRepository.save(profile);

        auditService.logAction(userId, saved.getId(), "ONBOARDING_COMPLETE",
                "Doctor completed onboarding with specialization: " + dto.getSpecialization());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile created successfully");
        response.put("profileId", saved.getId());
        response.put("specialization", saved.getSpecialization());

        return ResponseEntity.ok(response);
    }

    /**
     * Get the current doctor's full profile.
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> getProfile() {
        String userId = getCurrentUserId();
        Optional<DoctorProfile> profile = doctorProfileRepository.findByUserId(userId);

        if (profile.isEmpty()) {
            return ResponseEntity.status(404).body("Profile not found. Complete onboarding first.");
        }

        return ResponseEntity.ok(profile.get());
    }

    /**
     * Update doctor profile (specialization changes are blocked — must use admin request).
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody DoctorProfileDTO dto) {
        String userId = getCurrentUserId();
        Optional<DoctorProfile> existing = doctorProfileRepository.findByUserId(userId);

        if (existing.isEmpty()) {
            return ResponseEntity.status(404).body("Profile not found.");
        }

        DoctorProfile profile = existing.get();

        // SECURITY: Block specialization change without admin approval
        if (!profile.getSpecialization().equals(dto.getSpecialization())) {
            return ResponseEntity.status(403)
                    .body("Specialization changes require admin approval. Submit a change request.");
        }

        profile.setExperienceYears(dto.getExperienceYears());
        profile.setQualification(dto.getQualification());
        profile.setLicenseNumber(dto.getLicenseNumber());
        profile.setDepartment(dto.getDepartment());
        profile.setUnit(dto.getUnit());
        profile.setBio(dto.getBio());

        if (dto.getAvailabilitySchedule() != null) {
            profile.setAvailabilitySchedule(dto.getAvailabilitySchedule());
        }

        doctorProfileRepository.save(profile);

        auditService.logAction(userId, profile.getId(), "PROFILE_UPDATE",
                "Doctor updated profile fields");

        return ResponseEntity.ok(profile);
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userDetails.getId();
    }
}
