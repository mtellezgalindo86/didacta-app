package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.dto.StudentCommand;
import com.didacta.api.application.dto.StudentResult;
import com.didacta.api.application.mapper.StudentMapper;
import com.didacta.api.application.port.input.ManageStudentsUseCase;
import com.didacta.api.application.port.output.GroupRepositoryPort;
import com.didacta.api.application.port.output.StudentGuardianRepositoryPort;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManageStudentsService implements ManageStudentsUseCase {

    private final StudentRepositoryPort studentRepository;
    private final GroupRepositoryPort groupRepository;
    private final StudentGuardianRepositoryPort studentGuardianRepository;
    private final TenantProviderPort tenantProvider;

    // ── Onboarding (existing) ───────────────────────────────────────────

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

    // ── CRUD ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public StudentResult.StudentResponse createStudent(StudentCommand.Create command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        GroupEntity group = groupRepository.findById(command.getGroupId())
                .filter(g -> g.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new EntityNotFoundException("Group", command.getGroupId().toString()));

        Student student = new Student();
        student.setInstitutionId(institutionId);
        student.setGroupId(group.getId());
        student.setFirstName(command.getFirstName().trim());
        student.setLastName(command.getLastName().trim());
        student.setDateOfBirth(command.getDateOfBirth());
        student.setStatus("ACTIVE");
        student.setEnrollmentDate(LocalDate.now());

        Student saved = studentRepository.save(student);
        return StudentMapper.toStudentResponse(saved, group.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResult.StudentResponse getById(UUID id) {
        UUID institutionId = tenantProvider.getTenantUUID();
        Student student = findAndValidateStudent(id, institutionId);
        String groupName = resolveGroupName(student.getGroupId());
        return StudentMapper.toStudentResponse(student, groupName);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResult.StudentListItem> list(String status, String search, UUID groupId) {
        UUID institutionId = tenantProvider.getTenantUUID();
        List<Student> students = studentRepository.findByInstitutionIdAndFilters(institutionId, status, search, groupId);

        if (students.isEmpty()) {
            return new ArrayList<>();
        }

        // Batch: collect all unique groupIds and studentIds
        List<UUID> studentIds = students.stream().map(Student::getId).toList();
        Set<UUID> groupIds = students.stream()
                .map(Student::getGroupId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Batch load group names (one query per distinct group)
        Map<UUID, String> groupNameMap = new HashMap<>();
        for (UUID gId : groupIds) {
            groupRepository.findById(gId).ifPresent(g -> groupNameMap.put(gId, g.getName()));
        }

        // Batch load guardian counts (single query)
        Map<UUID, Long> guardianCountMap = studentGuardianRepository.countByStudentIds(studentIds);

        List<StudentResult.StudentListItem> result = new ArrayList<>();
        for (Student student : students) {
            String groupName = student.getGroupId() != null ? groupNameMap.getOrDefault(student.getGroupId(), "") : "";
            int guardianCount = guardianCountMap.getOrDefault(student.getId(), 0L).intValue();
            result.add(StudentMapper.toStudentListItem(student, groupName, guardianCount));
        }
        return result;
    }

    @Override
    @Transactional
    public StudentResult.StudentResponse update(UUID id, StudentCommand.Update command) {
        UUID institutionId = tenantProvider.getTenantUUID();
        Student student = findAndValidateStudent(id, institutionId);

        student.setFirstName(command.getFirstName().trim());
        student.setLastName(command.getLastName().trim());
        student.setDateOfBirth(command.getDateOfBirth());

        Student saved = studentRepository.save(student);
        return StudentMapper.toStudentResponse(saved, resolveGroupName(saved.getGroupId()));
    }

    @Override
    @Transactional
    public void changeGroup(UUID id, StudentCommand.ChangeGroup command) {
        UUID institutionId = tenantProvider.getTenantUUID();
        Student student = findAndValidateStudent(id, institutionId);

        groupRepository.findById(command.getGroupId())
                .filter(g -> g.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new EntityNotFoundException("Group", command.getGroupId().toString()));

        student.setGroupId(command.getGroupId());
        studentRepository.save(student);
    }

    @Override
    @Transactional
    public void changeStatus(UUID id, StudentCommand.ChangeStatus command) {
        UUID institutionId = tenantProvider.getTenantUUID();
        Student student = findAndValidateStudent(id, institutionId);

        student.setStatus(command.getStatus());
        studentRepository.save(student);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private Student findAndValidateStudent(UUID studentId, UUID institutionId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student", studentId.toString()));
        if (!student.getInstitutionId().equals(institutionId)) {
            throw new EntityNotFoundException("Student", studentId.toString());
        }
        return student;
    }

    private String resolveGroupName(UUID groupId) {
        if (groupId == null) {
            return "";
        }
        return groupRepository.findById(groupId)
                .map(GroupEntity::getName)
                .orElse("");
    }
}
