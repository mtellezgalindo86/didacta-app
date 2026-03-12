package com.didacta.api.infrastructure.adapter.input.web.controller;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.input.*;
import com.didacta.api.infrastructure.config.SecurityConfig;
import com.didacta.api.infrastructure.security.TenantInterceptor;
import com.didacta.api.infrastructure.security.UserSyncFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = OnboardingController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {SecurityConfig.class, TenantInterceptor.class, UserSyncFilter.class}
    ),
    excludeAutoConfiguration = OAuth2ResourceServerAutoConfiguration.class
)
@Import(OnboardingControllerTest.TestSecurityConfig.class)
class OnboardingControllerTest {

    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
            http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwtConfigurer -> {}));
            return http.build();
        }

        @Bean
        public JwtDecoder jwtDecoder() {
            return token -> { throw new UnsupportedOperationException("should not be called"); };
        }
    }

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private GetOnboardingStatusUseCase getOnboardingStatus;
    @MockBean private CreateInstitutionUseCase createInstitution;
    @MockBean private CreateGroupUseCase createGroup;
    @MockBean private ManageStudentsUseCase manageStudents;
    @MockBean private ManageAttendanceUseCase manageAttendance;
    @MockBean private ManageCollaboratorsUseCase manageCollaborators;
    @MockBean private GetInstitutionInfoUseCase getInstitutionInfo;

    private static final String KEYCLOAK_SUB = "kc-user-123";

    @Test
    void getMe_givenAuthenticatedUser_shouldReturn200WithMeResponse() throws Exception {
        // Given
        OnboardingResult.MeResponse meResponse = OnboardingResult.MeResponse.builder()
                .user(OnboardingResult.UserDto.builder()
                        .id(UUID.randomUUID())
                        .email("test@didacta.com")
                        .firstName("Test")
                        .lastName("User")
                        .build())
                .onboarding(OnboardingResult.OnboardingStatus.builder()
                        .hasInstitution(false)
                        .nextStep("STEP_0")
                        .build())
                .build();

        when(getOnboardingStatus.execute(KEYCLOAK_SUB)).thenReturn(meResponse);

        // When & Then
        mockMvc.perform(get("/api/me")
                        .with(jwt().jwt(j -> j.subject(KEYCLOAK_SUB))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("test@didacta.com"))
                .andExpect(jsonPath("$.onboarding.nextStep").value("STEP_0"))
                .andExpect(jsonPath("$.onboarding.hasInstitution").value(false));
    }

    @Test
    void getMe_givenNoAuthentication_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createInstitution_givenValidCommand_shouldReturn200() throws Exception {
        // Given
        OnboardingCommand.CreateInstitution cmd = new OnboardingCommand.CreateInstitution();
        cmd.setName("Colegio ABC");
        cmd.setMainLevel("PRIMARY");
        cmd.setCountry("MX");
        cmd.setTimezone("America/Mexico_City");
        cmd.setRole("OWNER");

        UUID institutionId = UUID.randomUUID();
        OnboardingResult.InstitutionCreated result = OnboardingResult.InstitutionCreated.builder()
                .institutionId(institutionId)
                .nextStep("STEP_2")
                .build();

        when(createInstitution.execute(eq(KEYCLOAK_SUB), any())).thenReturn(result);

        // When & Then
        mockMvc.perform(post("/api/onboarding/institution")
                        .with(jwt().jwt(j -> j.subject(KEYCLOAK_SUB)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cmd)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.institutionId").value(institutionId.toString()))
                .andExpect(jsonPath("$.nextStep").value("STEP_2"));
    }

    @Test
    void createGroup_givenValidCommand_shouldReturn200() throws Exception {
        // Given
        OnboardingCommand.CreateGroup cmd = new OnboardingCommand.CreateGroup();
        cmd.setName("1A");
        cmd.setGradeLevel("FIRST");
        cmd.setShift("MATUTINO");

        UUID groupId = UUID.randomUUID();
        OnboardingResult.GroupCreated result = OnboardingResult.GroupCreated.builder()
                .groupId(groupId)
                .nextStep("STEP_3")
                .build();

        when(createGroup.execute(eq(KEYCLOAK_SUB), any())).thenReturn(result);

        // When & Then
        mockMvc.perform(post("/api/onboarding/group")
                        .with(jwt().jwt(j -> j.subject(KEYCLOAK_SUB)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cmd)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groupId").value(groupId.toString()))
                .andExpect(jsonPath("$.nextStep").value("STEP_3"));
    }

    @Test
    void createStudents_givenValidCommand_shouldReturn200() throws Exception {
        // Given
        OnboardingCommand.StudentEntry entry = new OnboardingCommand.StudentEntry();
        entry.setFirstName("Juan");
        entry.setLastName("Perez");

        OnboardingCommand.CreateStudents cmd = new OnboardingCommand.CreateStudents();
        cmd.setGroupId(UUID.randomUUID());
        cmd.setStudents(List.of(entry));

        OnboardingResult.StudentsCreated result = OnboardingResult.StudentsCreated.builder()
                .created(1)
                .students(List.of(OnboardingResult.StudentDto.builder()
                        .id(UUID.randomUUID())
                        .firstName("Juan")
                        .lastName("Perez")
                        .status("ACTIVE")
                        .build()))
                .nextStep("STEP_4")
                .build();

        when(manageStudents.create(eq(KEYCLOAK_SUB), any())).thenReturn(result);

        // When & Then
        mockMvc.perform(post("/api/onboarding/students")
                        .with(jwt().jwt(j -> j.subject(KEYCLOAK_SUB)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cmd)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.created").value(1))
                .andExpect(jsonPath("$.students[0].firstName").value("Juan"))
                .andExpect(jsonPath("$.nextStep").value("STEP_4"));
    }

    @Test
    void getStudents_givenAuthenticatedUser_shouldReturn200() throws Exception {
        // Given
        List<OnboardingResult.StudentDto> students = List.of(
                OnboardingResult.StudentDto.builder()
                        .id(UUID.randomUUID())
                        .firstName("Juan")
                        .lastName("Perez")
                        .status("ACTIVE")
                        .build()
        );

        when(manageStudents.listByInstitution()).thenReturn(students);

        // When & Then
        mockMvc.perform(get("/api/onboarding/students")
                        .with(jwt().jwt(j -> j.subject(KEYCLOAK_SUB))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("Juan"));
    }

    @Test
    void createAttendance_givenValidCommand_shouldReturn200() throws Exception {
        // Given
        OnboardingCommand.AttendanceEntry entry = new OnboardingCommand.AttendanceEntry();
        entry.setStudentId(UUID.randomUUID());
        entry.setStatus("PRESENT");

        OnboardingCommand.CreateAttendance cmd = new OnboardingCommand.CreateAttendance();
        cmd.setGroupId(UUID.randomUUID());
        cmd.setDate(java.time.LocalDate.of(2026, 3, 10));
        cmd.setEntries(List.of(entry));

        UUID sessionId = UUID.randomUUID();
        OnboardingResult.AttendanceCreated result = OnboardingResult.AttendanceCreated.builder()
                .recorded(1)
                .sessionId(sessionId)
                .nextStep("STEP_5")
                .build();

        when(manageAttendance.create(eq(KEYCLOAK_SUB), any())).thenReturn(result);

        // When & Then
        mockMvc.perform(post("/api/onboarding/attendance")
                        .with(jwt().jwt(j -> j.subject(KEYCLOAK_SUB)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cmd)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recorded").value(1))
                .andExpect(jsonPath("$.sessionId").value(sessionId.toString()))
                .andExpect(jsonPath("$.nextStep").value("STEP_5"));
    }
}
