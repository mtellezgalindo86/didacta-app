package com.didacta.api.application.mapper;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.domain.model.AppUser;
import com.didacta.api.domain.model.Institution;
import com.didacta.api.domain.model.InstitutionUser;

public class OnboardingMapper {

    private OnboardingMapper() {}

    public static OnboardingResult.UserDto toUserDto(AppUser user) {
        return OnboardingResult.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    public static OnboardingResult.TenantDto toTenantDto(Institution institution, String role) {
        return OnboardingResult.TenantDto.builder()
                .institutionId(institution.getId())
                .name(institution.getName())
                .role(role)
                .build();
    }

    public static OnboardingCommand.CreateInstitution toInstitutionDetails(Institution institution, InstitutionUser membership, String campusName, boolean hasMultipleCampuses) {
        OnboardingCommand.CreateInstitution req = new OnboardingCommand.CreateInstitution();
        req.setName(institution.getName());
        req.setMainLevel(institution.getMainLevel());
        req.setCountry(institution.getCountry());
        req.setTimezone(institution.getTimezone());
        req.setRole(membership.getRole());
        req.setHasMultipleCampuses(hasMultipleCampuses);
        req.setCampusName(campusName);
        return req;
    }
}
