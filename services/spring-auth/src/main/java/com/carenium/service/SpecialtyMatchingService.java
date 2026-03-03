package com.carenium.service;

import com.carenium.model.DoctorProfile;
import com.carenium.repository.DoctorProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Maps patient ailments to medical specializations and auto-assigns doctors.
 */
@Service
public class SpecialtyMatchingService {

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    // Ailment keywords → Specialization mapping
    private static final Map<String, String> AILMENT_SPECIALTY_MAP = new LinkedHashMap<>();

    static {
        // Cardiology
        AILMENT_SPECIALTY_MAP.put("chest pain", "Cardiologist");
        AILMENT_SPECIALTY_MAP.put("heart", "Cardiologist");
        AILMENT_SPECIALTY_MAP.put("cardiac", "Cardiologist");
        AILMENT_SPECIALTY_MAP.put("arrhythmia", "Cardiologist");
        AILMENT_SPECIALTY_MAP.put("hypertension", "Cardiologist");
        AILMENT_SPECIALTY_MAP.put("palpitation", "Cardiologist");

        // Dermatology
        AILMENT_SPECIALTY_MAP.put("skin rash", "Dermatologist");
        AILMENT_SPECIALTY_MAP.put("acne", "Dermatologist");
        AILMENT_SPECIALTY_MAP.put("eczema", "Dermatologist");
        AILMENT_SPECIALTY_MAP.put("psoriasis", "Dermatologist");
        AILMENT_SPECIALTY_MAP.put("dermatitis", "Dermatologist");

        // Endocrinology
        AILMENT_SPECIALTY_MAP.put("diabetes", "Endocrinologist");
        AILMENT_SPECIALTY_MAP.put("thyroid", "Endocrinologist");
        AILMENT_SPECIALTY_MAP.put("hormonal", "Endocrinologist");
        AILMENT_SPECIALTY_MAP.put("insulin", "Endocrinologist");

        // Orthopedics
        AILMENT_SPECIALTY_MAP.put("fracture", "Orthopedic Surgeon");
        AILMENT_SPECIALTY_MAP.put("joint pain", "Orthopedic Surgeon");
        AILMENT_SPECIALTY_MAP.put("bone", "Orthopedic Surgeon");
        AILMENT_SPECIALTY_MAP.put("sprain", "Orthopedic Surgeon");
        AILMENT_SPECIALTY_MAP.put("arthritis", "Orthopedic Surgeon");

        // Gastroenterology
        AILMENT_SPECIALTY_MAP.put("stomach", "Gastroenterologist");
        AILMENT_SPECIALTY_MAP.put("gastric", "Gastroenterologist");
        AILMENT_SPECIALTY_MAP.put("abdominal", "Gastroenterologist");
        AILMENT_SPECIALTY_MAP.put("liver", "Gastroenterologist");
        AILMENT_SPECIALTY_MAP.put("digestive", "Gastroenterologist");

        // Neurology
        AILMENT_SPECIALTY_MAP.put("headache", "Neurologist");
        AILMENT_SPECIALTY_MAP.put("migraine", "Neurologist");
        AILMENT_SPECIALTY_MAP.put("seizure", "Neurologist");
        AILMENT_SPECIALTY_MAP.put("nerve", "Neurologist");
        AILMENT_SPECIALTY_MAP.put("stroke", "Neurologist");
        AILMENT_SPECIALTY_MAP.put("epilepsy", "Neurologist");

        // ENT
        AILMENT_SPECIALTY_MAP.put("ear", "ENT Specialist");
        AILMENT_SPECIALTY_MAP.put("throat", "ENT Specialist");
        AILMENT_SPECIALTY_MAP.put("sinus", "ENT Specialist");
        AILMENT_SPECIALTY_MAP.put("tonsil", "ENT Specialist");
        AILMENT_SPECIALTY_MAP.put("hearing", "ENT Specialist");

        // Urology
        AILMENT_SPECIALTY_MAP.put("kidney", "Urologist");
        AILMENT_SPECIALTY_MAP.put("urinary", "Urologist");
        AILMENT_SPECIALTY_MAP.put("bladder", "Urologist");
        AILMENT_SPECIALTY_MAP.put("prostate", "Urologist");

        // Gynecology
        AILMENT_SPECIALTY_MAP.put("pregnancy", "Gynecologist / Obstetrician");
        AILMENT_SPECIALTY_MAP.put("menstrual", "Gynecologist / Obstetrician");
        AILMENT_SPECIALTY_MAP.put("obstetric", "Gynecologist / Obstetrician");
        AILMENT_SPECIALTY_MAP.put("gynec", "Gynecologist / Obstetrician");

        // Psychiatry
        AILMENT_SPECIALTY_MAP.put("depression", "Psychiatrist");
        AILMENT_SPECIALTY_MAP.put("anxiety", "Psychiatrist");
        AILMENT_SPECIALTY_MAP.put("mental", "Psychiatrist");
        AILMENT_SPECIALTY_MAP.put("bipolar", "Psychiatrist");
        AILMENT_SPECIALTY_MAP.put("schizophrenia", "Psychiatrist");

        // Ophthalmology
        AILMENT_SPECIALTY_MAP.put("eye", "Ophthalmologist");
        AILMENT_SPECIALTY_MAP.put("vision", "Ophthalmologist");
        AILMENT_SPECIALTY_MAP.put("cataract", "Ophthalmologist");
        AILMENT_SPECIALTY_MAP.put("glaucoma", "Ophthalmologist");

        // Pulmonology
        AILMENT_SPECIALTY_MAP.put("lung", "Pulmonologist");
        AILMENT_SPECIALTY_MAP.put("respiratory", "Pulmonologist");
        AILMENT_SPECIALTY_MAP.put("asthma", "Pulmonologist");
        AILMENT_SPECIALTY_MAP.put("pneumonia", "Pulmonologist");
        AILMENT_SPECIALTY_MAP.put("bronchitis", "Pulmonologist");
        AILMENT_SPECIALTY_MAP.put("breathing", "Pulmonologist");

        // Oncology
        AILMENT_SPECIALTY_MAP.put("cancer", "Oncologist");
        AILMENT_SPECIALTY_MAP.put("tumor", "Oncologist");
        AILMENT_SPECIALTY_MAP.put("malignant", "Oncologist");
        AILMENT_SPECIALTY_MAP.put("chemotherapy", "Oncologist");

        // Allergy / Immunology
        AILMENT_SPECIALTY_MAP.put("allergy", "Allergist / Immunologist");
        AILMENT_SPECIALTY_MAP.put("immune", "Allergist / Immunologist");
        AILMENT_SPECIALTY_MAP.put("autoimmune", "Allergist / Immunologist");

        // Pediatrics
        AILMENT_SPECIALTY_MAP.put("pediatric", "Pediatrician");
        AILMENT_SPECIALTY_MAP.put("child", "Pediatrician");
        AILMENT_SPECIALTY_MAP.put("infant", "Pediatrician");

        // Infectious Disease
        AILMENT_SPECIALTY_MAP.put("infection", "Infectious Disease Specialist");
        AILMENT_SPECIALTY_MAP.put("fever", "Infectious Disease Specialist");
        AILMENT_SPECIALTY_MAP.put("viral", "Infectious Disease Specialist");
        AILMENT_SPECIALTY_MAP.put("bacterial", "Infectious Disease Specialist");

        // Nephrology
        AILMENT_SPECIALTY_MAP.put("renal", "Nephrologist");
        AILMENT_SPECIALTY_MAP.put("dialysis", "Nephrologist");

        // Hematology
        AILMENT_SPECIALTY_MAP.put("blood", "Hematologist");
        AILMENT_SPECIALTY_MAP.put("anemia", "Hematologist");
        AILMENT_SPECIALTY_MAP.put("clotting", "Hematologist");

        // Rheumatology
        AILMENT_SPECIALTY_MAP.put("rheumat", "Rheumatologist");
        AILMENT_SPECIALTY_MAP.put("lupus", "Rheumatologist");
        AILMENT_SPECIALTY_MAP.put("fibromyalgia", "Rheumatologist");
    }

