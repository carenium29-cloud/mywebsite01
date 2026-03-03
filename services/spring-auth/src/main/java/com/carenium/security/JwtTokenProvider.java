package com.carenium.security;

import com.carenium.model.DoctorProfile;
import com.carenium.repository.DoctorProfileRepository;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    @Value("${carenium.jwtSecret}")
    private String jwtSecret;

    @Value("${carenium.jwtExpirationMs}")
    private int jwtExpirationMs;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String username = userDetails.getUsername();
        String userId = userDetails.getId();

        Claims claims = Jwts.claims().setSubject(username);
        claims.put("userId", userId);
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        // Add specialization claims for doctors
        boolean isDoctor = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));

        if (isDoctor) {
            Optional<DoctorProfile> profile = doctorProfileRepository.findByUserId(userId);
            if (profile.isPresent()) {
                claims.put("onboarded", true);
                claims.put("specialization", profile.get().getSpecialization());
                claims.put("department", profile.get().getDepartment());
            } else {
                claims.put("onboarded", false);
            }
        }

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (Exception e) {
            // Log error
        }
        return false;
    }
}
