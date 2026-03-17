package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.OnboardingCommand;

public interface SetupInstitutionUseCase {
    void setupSectionsAndCalendars(OnboardingCommand.CreateInstitution command);
}
