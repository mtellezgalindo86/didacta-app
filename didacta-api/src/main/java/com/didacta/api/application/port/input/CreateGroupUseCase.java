package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;

public interface CreateGroupUseCase {
    OnboardingResult.GroupCreated execute(String keycloakUserId, OnboardingCommand.CreateGroup command);
}
