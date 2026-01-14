package com.didacta.api.security;

import com.didacta.api.domain.user.AppUser;
import com.didacta.api.domain.user.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserSyncFilter extends OncePerRequestFilter {

    private final AppUserRepository appUserRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String sub = jwt.getClaimAsString("sub");
            String email = jwt.getClaimAsString("email");
            String givenName = jwt.getClaimAsString("given_name");
            String familyName = jwt.getClaimAsString("family_name");

            if (sub != null && email != null) {
                syncUser(sub, email, givenName, familyName);
            }
        }

        filterChain.doFilter(request, response);
    }

    public void syncUser(String keycloakUserId, String email, String firstName, String lastName) {
        Optional<AppUser> optionalUser = appUserRepository.findByKeycloakUserId(keycloakUserId);

        AppUser user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            // Update fields if changed
            boolean changed = false;
            if (!email.equals(user.getEmail())) {
                user.setEmail(email);
                changed = true;
            }
            if (firstName != null && !firstName.equals(user.getFirstName())) {
                user.setFirstName(firstName);
                changed = true;
            }
            if (lastName != null && !lastName.equals(user.getLastName())) {
                user.setLastName(lastName);
                changed = true;
            }
            if (changed) {
                appUserRepository.save(user);
                log.debug("Updated user: {}", email);
            }
        } else {
            // Check if email exists (prevent duplicate email if keycloak ID is different for some reason, though unlikely)
            if (appUserRepository.findByEmail(email).isPresent()) {
                // Determine strategy: Update existing user with new Keycloak ID or throw?
                // For MVP, if email matches, we assume it's the same user and link it.
                user = appUserRepository.findByEmail(email).get();
                user.setKeycloakUserId(keycloakUserId);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                appUserRepository.save(user);
                log.info("Linked existing email to new Keycloak ID: {}", email);
            } else {
                // Create new
                user = new AppUser();
                user.setKeycloakUserId(keycloakUserId);
                user.setEmail(email);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                try {
                    appUserRepository.save(user);
                    log.info("Created new user: {}", email);
                } catch (org.springframework.dao.DataIntegrityViolationException e) {
                    log.warn("Race condition detected: User {} already created by another request. Ignoring.", email);
                }
            }
        }
    }
}
