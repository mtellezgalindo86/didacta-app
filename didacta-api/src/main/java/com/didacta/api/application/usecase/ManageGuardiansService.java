package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.GuardianCommand;
import com.didacta.api.application.dto.GuardianResult;
import com.didacta.api.application.mapper.GuardianMapper;
import com.didacta.api.application.port.input.ManageGuardiansUseCase;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.exception.DomainException;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.Guardian;
import com.didacta.api.domain.model.Student;
import com.didacta.api.domain.model.StudentGuardian;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ManageGuardiansService implements ManageGuardiansUseCase {

    private final GuardianRepositoryPort guardianRepository;
    private final StudentGuardianRepositoryPort studentGuardianRepository;
    private final StudentRepositoryPort studentRepository;
    private final GroupRepositoryPort groupRepository;
    private final TenantProviderPort tenantProvider;

    private String normalizePhone(String phone) {
        return phone == null ? null : phone.replaceAll("[\\s\\-\\(\\)]", "");
    }

    @Override
    @Transactional
    public GuardianResult.GuardianCreated createAndLink(GuardianCommand.Create command) {
        UUID institutionId = tenantProvider.getTenantUUID();
        String normalizedPhone = normalizePhone(command.getPhone());

        UUID guardianId;
        boolean alreadyExisted;

        var existing = guardianRepository.findByInstitutionIdAndPhone(institutionId, normalizedPhone);
        if (existing.isPresent()) {
            guardianId = existing.get().getId();
            alreadyExisted = true;
        } else {
            Guardian guardian = Guardian.builder()
                    .institutionId(institutionId)
                    .firstName(command.getFirstName())
                    .lastName(command.getLastName())
                    .phone(normalizedPhone)
                    .email(command.getEmail())
                    .status("ACTIVE")
                    .build();
            Guardian saved = guardianRepository.save(guardian);
            guardianId = saved.getId();
            alreadyExisted = false;
        }

        Student student = studentRepository.findById(command.getStudentId())
                .orElseThrow(() -> new EntityNotFoundException("Student", command.getStudentId().toString()));
        if (!student.getInstitutionId().equals(institutionId)) {
            throw new EntityNotFoundException("Student", command.getStudentId().toString());
        }

        if (studentGuardianRepository.existsByStudentIdAndGuardianId(command.getStudentId(), guardianId)) {
            throw new DomainException("Guardian is already linked to this student");
        }

        StudentGuardian link = StudentGuardian.builder()
                .studentId(command.getStudentId())
                .guardianId(guardianId)
                .relationship(command.getRelationship())
                .isPrimary(command.getIsPrimary() != null ? command.getIsPrimary() : false)
                .canPickUp(command.getCanPickUp() != null ? command.getCanPickUp() : true)
                .receivesNotifications(command.getReceivesNotifications() != null ? command.getReceivesNotifications() : true)
                .build();
        studentGuardianRepository.save(link);

        return GuardianResult.GuardianCreated.builder()
                .id(guardianId)
                .alreadyExisted(alreadyExisted)
                .build();
    }

    @Override
    @Transactional
    public GuardianResult.StudentLinkResponse linkExistingToStudent(UUID guardianId, GuardianCommand.LinkStudent command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        Guardian guardian = findAndValidateGuardian(guardianId, institutionId);

        Student student = studentRepository.findById(command.getStudentId())
                .orElseThrow(() -> new EntityNotFoundException("Student", command.getStudentId().toString()));
        if (!student.getInstitutionId().equals(institutionId)) {
            throw new EntityNotFoundException("Student", command.getStudentId().toString());
        }

        if (studentGuardianRepository.existsByStudentIdAndGuardianId(command.getStudentId(), guardianId)) {
            throw new DomainException("Guardian is already linked to this student");
        }

        StudentGuardian link = StudentGuardian.builder()
                .studentId(command.getStudentId())
                .guardianId(guardianId)
                .relationship(command.getRelationship())
                .isPrimary(command.getIsPrimary() != null ? command.getIsPrimary() : false)
                .canPickUp(command.getCanPickUp() != null ? command.getCanPickUp() : true)
                .receivesNotifications(command.getReceivesNotifications() != null ? command.getReceivesNotifications() : true)
                .notes(command.getNotes())
                .build();
        StudentGuardian saved = studentGuardianRepository.save(link);

        String groupName = resolveGroupName(student.getGroupId());

        return GuardianMapper.toStudentLinkResponse(saved, student.getFirstName(), student.getLastName(), groupName);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuardianResult.GuardianOfStudentResponse> getGuardiansOfStudent(UUID studentId) {
        UUID institutionId = tenantProvider.getTenantUUID();

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student", studentId.toString()));
        if (!student.getInstitutionId().equals(institutionId)) {
            throw new EntityNotFoundException("Student", studentId.toString());
        }

        List<StudentGuardian> links = studentGuardianRepository.findByStudentId(studentId);
        List<GuardianResult.GuardianOfStudentResponse> result = new ArrayList<>();

        for (StudentGuardian link : links) {
            Guardian guardian = guardianRepository.findById(link.getGuardianId())
                    .orElse(null);
            if (guardian != null) {
                result.add(GuardianMapper.toGuardianOfStudentResponse(guardian, link));
            }
        }

        return result;
    }

    @Override
    @Transactional
    public void unlinkFromStudent(UUID guardianId, UUID linkId) {
        UUID institutionId = tenantProvider.getTenantUUID();
        findAndValidateGuardian(guardianId, institutionId);

        StudentGuardian link = studentGuardianRepository.findById(linkId)
                .orElseThrow(() -> new EntityNotFoundException("StudentGuardian", linkId.toString()));

        if (!link.getGuardianId().equals(guardianId)) {
            throw new DomainException("Link does not belong to this guardian");
        }

        studentGuardianRepository.deleteById(linkId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuardianResult.GuardianListItem> list(String status, String search) {
        UUID institutionId = tenantProvider.getTenantUUID();

        List<Guardian> guardians = guardianRepository.findByFilters(institutionId, status, search);
        List<GuardianResult.GuardianListItem> result = new ArrayList<>();

        for (Guardian guardian : guardians) {
            List<StudentGuardian> links = studentGuardianRepository.findByGuardianId(guardian.getId());
            int studentCount = links.size();

            List<String> studentNames = new ArrayList<>();
            for (StudentGuardian link : links) {
                studentRepository.findById(link.getStudentId()).ifPresent(s ->
                        studentNames.add(s.getFirstName() + " " + s.getLastName())
                );
            }

            result.add(GuardianMapper.toGuardianListItem(guardian, studentCount, studentNames));
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public GuardianResult.GuardianResponse getById(UUID guardianId) {
        UUID institutionId = tenantProvider.getTenantUUID();

        Guardian guardian = findAndValidateGuardian(guardianId, institutionId);
        List<StudentGuardian> links = studentGuardianRepository.findByGuardianId(guardianId);

        List<GuardianResult.StudentLinkResponse> studentLinks = new ArrayList<>();
        for (StudentGuardian link : links) {
            studentRepository.findById(link.getStudentId()).ifPresent(student -> {
                String groupName = resolveGroupName(student.getGroupId());
                studentLinks.add(GuardianMapper.toStudentLinkResponse(
                        link, student.getFirstName(), student.getLastName(), groupName));
            });
        }

        return GuardianMapper.toGuardianResponse(guardian, studentLinks);
    }

    @Override
    @Transactional
    public GuardianResult.GuardianResponse update(UUID guardianId, GuardianCommand.Update command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        Guardian guardian = findAndValidateGuardian(guardianId, institutionId);

        String normalizedPhone = normalizePhone(command.getPhone());
        if (!normalizedPhone.equals(guardian.getPhone())
                && guardianRepository.existsByInstitutionIdAndPhoneAndIdNot(institutionId, normalizedPhone, guardianId)) {
            throw new DomainException("A guardian with phone " + normalizedPhone + " already exists in this institution");
        }

        guardian.setFirstName(command.getFirstName());
        guardian.setLastName(command.getLastName());
        guardian.setPhone(normalizedPhone);
        guardian.setEmail(command.getEmail());
        guardianRepository.save(guardian);

        return getById(guardianId);
    }

    @Override
    @Transactional
    public void updateLink(UUID guardianId, UUID linkId, GuardianCommand.UpdateLink command) {
        UUID institutionId = tenantProvider.getTenantUUID();
        findAndValidateGuardian(guardianId, institutionId);

        StudentGuardian link = studentGuardianRepository.findById(linkId)
                .orElseThrow(() -> new EntityNotFoundException("StudentGuardian", linkId.toString()));

        if (!link.getGuardianId().equals(guardianId)) {
            throw new DomainException("Link does not belong to this guardian");
        }

        if (command.getRelationship() != null) {
            link.setRelationship(command.getRelationship());
        }
        if (command.getIsPrimary() != null) {
            link.setIsPrimary(command.getIsPrimary());
        }
        if (command.getCanPickUp() != null) {
            link.setCanPickUp(command.getCanPickUp());
        }
        if (command.getReceivesNotifications() != null) {
            link.setReceivesNotifications(command.getReceivesNotifications());
        }
        if (command.getNotes() != null) {
            link.setNotes(command.getNotes());
        }

        studentGuardianRepository.save(link);
    }

    @Override
    @Transactional
    public void changeStatus(UUID guardianId, GuardianCommand.ChangeStatus command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        Guardian guardian = findAndValidateGuardian(guardianId, institutionId);
        guardian.setStatus(command.getStatus());
        guardianRepository.save(guardian);
    }

    private Guardian findAndValidateGuardian(UUID guardianId, UUID institutionId) {
        Guardian guardian = guardianRepository.findById(guardianId)
                .orElseThrow(() -> new EntityNotFoundException("Guardian", guardianId.toString()));

        if (!guardian.getInstitutionId().equals(institutionId)) {
            throw new EntityNotFoundException("Guardian", guardianId.toString());
        }

        return guardian;
    }

    private String resolveGroupName(UUID groupId) {
        if (groupId == null) {
            return "";
        }
        return groupRepository.findById(groupId)
                .map(g -> g.getName())
                .orElse("");
    }
}
