package com.didacta.api.config;

import com.didacta.api.security.TenantInterceptor;
import com.didacta.api.security.UserSyncFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<UserSyncFilter> userSyncFilterRegistration(UserSyncFilter filter) {
        FilterRegistrationBean<UserSyncFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false); // Disable auto-registration as Servlet Filter
        return registration;
    }

    @Bean
    public FilterRegistrationBean<TenantInterceptor> tenantInterceptorRegistration(TenantInterceptor filter) {
        FilterRegistrationBean<TenantInterceptor> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false); // Disable auto-registration as Servlet Filter
        return registration;
    }
}
