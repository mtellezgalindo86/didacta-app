package com.didacta.api.infrastructure.adapter.input.web.controller;

import com.didacta.api.application.dto.StudentCommand;
import com.didacta.api.application.dto.StudentResult;
import com.didacta.api.application.port.input.ManageStudentsUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final ManageStudentsUseCase manageStudents;

    @PostMapping
    public ResponseEntity<StudentResult.StudentResponse> create(
            @Valid @RequestBody StudentCommand.Create command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(manageStudents.createStudent(command));
    }

    @GetMapping
    public ResponseEntity<List<StudentResult.StudentListItem>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID groupId) {
        return ResponseEntity.ok(manageStudents.list(status, search, groupId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResult.StudentResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(manageStudents.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResult.StudentResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody StudentCommand.Update command) {
        return ResponseEntity.ok(manageStudents.update(id, command));
    }

    @PatchMapping("/{id}/group")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changeGroup(@PathVariable UUID id,
                             @Valid @RequestBody StudentCommand.ChangeGroup command) {
        manageStudents.changeGroup(id, command);
    }

    @PatchMapping("/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changeStatus(@PathVariable UUID id,
                              @Valid @RequestBody StudentCommand.ChangeStatus command) {
        manageStudents.changeStatus(id, command);
    }
}
