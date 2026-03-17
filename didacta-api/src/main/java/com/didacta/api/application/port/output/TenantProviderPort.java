package com.didacta.api.application.port.output;

import java.util.UUID;

public interface TenantProviderPort {
    String getTenantId();
    UUID getTenantUUID();
    void setTenantId(String tenantId);
}
