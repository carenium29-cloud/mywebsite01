package com.carenium.repository;

import com.carenium.model.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, String> {
    Optional<DoctorProfile> findByUserId(String userId);
    boolean existsByUserId(String userId);
    List<DoctorProfile> findBySpecialization(String specialization);
    List<DoctorProfile> findBySpecializationAndUnit(String specialization, String unit);
}
