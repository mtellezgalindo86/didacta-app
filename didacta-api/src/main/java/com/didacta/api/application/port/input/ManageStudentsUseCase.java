package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.dto.StudentCommand;
import com.didacta.api.application.dto.StudentResult;

import java.util.List;
import java.util.UUID;

public interface ManageStudentsUseCase {

    // Onboarding (existing)
    OnboardingResult.StudentsCreated create(String keycloakUserId, OnboardingCommand.CreateStudents command);
    List<OnboardingResult.StudentDto> listByInstitution();

    // CRUD
    StudentResult.StudentResponse createStudent(StudentCommand.Create command);
    StudentResult.StudentResponse getById(UUID id);
    List<StudentResult.StudentListItem> list(String status, String search, UUID groupId);
    StudentResult.StudentResponse update(UUID id, StudentCommand.Update command);
    void changeGroup(UUID id, StudentCommand.ChangeGroup command);
    void changeStatus(UUID id, StudentCommand.ChangeStatus command);
}
