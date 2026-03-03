package com.carenium.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private String targetId;
    
    @Column(nullable = false)
    private String actionType;

    @Column(columnDefinition = "TEXT")
    private String changeSummary;

    private LocalDateTime createdAt = LocalDateTime.now();
}
