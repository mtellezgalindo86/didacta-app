package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.mapper.StudentMapper;
import com.didacta.api.application.port.input.ManageStudentsUseCase;
import com.didacta.api.application.port.output.GroupRepositoryPort;
import com.didacta.api.application.port.output.StudentRepositoryPort;
import com.didacta.api.application.port.output.TenantProviderPort;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.GroupEntity;
import com.didacta.api.domain.model.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManageStudentsService implements ManageStudentsUseCase {

    private final StudentRepositoryPort studentRepository;
    private final GroupRepositoryPort groupRepository;
    private final TenantProviderPort tenantProvider;

    @Override
    @Transactional
    public OnboardingResult.StudentsCreated create(String keycloakUserId, OnboardingCommand.CreateStudents command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        GroupEntity group = groupRepository.findById(command.getGroupId())
                .filter(g -> g.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new EntityNotFoundException("Group", command.getGroupId().toString()));

        List<OnboardingResult.StudentDto> created = new ArrayList<>();
        for (OnboardingCommand.StudentEntry entry : command.getStudents()) {
            Student student = new Student();
            student.setInstitutionId(institutionId);
            student.setGroupId(group.getId());
            student.setFirstName(entry.getFirstName().trim());
            student.setLastName(entry.getLastName().trim());
            student.setStatus("ACTIVE");
            student.setEnrollmentDate(LocalDate.now());
            studentRepository.save(student);
            created.add(StudentMapper.toDto(student));
        }

        return OnboardingResult.StudentsCreated.builder()
                .created(created.size())
                .students(created)
                .nextStep("STEP_4")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OnboardingResult.StudentDto> listByInstitution() {
        String tenantId = tenantProvider.getTenantId();
        if (tenantId == null) return List.of();
        UUID institutionId = UUID.fromString(tenantId);

        List<Student> students = studentRepository.findByInstitutionId(institutionId);

        // Build group name lookup to avoid N+1
        Map<UUID, String> groupNames = students.stream()
                .map(Student::getGroupId)
                .distinct()
                .collect(Collectors.toMap(
                        gid -> gid,
                        gid -> groupRepository.findById(gid)
                                .map(GroupEntity::getName)
                                .orElse("")
                ));

        return students.stream()
                .map(s -> StudentMapper.toDto(s, groupNames.get(s.getGroupId())))
                .toList();
    }
}
