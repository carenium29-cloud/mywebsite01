package com.carenium.service;

import com.carenium.model.AuditLog;
import com.carenium.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(String userId, String targetId, String actionType, String changeSummary) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setTargetId(targetId);
        log.setActionType(actionType);
        log.setChangeSummary(changeSummary);
        auditLogRepository.save(log);
    }
}
