package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.input.ManageSessionsUseCase;
import com.didacta.api.application.port.output.GroupRepositoryPort;
import com.didacta.api.application.port.output.SessionRepositoryPort;
import com.didacta.api.application.port.output.TenantProviderPort;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ManageSessionsService implements ManageSessionsUseCase {

    private final SessionRepositoryPort sessionRepository;
    private final GroupRepositoryPort groupRepository;
    private final TenantProviderPort tenantProvider;

    @Override
    @Transactional
    public OnboardingResult.SessionDto create(OnboardingCommand.CreateSession command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        // Validate group belongs to this institution
        groupRepository.findById(command.getGroupId())
                .filter(g -> g.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new EntityNotFoundException("Group", command.getGroupId().toString()));

        Session session = new Session();
        session.setTitle(command.getTitle());
        session.setNotes(command.getNotes());
        session.setGroupId(command.getGroupId());
        session.setSessionDate(command.getSessionDate());
        if (command.getSessionType() != null) {
            session.setSessionType(Session.SessionType.valueOf(command.getSessionType()));
        }
        session.setSubject(command.getSubject());
        return toDto(sessionRepository.save(session));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OnboardingResult.SessionDto> listAll() {
        return sessionRepository.findAll().stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OnboardingResult.SessionDto findById(UUID id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Session", id.toString()));
        return toDto(session);
    }

    @Override
    @Transactional
    public OnboardingResult.SessionDto complete(UUID id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Session", id.toString()));
        session.setStatus(Session.SessionStatus.COMPLETED);
        return toDto(sessionRepository.save(session));
    }

    private OnboardingResult.SessionDto toDto(Session s) {
        return OnboardingResult.SessionDto.builder()
                .id(s.getId())
                .groupId(s.getGroupId())
                .title(s.getTitle())
                .notes(s.getNotes())
                .status(s.getStatus().name())
                .sessionDate(s.getSessionDate() != null ? s.getSessionDate().toString() : null)
                .sessionType(s.getSessionType().name())
                .subject(s.getSubject())
                .build();
    }
}
