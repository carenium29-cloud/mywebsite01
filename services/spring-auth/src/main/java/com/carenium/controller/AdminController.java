package com.carenium.controller;

import com.carenium.model.User;
import com.carenium.repository.UserRepository;
import com.carenium.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.carenium.repository.RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody java.util.Map<String, Object> payload, Principal principal) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String oldData = String.format("Email: %s, Name: %s, Role: %s, Status: %s", 
            user.getEmail(), user.getFullName(), user.getRoles(), user.getStatus());
        
        if (payload.containsKey("email")) user.setEmail((String) payload.get("email"));
        if (payload.containsKey("fullName")) user.setFullName((String) payload.get("fullName"));
        if (payload.containsKey("department")) user.setDepartment((String) payload.get("department"));
        if (payload.containsKey("phone")) user.setPhone((String) payload.get("phone"));
        if (payload.containsKey("status")) user.setStatus((String) payload.get("status"));
        
        if (payload.containsKey("role")) {
            String roleName = (String) payload.get("role");
            com.carenium.model.Role role = roleRepository.findByName(com.carenium.model.ERole.valueOf(roleName))
                .orElseThrow(() -> new RuntimeException("Role not found"));
            java.util.Set<com.carenium.model.Role> roles = new java.util.HashSet<>();
            roles.add(role);
            user.setRoles(roles);
        }
        
        userRepository.save(user);
        
        String newData = String.format("Email: %s, Name: %s, Role: %s, Status: %s", 
            user.getEmail(), user.getFullName(), user.getRoles(), user.getStatus());
        
        auditService.logAction(principal.getName(), id, "ADMIN_USER_UPDATE", 
                String.format("Changed from [%s] to [%s]", oldData, newData));
        
        return ResponseEntity.ok("User updated successfully");
    }

    @PutMapping("/users/reset-password/{id}")
    public ResponseEntity<?> resetPassword(@PathVariable String id, @RequestBody String newPassword, Principal principal) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        auditService.logAction(principal.getName(), id, "ADMIN_PASSWORD_RESET", "Forced password reset by admin");
        
        return ResponseEntity.ok("Password reset successfully");
    }
}
