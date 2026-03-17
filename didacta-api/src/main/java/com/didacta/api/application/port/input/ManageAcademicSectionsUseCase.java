package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.AcademicSectionDto;

import java.util.List;
import java.util.UUID;

public interface ManageAcademicSectionsUseCase {
    List<AcademicSectionDto.Response> listByInstitution();
    AcademicSectionDto.Response getById(UUID id);
}
