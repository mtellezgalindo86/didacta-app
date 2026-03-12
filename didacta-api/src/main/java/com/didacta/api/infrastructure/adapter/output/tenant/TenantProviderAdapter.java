package com.didacta.api.infrastructure.adapter.output.tenant;

import com.didacta.api.application.port.output.TenantProviderPort;
import com.didacta.api.domain.exception.DomainException;
import com.didacta.api.infrastructure.security.TenantContext;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TenantProviderAdapter implements TenantProviderPort {

    @Override
    public String getTenantId() {
        return TenantContext.getTenantId();
    }

    @Override
    public UUID getTenantUUID() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new DomainException("No X-Institution-Id header provided");
        }
        return UUID.fromString(tenantId);
    }
}
