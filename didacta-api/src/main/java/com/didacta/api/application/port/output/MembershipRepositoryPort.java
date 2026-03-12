package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.AppUser;
import com.didacta.api.domain.model.InstitutionUser;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MembershipRepositoryPort {
    List<InstitutionUser> findByUser(AppUser user);
    Optional<InstitutionUser> findByInstitutionIdAndUserId(UUID institutionId, UUID userId);
    InstitutionUser save(InstitutionUser membership);
}
