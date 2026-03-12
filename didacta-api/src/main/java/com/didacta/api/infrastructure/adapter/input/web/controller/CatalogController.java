package com.didacta.api.infrastructure.adapter.input.web.controller;

import com.didacta.api.application.port.input.GetCatalogDataUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalogs")
@RequiredArgsConstructor
public class CatalogController {

    private final GetCatalogDataUseCase getCatalogData;

    @GetMapping("/levels")
    public List<Map<String, String>> getLevels() {
        return getCatalogData.getLevels();
    }

    @GetMapping("/shifts")
    public List<Map<String, String>> getShifts() {
        return getCatalogData.getShifts();
    }

    @GetMapping("/roles")
    public List<Map<String, String>> getRoles() {
        return getCatalogData.getRoles();
    }

    @GetMapping("/grades")
    public List<Map<String, String>> getGrades(@RequestParam String level) {
        return getCatalogData.getGrades(level);
    }

    @GetMapping("/terminology")
    public Map<String, String> getTerminology(@RequestParam String level) {
        return getCatalogData.getTerminology(level);
    }
}
