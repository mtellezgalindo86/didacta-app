package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.OnboardingResult;

public interface GetOnboardingStatusUseCase {
    OnboardingResult.MeResponse execute(String keycloakUserId);
}
