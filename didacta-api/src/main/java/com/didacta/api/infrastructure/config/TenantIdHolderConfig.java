package com.didacta.api.infrastructure.config;

import com.didacta.api.domain.common.TenantIdHolder;
import com.didacta.api.infrastructure.security.TenantContext;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TenantIdHolderConfig {

    @PostConstruct
    public void init() {
        TenantIdHolder.setTenantIdSupplier(TenantContext::getTenantId);
    }
}
