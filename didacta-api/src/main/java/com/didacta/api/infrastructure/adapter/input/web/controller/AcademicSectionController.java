package com.didacta.api.infrastructure.adapter.input.web.controller;

import com.didacta.api.application.dto.AcademicSectionDto;
import com.didacta.api.application.port.input.ManageAcademicSectionsUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
public class AcademicSectionController {

    private final ManageAcademicSectionsUseCase manageSections;

    @GetMapping
    public ResponseEntity<List<AcademicSectionDto.Response>> listSections() {
        return ResponseEntity.ok(manageSections.listByInstitution());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicSectionDto.Response> getSection(@PathVariable UUID id) {
        return ResponseEntity.ok(manageSections.getById(id));
    }
}
