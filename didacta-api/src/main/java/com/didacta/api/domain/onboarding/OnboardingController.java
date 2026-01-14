package com.didacta.api.domain.onboarding;

import com.didacta.api.domain.onboarding.dto.OnboardingDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;

    @GetMapping("/me")
    public ResponseEntity<OnboardingDto.MeResponse> getMe(@AuthenticationPrincipal Jwt jwt) {
        String sub = jwt.getClaimAsString("sub");
        return ResponseEntity.ok(onboardingService.getMe(sub));
    }

    @PostMapping("/onboarding/institution")
    public ResponseEntity<OnboardingDto.InstitutionCreatedResponse> createInstitution(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody OnboardingDto.CreateInstitutionRequest request) {
        String sub = jwt.getClaimAsString("sub");
        return ResponseEntity.ok(onboardingService.createInstitution(sub, request));
    }

    @PostMapping("/onboarding/group")
    public ResponseEntity<OnboardingDto.GroupCreatedResponse> createGroup(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody OnboardingDto.CreateGroupRequest request) {
        String sub = jwt.getClaimAsString("sub");
        return ResponseEntity.ok(onboardingService.createGroup(sub, request));
    }

    @PostMapping("/onboarding/collaborators")
    public OnboardingDto.CollaboratorsCreatedResponse createCollaborators(@AuthenticationPrincipal Jwt jwt,
                                                                 @RequestBody OnboardingDto.CreateCollaboratorsRequest request) {
        return onboardingService.createCollaborators(jwt.getSubject(), request);
    }

    @GetMapping("/onboarding/campuses")
    public java.util.List<com.didacta.api.domain.campus.Campus> getCampuses() {
        return onboardingService.getCampuses();
    }

    @GetMapping("/onboarding/groups")
    public java.util.List<com.didacta.api.domain.group.GroupEntity> getGroups() {
        return onboardingService.getGroups();
    }

    @GetMapping("/onboarding/institution-details")
    public OnboardingDto.CreateInstitutionRequest getInstitutionDetails(@AuthenticationPrincipal Jwt jwt) {
        return onboardingService.getInstitutionDetails(jwt.getSubject());
    }
}
