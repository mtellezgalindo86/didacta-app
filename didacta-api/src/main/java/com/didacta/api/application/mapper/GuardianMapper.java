package com.didacta.api.application.mapper;

import com.didacta.api.application.dto.GuardianResult;
import com.didacta.api.domain.model.Guardian;
import com.didacta.api.domain.model.StudentGuardian;

import java.util.List;

public class GuardianMapper {

    private GuardianMapper() {}

    public static GuardianResult.GuardianResponse toGuardianResponse(
            Guardian guardian, List<GuardianResult.StudentLinkResponse> studentLinks) {
        return GuardianResult.GuardianResponse.builder()
                .id(guardian.getId())
                .firstName(guardian.getFirstName())
                .lastName(guardian.getLastName())
                .phone(guardian.getPhone())
                .email(guardian.getEmail())
                .status(guardian.getStatus())
                .students(studentLinks)
                .createdAt(guardian.getCreatedAt())
                .build();
    }

    public static GuardianResult.GuardianListItem toGuardianListItem(
            Guardian guardian, int studentCount, List<String> studentNames) {
        return GuardianResult.GuardianListItem.builder()
                .id(guardian.getId())
                .firstName(guardian.getFirstName())
                .lastName(guardian.getLastName())
                .phone(guardian.getPhone())
                .email(guardian.getEmail())
                .status(guardian.getStatus())
                .studentCount(studentCount)
                .studentNames(studentNames)
                .build();
    }

    public static GuardianResult.StudentLinkResponse toStudentLinkResponse(
            StudentGuardian link, String studentFirstName, String studentLastName, String groupName) {
        return GuardianResult.StudentLinkResponse.builder()
                .linkId(link.getId())
                .studentId(link.getStudentId())
                .studentFirstName(studentFirstName)
                .studentLastName(studentLastName)
                .groupName(groupName)
                .relationship(link.getRelationship())
                .isPrimary(link.getIsPrimary())
                .canPickUp(link.getCanPickUp())
                .receivesNotifications(link.getReceivesNotifications())
                .notes(link.getNotes())
                .build();
    }

    public static GuardianResult.GuardianOfStudentResponse toGuardianOfStudentResponse(
            Guardian guardian, StudentGuardian link) {
        return GuardianResult.GuardianOfStudentResponse.builder()
                .guardianId(guardian.getId())
                .firstName(guardian.getFirstName())
                .lastName(guardian.getLastName())
                .phone(guardian.getPhone())
                .email(guardian.getEmail())
                .linkId(link.getId())
                .relationship(link.getRelationship())
                .isPrimary(link.getIsPrimary())
                .canPickUp(link.getCanPickUp())
                .receivesNotifications(link.getReceivesNotifications())
                .notes(link.getNotes())
                .build();
    }
}