    /**
     * Match ailment text to a specialization.
     * Returns "General Physician" as fallback.
     */
    public String matchSpecialization(String ailment) {
        if (ailment == null || ailment.isBlank()) {
            return "General Physician";
        }

        String normalized = ailment.toLowerCase().trim();

        for (Map.Entry<String, String> entry : AILMENT_SPECIALTY_MAP.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return "General Physician";
    }

    /**
     * Auto-assign a doctor based on ailment and availability.
     * Returns the userId of the assigned doctor, or null if none available.
     */
    public String autoAssignDoctor(String ailment) {
        String specialization = matchSpecialization(ailment);
        List<DoctorProfile> candidates = doctorProfileRepository.findBySpecialization(specialization);

        if (candidates.isEmpty()) {
            // Fallback to General Physician
            candidates = doctorProfileRepository.findBySpecialization("General Physician");
        }

        if (candidates.isEmpty()) {
            return null;
        }

        // Simple round-robin: pick the first available (future: use availability_schedule)
        return candidates.get(0).getUserId();
    }

    /**
     * Get specialization for a given ailment (for frontend display).
     */
    public Map<String, String> getSpecialtyInfo(String ailment) {
        String spec = matchSpecialization(ailment);
        Map<String, String> info = new HashMap<>();
        info.put("ailment", ailment);
        info.put("recommendedSpecialization", spec);
        return info;
    }
}
