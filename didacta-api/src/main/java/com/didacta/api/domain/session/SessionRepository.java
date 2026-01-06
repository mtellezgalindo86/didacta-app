package com.didacta.api.domain.session;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {
    // Multi-tenancy is handled automatically by Hibernate @TenantIdFilter or manual filtering?
    // User requested "queries must filter by tenantId". 
    // Hibernate 6 @TenantId usually handles this automatically if configured.
    // However, for MVP and "Todas las queries deben filtrar por tenantId" explicit rule,
    // if we use Hibernate 6.x standard Multi-tenancy (PARTITIONED), it's automatic.
    // We annotated BaseTenantEntity with @TenantId, so Hibernate 6 handles it.
}
