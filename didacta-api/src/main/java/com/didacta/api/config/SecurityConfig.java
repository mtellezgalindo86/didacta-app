package com.didacta.api.config;

import com.didacta.api.domain.institution.InstitutionUserRepository;
import com.didacta.api.domain.user.AppUserRepository;
import com.didacta.api.security.TenantInterceptor;
import com.didacta.api.security.UserSyncFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AppUserRepository appUserRepository;
    private final InstitutionUserRepository institutionUserRepository;
    private final UserSyncFilter userSyncFilter;
    private final TenantInterceptor tenantInterceptor;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/health", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder())))
            // Add TenantInterceptor first (will be pushed down by UserSyncFilter)
            .addFilterAfter(tenantInterceptor, BearerTokenAuthenticationFilter.class)
            // Add UserSyncFilter immediately after BearerToken, claiming the spot before TenantInterceptor
            .addFilterAfter(userSyncFilter, BearerTokenAuthenticationFilter.class);
            
        return http.build();
    }
    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri("http://keycloak:8080/realms/didacta/protocol/openid-connect/certs").build();
        // Disable issuer validation because internal (keycloak:8080) vs external (localhost:8081) mismatch
        jwtDecoder.setJwtValidator(token -> OAuth2TokenValidatorResult.success());
        return jwtDecoder;
    }
}
