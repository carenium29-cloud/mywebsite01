package com.carenium.repository;

import com.carenium.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, String> {
    List<Patient> findByAssignedDocId(String assignedDocId);
    List<Patient> findByDeletedAtIsNull();
}
