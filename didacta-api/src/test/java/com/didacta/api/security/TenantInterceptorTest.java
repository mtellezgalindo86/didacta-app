package com.didacta.api.security;

import com.didacta.api.application.port.output.MembershipRepositoryPort;
import com.didacta.api.application.port.output.UserRepositoryPort;
import com.didacta.api.domain.model.AppUser;
import com.didacta.api.domain.model.InstitutionUser;
import com.didacta.api.infrastructure.security.TenantContext;
import com.didacta.api.infrastructure.security.TenantInterceptor;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantInterceptorTest {

    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;
    @Mock private Jwt jwt;
    @Mock private MembershipRepositoryPort membershipRepository;
    @Mock private UserRepositoryPort userRepository;

    @InjectMocks
    private TenantInterceptor interceptor;

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilter_givenNoInstitutionHeader_shouldContinueWithoutTenant() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        interceptor.doFilter(request, response, filterChain);

        assertEquals(200, response.getStatus());
        assertNull(TenantContext.getTenantId());
    }

    @Test
    void doFilter_givenValidHeaderAndMember_shouldAllowRequest() throws ServletException, IOException {
        UUID institutionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String sub = "kc-user-123";

        AppUser user = new AppUser();
        user.setId(userId);
        user.setKeycloakUserId(sub);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Institution-Id", institutionId.toString());
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(jwt);
        when(jwt.getClaimAsString("sub")).thenReturn(sub);
        when(userRepository.findByKeycloakUserId(sub)).thenReturn(Optional.of(user));
        when(membershipRepository.findByInstitutionIdAndUserId(institutionId, userId))
                .thenReturn(Optional.of(new InstitutionUser()));

        interceptor.doFilter(request, response, filterChain);

        assertEquals(200, response.getStatus());
        assertNull(TenantContext.getTenantId());
    }

    @Test
    void doFilter_givenInvalidUuidHeader_shouldReturn400() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Institution-Id", "not-a-uuid");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        SecurityContextHolder.setContext(securityContext);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getPrincipal()).thenReturn(jwt);

        interceptor.doFilter(request, response, filterChain);

        assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
    }

    @Test
    void doFilter_givenUserNotMember_shouldReturn403() throws ServletException, IOException {
        UUID institutionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String sub = "kc-user-123";

        AppUser user = new AppUser();
        user.setId(userId);
        user.setKeycloakUserId(sub);
        user.setEmail("test@test.com");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Institution-Id", institutionId.toString());
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(jwt);
        when(jwt.getClaimAsString("sub")).thenReturn(sub);
        when(userRepository.findByKeycloakUserId(sub)).thenReturn(Optional.of(user));
        when(membershipRepository.findByInstitutionIdAndUserId(institutionId, userId))
                .thenReturn(Optional.empty());

        interceptor.doFilter(request, response, filterChain);

        assertEquals(HttpServletResponse.SC_FORBIDDEN, response.getStatus());
    }
}
