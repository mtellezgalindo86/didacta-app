package com.didacta.api.domain.catalog;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalogs")
public class CatalogController {

    @GetMapping("/levels")
    public List<Map<String, String>> getLevels() {
        return Arrays.asList(
                Map.of("id", "MATERNAL", "label", "Maternal"),
                Map.of("id", "PREESCOLAR", "label", "Preescolar"),
                Map.of("id", "PRIMARIA", "label", "Primaria"),
                Map.of("id", "SECUNDARIA", "label", "Secundaria"),
                Map.of("id", "MEDIA_SUPERIOR", "label", "Media Superior"),
                Map.of("id", "MIXTO", "label", "Mixto")
        );
    }

    @GetMapping("/shifts")
    public List<Map<String, String>> getShifts() {
        return Arrays.asList(
                Map.of("id", "MATUTINO", "label", "Matutino"),
                Map.of("id", "VESPERTINO", "label", "Vespertino"),
                Map.of("id", "MIXTO", "label", "Mixto")
        );
    }

    @GetMapping("/roles")
    public List<Map<String, String>> getRoles() {
        return Arrays.asList(
                Map.of("id", "OWNER", "label", "Dueño"),
                Map.of("id", "DIRECTOR", "label", "Director"),
                Map.of("id", "COORDINATOR", "label", "Coordinador"),
                Map.of("id", "TEACHER", "label", "Docente")
        );
    }
}
