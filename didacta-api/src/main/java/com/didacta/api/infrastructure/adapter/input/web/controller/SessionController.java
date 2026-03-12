package com.didacta.api.infrastructure.adapter.input.web.controller;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.input.ManageSessionsUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final ManageSessionsUseCase manageSessions;

    @PostMapping
    public OnboardingResult.SessionDto createSession(@Valid @RequestBody OnboardingCommand.CreateSession command) {
        return manageSessions.create(command);
    }

    @GetMapping
    public List<OnboardingResult.SessionDto> getAllSessions() {
        return manageSessions.listAll();
    }

    @GetMapping("/{id}")
    public OnboardingResult.SessionDto getSession(@PathVariable UUID id) {
        return manageSessions.findById(id);
    }

    @PatchMapping("/{id}/complete")
    public OnboardingResult.SessionDto completeSession(@PathVariable UUID id) {
        return manageSessions.complete(id);
    }
}
