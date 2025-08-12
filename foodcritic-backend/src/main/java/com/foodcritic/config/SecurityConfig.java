package com.foodcritic.config;

import com.foodcritic.security.JwtAuthenticationEntryPoint;
import com.foodcritic.security.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    @Lazy
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/admin/seed/**").permitAll()
                
                // Public GET endpoints - allow everyone to view restaurants and reviews
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/reviews/**").permitAll()
                
                // Google Places API endpoints - public access for searching
                .requestMatchers("/api/google-places/**").permitAll()
                
                // Protected POST/PUT/DELETE endpoints for reviews - require authentication
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/restaurants/*/reviews").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/restaurants/*/reviews/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/restaurants/*/reviews/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/reviews").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/reviews/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/reviews/**").authenticated()
                
                // User management
                .requestMatchers("/api/users/**").authenticated()
                
                // File upload endpoints - require authentication
                .requestMatchers("/api/upload/**").authenticated()
                
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Default to requiring authentication
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}