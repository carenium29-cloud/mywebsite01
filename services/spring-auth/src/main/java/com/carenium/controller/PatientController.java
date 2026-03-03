package com.carenium.controller;

import com.carenium.dto.PatientDTO;
import com.carenium.model.Patient;
import com.carenium.repository.PatientRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping
    public List<Patient> getAllActivePatients() {
        return patientRepository.findByDeletedAtIsNull();
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@Valid @RequestBody PatientDTO patientDTO) {
        Patient patient = new Patient();
        patient.setFullName(patientDTO.getFullName());
        patient.setWardInfo(patientDTO.getWardInfo());
        patient.setMedicalUnit(patientDTO.getMedicalUnit()); // FIX: Persist medical unit
        patient.setStatus(patientDTO.getStatus() != null ? patientDTO.getStatus() : "STABLE");
        patient.setAssignedDocId(patientDTO.getAssignedDocId());
        
        Patient savedPatient = patientRepository.save(patient);
        return ResponseEntity.ok(savedPatient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable String id, @Valid @RequestBody PatientDTO patientDTO) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        patient.setFullName(patientDTO.getFullName());
        patient.setWardInfo(patientDTO.getWardInfo());
        patient.setMedicalUnit(patientDTO.getMedicalUnit()); // FIX: Allow updating medical unit
        patient.setStatus(patientDTO.getStatus());
        patient.setAssignedDocId(patientDTO.getAssignedDocId());
        
        Patient updatedPatient = patientRepository.save(patient);
        return ResponseEntity.ok(updatedPatient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable String id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        patient.setDeletedAt(java.time.LocalDateTime.now()); // Soft delete
        patientRepository.save(patient);
        return ResponseEntity.ok("Patient record deleted (soft)");
    }
}
