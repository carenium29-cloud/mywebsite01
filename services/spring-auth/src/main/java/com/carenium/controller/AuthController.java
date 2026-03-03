package com.carenium.controller;

import com.carenium.dto.JwtResponse;
import com.carenium.dto.LoginRequest;
import com.carenium.dto.SignupRequest;
import com.carenium.model.ERole;
import com.carenium.model.Role;
import com.carenium.model.User;
import com.carenium.repository.RoleRepository;
import com.carenium.repository.UserRepository;
import com.carenium.security.JwtTokenProvider;
import com.carenium.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtTokenProvider jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();		
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt, 
                                                 userDetails.getId(), 
                                                 userDetails.getUsername(), 
                                                 roles));
    }

    @PostMapping("/admin-login")
    public ResponseEntity<?> authenticateAdmin(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();		
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(item -> item.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            return ResponseEntity.status(403).body("Error: Unauthorized admin access. This portal is for authorized administrators only.");
        }

        String jwt = jwtUtils.generateJwtToken(authentication);
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt, 
                                                 userDetails.getId(), 
                                                 userDetails.getUsername(), 
                                                 roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setFullName(signUpRequest.getFullName());
        user.setPhone(signUpRequest.getPhone());
        user.setDepartment(signUpRequest.getDepartment());

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_DOCTOR)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                case "admin":
                    Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(adminRole);
                    break;
                case "nurse":
                    Role nurseRole = roleRepository.findByName(ERole.ROLE_NURSE)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(nurseRole);
                    break;
                default:
                    Role doctorRole = roleRepository.findByName(ERole.ROLE_DOCTOR)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(doctorRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}
