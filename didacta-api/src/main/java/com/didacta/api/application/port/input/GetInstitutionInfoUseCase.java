package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;

import java.util.List;

public interface GetInstitutionInfoUseCase {
    OnboardingResult.InstitutionLevel getLevel(String keycloakUserId);
    OnboardingCommand.CreateInstitution getDetails(String keycloakUserId);
    List<OnboardingResult.CampusDto> getCampuses();
    List<OnboardingResult.GroupDto> getGroups();
    List<OnboardingResult.AcademicSectionDto> getSections();
}
