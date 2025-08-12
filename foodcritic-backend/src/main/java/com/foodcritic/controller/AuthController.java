package com.foodcritic.controller;

import com.foodcritic.dto.AuthRequest;
import com.foodcritic.dto.AuthResponse;
import com.foodcritic.dto.RegisterRequest;
import com.foodcritic.model.User;
import com.foodcritic.security.JwtTokenUtil;
import com.foodcritic.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest authRequest) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.getUsername(), 
                    authRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid credentials", e);
        }

        final UserDetails userDetails = userService.loadUserByUsername(authRequest.getUsername());
        final String token = jwtTokenUtil.generateToken(userDetails);
        
        User user = userService.findByUsername(authRequest.getUsername()).get();

        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getEmail(), user.getId()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Default to USER role if not specified
            User.Role role = (registerRequest.getRole() != null) ? 
                User.Role.valueOf(registerRequest.getRole().toUpperCase()) : 
                User.Role.USER;
                
            User user = userService.createUser(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                registerRequest.getPassword(),
                role
            );

            final UserDetails userDetails = userService.loadUserByUsername(user.getUsername());
            final String token = jwtTokenUtil.generateToken(userDetails);

            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getEmail(), user.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role specified");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}