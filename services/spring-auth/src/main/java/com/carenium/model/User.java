package com.carenium.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String fullName;
    private String department;
    private String phone;
    private String status = "ACTIVE";

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", 
               joinColumns = @JoinColumn(name = "user_id"), 
               inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();
}
