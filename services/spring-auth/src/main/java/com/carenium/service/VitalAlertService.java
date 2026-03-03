package com.carenium.service;

import com.carenium.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Evaluates patient vitals against clinical thresholds and emits real-time alerts.
 */
@Service
public class VitalAlertService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private AuditService auditService;

    // Clinical thresholds
    private static final int HR_HIGH = 120;
    private static final int HR_LOW = 40;
    private static final int SPO2_LOW = 90;
    private static final double TEMP_HIGH = 39.0;
    private static final int SYSTOLIC_HIGH = 180;
    private static final int SYSTOLIC_LOW = 80;

    /**
     * Check vitals and emit alerts if thresholds exceeded.
     */
    public void evaluateVitals(String patientId, String doctorId, int heartRate,
                                int spo2, double temperature, String bloodPressure) {

        StringBuilder alertMessages = new StringBuilder();
        String riskLevel = "LOW";

        // Heart Rate
        if (heartRate > HR_HIGH) {
            alertMessages.append("Tachycardia detected (HR: ").append(heartRate).append(" BPM). ");
            riskLevel = "HIGH";
        } else if (heartRate < HR_LOW) {
            alertMessages.append("Bradycardia detected (HR: ").append(heartRate).append(" BPM). ");
            riskLevel = "CRITICAL";
        }

        // SpO2
        if (spo2 < SPO2_LOW) {
            alertMessages.append("Hypoxemia detected (SpO2: ").append(spo2).append("%). ");
            riskLevel = "CRITICAL";
        }

        // Temperature
        if (temperature > TEMP_HIGH) {
            alertMessages.append("Hyperthermia detected (Temp: ").append(temperature).append("°C). ");
            if (!"CRITICAL".equals(riskLevel)) riskLevel = "HIGH";
        }

        // Blood Pressure (parse systolic from "120/80" format)
        if (bloodPressure != null && bloodPressure.contains("/")) {
            try {
                int systolic = Integer.parseInt(bloodPressure.split("/")[0].trim());
                if (systolic > SYSTOLIC_HIGH) {
                    alertMessages.append("Hypertensive crisis (BP: ").append(bloodPressure).append("). ");
                    riskLevel = "CRITICAL";
                } else if (systolic < SYSTOLIC_LOW) {
                    alertMessages.append("Hypotension detected (BP: ").append(bloodPressure).append("). ");
                    if (!"CRITICAL".equals(riskLevel)) riskLevel = "HIGH";
                }
            } catch (NumberFormatException ignored) {}
        }

        // If any alerts triggered, emit via WebSocket
        if (alertMessages.length() > 0) {
            Map<String, Object> alert = new HashMap<>();
            alert.put("patientId", patientId);
            alert.put("doctorId", doctorId);
            alert.put("riskLevel", riskLevel);
            alert.put("message", alertMessages.toString().trim());
            alert.put("timestamp", LocalDateTime.now().toString());

            // Send to doctor-specific topic
            messagingTemplate.convertAndSend("/topic/alerts/" + doctorId, alert);

            // Also send to general alert topic for admin monitoring
            messagingTemplate.convertAndSend("/topic/alerts/global", alert);

            // Audit log
            auditService.logAction(doctorId, patientId, "VITAL_ALERT",
                    riskLevel + ": " + alertMessages.toString().trim());
        }
    }
}
