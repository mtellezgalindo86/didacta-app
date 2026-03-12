package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;

import java.util.List;

public interface ManageStudentsUseCase {
    OnboardingResult.StudentsCreated create(String keycloakUserId, OnboardingCommand.CreateStudents command);
    List<OnboardingResult.StudentDto> listByInstitution();
}
