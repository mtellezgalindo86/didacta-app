package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.GuardianCommand;
import com.didacta.api.application.dto.GuardianResult;

import java.util.List;
import java.util.UUID;

public interface ManageGuardiansUseCase {
    GuardianResult.GuardianCreated createAndLink(GuardianCommand.Create command);
    GuardianResult.StudentLinkResponse linkExistingToStudent(UUID guardianId, GuardianCommand.LinkStudent command);
    List<GuardianResult.GuardianOfStudentResponse> getGuardiansOfStudent(UUID studentId);
    void unlinkFromStudent(UUID guardianId, UUID linkId);
    List<GuardianResult.GuardianListItem> list(String status, String search);
    GuardianResult.GuardianResponse getById(UUID guardianId);
    GuardianResult.GuardianResponse update(UUID guardianId, GuardianCommand.Update command);
    void updateLink(UUID guardianId, UUID linkId, GuardianCommand.UpdateLink command);
    void changeStatus(UUID guardianId, GuardianCommand.ChangeStatus command);
}
