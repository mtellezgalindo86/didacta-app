package com.didacta.api.infrastructure.adapter.input.web.controller;

import com.didacta.api.application.dto.GuardianCommand;
import com.didacta.api.application.dto.GuardianResult;
import com.didacta.api.application.port.input.ManageGuardiansUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/guardians")
@RequiredArgsConstructor
public class GuardianController {

    private final ManageGuardiansUseCase manageGuardians;

    @PostMapping
    public ResponseEntity<GuardianResult.GuardianCreated> create(
            @Valid @RequestBody GuardianCommand.Create command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(manageGuardians.createAndLink(command));
    }

    @GetMapping
    public ResponseEntity<List<GuardianResult.GuardianListItem>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(manageGuardians.list(status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuardianResult.GuardianResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(manageGuardians.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GuardianResult.GuardianResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody GuardianCommand.Update command) {
        return ResponseEntity.ok(manageGuardians.update(id, command));
    }

    @PatchMapping("/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changeStatus(@PathVariable UUID id,
                              @Valid @RequestBody GuardianCommand.ChangeStatus command) {
        manageGuardians.changeStatus(id, command);
    }

    @PostMapping("/{id}/students")
    public ResponseEntity<GuardianResult.StudentLinkResponse> linkStudent(
            @PathVariable UUID id,
            @Valid @RequestBody GuardianCommand.LinkStudent command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(manageGuardians.linkExistingToStudent(id, command));
    }

    @PutMapping("/{id}/students/{linkId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateLink(@PathVariable UUID id,
                            @PathVariable UUID linkId,
                            @Valid @RequestBody GuardianCommand.UpdateLink command) {
        manageGuardians.updateLink(id, linkId, command);
    }

    @DeleteMapping("/{id}/students/{linkId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlinkFromStudent(@PathVariable UUID id, @PathVariable UUID linkId) {
        manageGuardians.unlinkFromStudent(id, linkId);
    }

    @GetMapping("/by-student/{studentId}")
    public ResponseEntity<List<GuardianResult.GuardianOfStudentResponse>> getGuardiansOfStudent(
            @PathVariable UUID studentId) {
        return ResponseEntity.ok(manageGuardians.getGuardiansOfStudent(studentId));
    }
}
