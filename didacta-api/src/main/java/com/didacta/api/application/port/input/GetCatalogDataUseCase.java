package com.didacta.api.application.port.input;

import java.util.List;
import java.util.Map;

public interface GetCatalogDataUseCase {
    List<Map<String, String>> getLevels();
    List<Map<String, String>> getShifts();
    List<Map<String, String>> getRoles();
    List<Map<String, String>> getGrades(String level);
    Map<String, String> getTerminology(String level);
}
