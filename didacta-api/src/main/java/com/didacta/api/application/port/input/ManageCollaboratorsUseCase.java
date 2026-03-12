package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;

public interface ManageCollaboratorsUseCase {
    OnboardingResult.CollaboratorsCreated create(String keycloakUserId, OnboardingCommand.CreateCollaborators command);
}
