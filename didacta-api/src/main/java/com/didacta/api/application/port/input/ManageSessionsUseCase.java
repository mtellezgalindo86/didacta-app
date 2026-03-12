package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;

import java.util.List;
import java.util.UUID;

public interface ManageSessionsUseCase {
    OnboardingResult.SessionDto create(OnboardingCommand.CreateSession command);
    List<OnboardingResult.SessionDto> listAll();
    OnboardingResult.SessionDto findById(UUID id);
    OnboardingResult.SessionDto complete(UUID id);
}
