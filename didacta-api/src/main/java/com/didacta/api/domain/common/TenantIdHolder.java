package com.didacta.api.domain.common;

import java.util.function.Supplier;

public final class TenantIdHolder {

    private static Supplier<String> tenantIdSupplier = () -> null;

    private TenantIdHolder() {}

    public static void setTenantIdSupplier(Supplier<String> supplier) {
        tenantIdSupplier = supplier;
    }

    public static String getCurrentTenantId() {
        return tenantIdSupplier.get();
    }
}
