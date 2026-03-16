package com.didacta.api.infrastructure.adapter.input.web.controller;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.input.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OnboardingController {

    private final GetOnboardingStatusUseCase getOnboardingStatus;
    private final CreateInstitutionUseCase createInstitution;
    private final CreateGroupUseCase createGroup;
    private final ManageStudentsUseCase manageStudents;
    private final ManageAttendanceUseCase manageAttendance;
    private final ManageCollaboratorsUseCase manageCollaborators;
    private final GetInstitutionInfoUseCase getInstitutionInfo;

    @GetMapping("/me")
    public ResponseEntity<OnboardingResult.MeResponse> getMe(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(getOnboardingStatus.execute(jwt.getSubject()));
    }

    @PostMapping("/onboarding/institution")
    public ResponseEntity<OnboardingResult.InstitutionCreated> createInstitution(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody OnboardingCommand.CreateInstitution command) {
        return ResponseEntity.ok(createInstitution.execute(jwt.getSubject(), command));
    }

    @PostMapping("/onboarding/group")
    public ResponseEntity<OnboardingResult.GroupCreated> createGroup(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody OnboardingCommand.CreateGroup command) {
        return ResponseEntity.ok(createGroup.execute(jwt.getSubject(), command));
    }

    @PostMapping("/onboarding/students")
    public ResponseEntity<OnboardingResult.StudentsCreated> createStudents(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody OnboardingCommand.CreateStudents command) {
        return ResponseEntity.ok(manageStudents.create(jwt.getSubject(), command));
    }

    @GetMapping("/onboarding/students")
    public ResponseEntity<List<OnboardingResult.StudentDto>> getStudents() {
        return ResponseEntity.ok(manageStudents.listByInstitution());
    }

    @PostMapping("/onboarding/attendance")
    public ResponseEntity<OnboardingResult.AttendanceCreated> createAttendance(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody OnboardingCommand.CreateAttendance command) {
        return ResponseEntity.ok(manageAttendance.create(jwt.getSubject(), command));
    }

    @GetMapping("/onboarding/institution-level")
    public ResponseEntity<OnboardingResult.InstitutionLevel> getInstitutionLevel(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(getInstitutionInfo.getLevel(jwt.getSubject()));
    }

    @PostMapping("/onboarding/collaborators")
    public OnboardingResult.CollaboratorsCreated createCollaborators(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody OnboardingCommand.CreateCollaborators command) {
        return manageCollaborators.create(jwt.getSubject(), command);
    }

    @GetMapping("/onboarding/campuses")
    public List<OnboardingResult.CampusDto> getCampuses() {
        return getInstitutionInfo.getCampuses();
    }

    @GetMapping("/onboarding/groups")
    public List<OnboardingResult.GroupDto> getGroups() {
        return getInstitutionInfo.getGroups();
    }

    @GetMapping("/onboarding/institution-details")
    public OnboardingCommand.CreateInstitution getInstitutionDetails(@AuthenticationPrincipal Jwt jwt) {
        return getInstitutionInfo.getDetails(jwt.getSubject());
    }

    @GetMapping("/onboarding/sections")
    public List<OnboardingResult.AcademicSectionDto> getSections() {
        return getInstitutionInfo.getSections();
    }
}
