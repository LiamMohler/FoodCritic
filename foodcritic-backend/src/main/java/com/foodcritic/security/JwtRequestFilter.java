package com.foodcritic.security;

import com.foodcritic.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain chain) throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");
        final String requestURI = request.getRequestURI();

        // Skip JWT processing for public endpoints
        if (isPublicEndpoint(requestURI)) {
            chain.doFilter(request, response);
            return;
        }

        String username = null;
        String jwtToken = null;

        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtTokenUtil.getUsernameFromToken(jwtToken);
            } catch (IllegalArgumentException e) {
                logger.error("Unable to get JWT Token");
            } catch (ExpiredJwtException e) {
                logger.error("JWT Token has expired");
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userService.loadUserByUsername(username);

                if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = 
                        new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken
                            .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                }
            } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
                logger.debug("User not found: " + username + " (token is likely stale)");
                // Don't set authentication - let the endpoint handle the 401 response
            } catch (Exception e) {
                logger.error("Error setting authentication: " + e.getMessage());
            }
        }
        chain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String requestURI) {
        // Public endpoints - let Spring Security handle the method-based authorization
        boolean isPublic = requestURI.startsWith("/api/auth/") ||
                         requestURI.startsWith("/uploads/") ||
                         requestURI.equals("/actuator/health");
        
        logger.debug("Request to " + requestURI + " is " + (isPublic ? "public" : "requires authorization check"));
        return isPublic;
    }
}