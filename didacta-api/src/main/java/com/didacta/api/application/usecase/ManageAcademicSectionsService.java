package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.AcademicSectionDto;
import com.didacta.api.application.port.input.ManageAcademicSectionsUseCase;
import com.didacta.api.application.port.output.AcademicSectionRepositoryPort;
import com.didacta.api.application.port.output.TenantProviderPort;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.AcademicSection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ManageAcademicSectionsService implements ManageAcademicSectionsUseCase {

    private final AcademicSectionRepositoryPort sectionRepository;
    private final TenantProviderPort tenantProvider;

    @Override
    @Transactional(readOnly = true)
    public List<AcademicSectionDto.Response> listByInstitution() {
        UUID institutionId = tenantProvider.getTenantUUID();
        return sectionRepository.findByInstitutionId(institutionId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicSectionDto.Response getById(UUID id) {
        AcademicSection section = sectionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("AcademicSection", id.toString()));
        // Validate tenant ownership
        UUID institutionId = tenantProvider.getTenantUUID();
        if (!section.getInstitution().getId().equals(institutionId)) {
            throw new EntityNotFoundException("AcademicSection", id.toString());
        }
        return toResponse(section);
    }

    private AcademicSectionDto.Response toResponse(AcademicSection section) {
        return AcademicSectionDto.Response.builder()
                .id(section.getId())
                .level(section.getLevel())
                .accreditationType(section.getAccreditationType())
                .accreditationKey(section.getAccreditationKey())
                .name(section.getName())
                .displayOrder(section.getDisplayOrder())
                .active(section.getActive())
                .build();
    }
}
