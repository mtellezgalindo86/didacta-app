package com.didacta.api.security;

import com.didacta.api.domain.institution.InstitutionUserRepository;
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
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class TenantInterceptor extends OncePerRequestFilter {

    private static final String HEADER_INSTITUTION_ID = "X-Institution-Id";
    private final InstitutionUserRepository institutionUserRepository;
    private final AppUserRepository appUserRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            
        TenantContext.clear();

        try {
            String institutionIdHeader = request.getHeader(HEADER_INSTITUTION_ID);

            // If no header, allow request (Global scope, e.g. /api/me)
            if (institutionIdHeader != null && !institutionIdHeader.isBlank()) {
                
                UUID institutionId;
                try {
                    institutionId = UUID.fromString(institutionIdHeader);
                } catch (IllegalArgumentException e) {
                    response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid X-Institution-Id format");
                    return;
                }

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                    String sub = jwt.getClaimAsString("sub");
                    
                    AppUser user = appUserRepository.findByKeycloakUserId(sub).orElse(null);
                    
                    if (user == null) {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not synchronized");
                        return;
                    }

                    boolean isMember = institutionUserRepository.findByInstitutionIdAndUserId(institutionId, user.getId())
                            .isPresent();

                    if (!isMember) {
                        log.warn("User {} attempted to access institution {} without membership", user.getEmail(), institutionId);
                        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access to this institution is denied");
                        return;
                    }

                    // Set Tenant Context
                    TenantContext.setTenantId(institutionId.toString());
                } else {
                    // Header present but not authenticated
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required for tenant access");
                    return;
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
