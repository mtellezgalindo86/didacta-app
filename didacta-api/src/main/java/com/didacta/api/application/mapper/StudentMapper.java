package com.didacta.api.application.mapper;

import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.dto.StudentResult;
import com.didacta.api.domain.model.Student;

public class StudentMapper {

    private StudentMapper() {}

    public static OnboardingResult.StudentDto toDto(Student student) {
        return OnboardingResult.StudentDto.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .status(student.getStatus())
                .groupId(student.getGroupId())
                .build();
    }

    public static OnboardingResult.StudentDto toDto(Student student, String groupName) {
        return OnboardingResult.StudentDto.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .status(student.getStatus())
                .groupId(student.getGroupId())
                .groupName(groupName)
                .build();
    }

    public static StudentResult.StudentResponse toStudentResponse(Student student, String groupName) {
        return StudentResult.StudentResponse.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .dateOfBirth(student.getDateOfBirth())
                .status(student.getStatus())
                .groupId(student.getGroupId())
                .groupName(groupName)
                .enrollmentDate(student.getEnrollmentDate())
                .createdAt(student.getCreatedAt() != null ? student.getCreatedAt().toString() : null)
                .build();
    }

    public static StudentResult.StudentListItem toStudentListItem(Student student, String groupName, int guardianCount) {
        return StudentResult.StudentListItem.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .status(student.getStatus())
                .groupId(student.getGroupId())
                .groupName(groupName)
                .guardianCount(guardianCount)
                .build();
    }
}
