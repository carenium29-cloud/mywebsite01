package com.carenium.dto;

import lombok.AllData;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String email;
    private List<String> roles;

    public JwtResponse(String accessToken, String id, String email, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.roles = roles;
    }
}
