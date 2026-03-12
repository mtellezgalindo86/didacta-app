package com.didacta.api.application.mapper;

import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.domain.model.Student;

public class StudentMapper {

    private StudentMapper() {}

    public static OnboardingResult.StudentDto toDto(Student student) {
        return OnboardingResult.StudentDto.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .status(student.getStatus())
                .build();
    }
}
