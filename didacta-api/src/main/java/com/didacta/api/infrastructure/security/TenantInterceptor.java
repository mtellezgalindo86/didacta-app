package com.didacta.api.infrastructure.security;

import com.didacta.api.application.port.output.MembershipRepositoryPort;
import com.didacta.api.application.port.output.UserRepositoryPort;
import com.didacta.api.domain.model.AppUser;
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
    private final MembershipRepositoryPort membershipRepository;
    private final UserRepositoryPort userRepository;

    private static final java.util.Set<String> TENANT_EXEMPT_PATHS = java.util.Set.of(
            "/api/me", "/api/health", "/api/onboarding/institution"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        TenantContext.clear();

        try {
            String requestPath = request.getRequestURI();
            String institutionIdHeader = request.getHeader(HEADER_INSTITUTION_ID);

            // Skip tenant validation for exempt paths (global endpoints)
            if (TENANT_EXEMPT_PATHS.contains(requestPath)) {
                institutionIdHeader = null;
            }

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

                    AppUser user = userRepository.findByKeycloakUserId(sub).orElse(null);

                    if (user == null) {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not synchronized");
                        return;
                    }

                    boolean isMember = membershipRepository.findByInstitutionIdAndUserId(institutionId, user.getId())
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
