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
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
            // Add UserSyncFilter AFTER BearerToken (so Auth is present)
            .addFilterAfter(userSyncFilter, BearerTokenAuthenticationFilter.class)
            // Add TenantInterceptor AFTER UserSyncFilter (so User is in DB)
            .addFilterAfter(tenantInterceptor, UserSyncFilter.class);
            
        return http.build();
    }
}
