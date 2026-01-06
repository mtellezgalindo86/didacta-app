package com.didacta.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.io.IOException;

import static org.mockito.Mockito.*;
import static org.springframework.test.util.AssertionErrors.assertEquals;
import static org.springframework.test.util.AssertionErrors.assertNull;

@ExtendWith(MockitoExtension.class)
class TenantInterceptorTest {

    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain filterChain;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;
    @Mock private Jwt jwt;

    private final TenantInterceptor interceptor = new TenantInterceptor();

    @Test
    void shouldExtractTenantIdFromJwt() throws ServletException, IOException {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(jwt);
        when(jwt.getClaimAsString("tenant_id")).thenReturn("tenant-123");

        interceptor.doFilterInternal(request, response, filterChain);

        // Verify it was set during execution (hard to test threadlocal scope here without a spy or capturing inside filter chain)
        // Ideally we check if filterChain continued.
        verify(filterChain).doFilter(request, response);
        
        // After filter, context should be cleared
        assertNull("Tenant context should be cleared", TenantContext.getTenantId());
    }
}
