package com.carenium.dto;

import lombok.Data;
import java.util.Set;

@Data
public class SignupRequest {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private String department;
    private Set<String> role;
}
