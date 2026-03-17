package com.didacta.api.infrastructure.adapter.input.web.controller;

import com.didacta.api.application.dto.StaffCommand;
import com.didacta.api.application.dto.StaffResult;
import com.didacta.api.application.port.input.ManageStaffUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff-members")
@RequiredArgsConstructor
public class StaffController {

    private final ManageStaffUseCase manageStaff;

    @GetMapping
    public ResponseEntity<StaffResult.StaffListResponse> list(
            @RequestParam(required = false) UUID campusId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(manageStaff.list(campusId, category, status, search));
    }

    @PostMapping
    public ResponseEntity<StaffResult.StaffMemberCreated> create(
            @Valid @RequestBody StaffCommand.Create command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(manageStaff.create(command));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffResult.StaffMemberResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(manageStaff.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffResult.StaffMemberResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody StaffCommand.Update command) {
        return ResponseEntity.ok(manageStaff.update(id, command));
    }

    @PatchMapping("/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changeStatus(@PathVariable UUID id,
                              @Valid @RequestBody StaffCommand.ChangeStatus command) {
        manageStaff.changeStatus(id, command);
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<StaffResult.AssignmentResponse>> getAssignments(@PathVariable UUID id) {
        return ResponseEntity.ok(manageStaff.getAssignments(id));
    }

    @PostMapping("/{id}/assignments")
    public ResponseEntity<StaffResult.AssignmentResponse> assignToGroup(
            @PathVariable UUID id,
            @Valid @RequestBody StaffCommand.AssignGroup command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(manageStaff.assignToGroup(id, command));
    }

    @DeleteMapping("/{id}/assignments/{assignmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeAssignment(@PathVariable UUID id, @PathVariable UUID assignmentId) {
        manageStaff.removeAssignment(id, assignmentId);
    }

    @PostMapping("/{id}/resend-invitation")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resendInvitation(@PathVariable UUID id) {
        manageStaff.resendInvitation(id);
    }
}
