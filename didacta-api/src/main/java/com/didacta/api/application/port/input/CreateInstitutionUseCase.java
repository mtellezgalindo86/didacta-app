package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;

public interface CreateInstitutionUseCase {
    OnboardingResult.InstitutionCreated execute(String keycloakUserId, OnboardingCommand.CreateInstitution command);
}
