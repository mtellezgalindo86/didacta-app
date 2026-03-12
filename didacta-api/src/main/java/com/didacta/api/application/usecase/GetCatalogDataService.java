package com.didacta.api.application.usecase;

import com.didacta.api.application.port.input.GetCatalogDataUseCase;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class GetCatalogDataService implements GetCatalogDataUseCase {

    @Override
    public List<Map<String, String>> getLevels() {
        return Arrays.asList(
                Map.of("id", "MATERNAL", "label", "Maternal"),
                Map.of("id", "INICIAL", "label", "Inicial"),
                Map.of("id", "PREESCOLAR", "label", "Preescolar"),
                Map.of("id", "PRIMARIA", "label", "Primaria"),
                Map.of("id", "SECUNDARIA", "label", "Secundaria"),
                Map.of("id", "MEDIA_SUPERIOR", "label", "Media Superior"),
                Map.of("id", "MIXTO", "label", "Mixto")
        );
    }

    @Override
    public List<Map<String, String>> getShifts() {
        return Arrays.asList(
                Map.of("id", "MATUTINO", "label", "Matutino"),
                Map.of("id", "VESPERTINO", "label", "Vespertino"),
                Map.of("id", "MIXTO", "label", "Mixto")
        );
    }

    @Override
    public List<Map<String, String>> getRoles() {
        return Arrays.asList(
                Map.of("id", "OWNER", "label", "Dueño"),
                Map.of("id", "DIRECTOR", "label", "Director"),
                Map.of("id", "COORDINATOR", "label", "Coordinador"),
                Map.of("id", "TEACHER", "label", "Docente")
        );
    }

    @Override
    public List<Map<String, String>> getGrades(String level) {
        return switch (level) {
            case "MATERNAL" -> List.of(
                    Map.of("id", "LACTANTES_1", "label", "Lactantes 1"),
                    Map.of("id", "LACTANTES_2", "label", "Lactantes 2"),
                    Map.of("id", "LACTANTES_3", "label", "Lactantes 3"),
                    Map.of("id", "MATERNAL_1", "label", "Maternal 1"),
                    Map.of("id", "MATERNAL_2", "label", "Maternal 2"));
            case "INICIAL" -> List.of(
                    Map.of("id", "INICIAL_1", "label", "Inicial 1"),
                    Map.of("id", "INICIAL_2", "label", "Inicial 2"),
                    Map.of("id", "INICIAL_3", "label", "Inicial 3"));
            case "PREESCOLAR" -> List.of(
                    Map.of("id", "PREESCOLAR_1", "label", "1ro Preescolar"),
                    Map.of("id", "PREESCOLAR_2", "label", "2do Preescolar"),
                    Map.of("id", "PREESCOLAR_3", "label", "3ro Preescolar"));
            case "PRIMARIA" -> List.of(
                    Map.of("id", "PRIMARIA_1", "label", "1ro Primaria"),
                    Map.of("id", "PRIMARIA_2", "label", "2do Primaria"),
                    Map.of("id", "PRIMARIA_3", "label", "3ro Primaria"),
                    Map.of("id", "PRIMARIA_4", "label", "4to Primaria"),
                    Map.of("id", "PRIMARIA_5", "label", "5to Primaria"),
                    Map.of("id", "PRIMARIA_6", "label", "6to Primaria"));
            case "SECUNDARIA" -> List.of(
                    Map.of("id", "SECUNDARIA_1", "label", "1ro Secundaria"),
                    Map.of("id", "SECUNDARIA_2", "label", "2do Secundaria"),
                    Map.of("id", "SECUNDARIA_3", "label", "3ro Secundaria"));
            case "MEDIA_SUPERIOR" -> List.of(
                    Map.of("id", "MEDIA_SUP_1", "label", "1er Semestre"),
                    Map.of("id", "MEDIA_SUP_2", "label", "2do Semestre"),
                    Map.of("id", "MEDIA_SUP_3", "label", "3er Semestre"),
                    Map.of("id", "MEDIA_SUP_4", "label", "4to Semestre"),
                    Map.of("id", "MEDIA_SUP_5", "label", "5to Semestre"),
                    Map.of("id", "MEDIA_SUP_6", "label", "6to Semestre"));
            case "MIXTO" -> {
                List<Map<String, String>> all = new ArrayList<>();
                all.addAll(getGrades("MATERNAL"));
                all.addAll(getGrades("INICIAL"));
                all.addAll(getGrades("PREESCOLAR"));
                all.addAll(getGrades("PRIMARIA"));
                all.addAll(getGrades("SECUNDARIA"));
                all.addAll(getGrades("MEDIA_SUPERIOR"));
                yield all;
            }
            default -> List.of();
        };
    }

    @Override
    public Map<String, String> getTerminology(String level) {
        boolean isCare = "MATERNAL".equals(level) || "INICIAL".equals(level);
        return Map.of(
                "sessionLabel", isCare ? "Jornada" : "Clase",
                "sessionLabelPlural", isCare ? "Jornadas" : "Clases",
                "studentLabel", isCare ? "Niño" : "Alumno",
                "studentLabelPlural", isCare ? "Niños" : "Alumnos",
                "studentLabelFemale", isCare ? "Niña" : "Alumna"
        );
    }
}
