package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;

public interface ManageAttendanceUseCase {
    OnboardingResult.AttendanceCreated create(String keycloakUserId, OnboardingCommand.CreateAttendance command);
}
