package com.didacta.api.infrastructure.adapter.input.web;

import com.didacta.api.domain.exception.DomainException;
import com.didacta.api.domain.exception.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleEntityNotFound_shouldReturn404WithMessage() {
        // Given
        EntityNotFoundException ex = new EntityNotFoundException("Student", "abc-123");

        // When
        ResponseEntity<Map<String, Object>> response = handler.handleEntityNotFound(ex);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(404, body.get("status"));
        assertEquals("Not Found", body.get("error"));
        assertTrue(body.get("message").toString().contains("Student"));
        assertNotNull(body.get("timestamp"));
    }

    @Test
    void handleDomainException_shouldReturn400WithMessage() {
        // Given
        DomainException ex = new DomainException("No X-Institution-Id header provided");

        // When
        ResponseEntity<Map<String, Object>> response = handler.handleDomainException(ex);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(400, body.get("status"));
        assertEquals("Bad Request", body.get("error"));
        assertEquals("No X-Institution-Id header provided", body.get("message"));
    }

    @Test
    void handleValidation_shouldReturn400WithFieldErrors() {
        // Given
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);

        FieldError fieldError1 = new FieldError("cmd", "name", "must not be blank");
        FieldError fieldError2 = new FieldError("cmd", "email", "must be a valid email");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError1, fieldError2));

        // When
        ResponseEntity<Map<String, Object>> response = handler.handleValidation(ex);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(400, body.get("status"));
        assertEquals("Validation failed", body.get("error"));

        @SuppressWarnings("unchecked")
        List<String> messages = (List<String>) body.get("messages");
        assertEquals(2, messages.size());
        assertTrue(messages.contains("name: must not be blank"));
        assertTrue(messages.contains("email: must be a valid email"));
    }

    @Test
    void handleGeneric_shouldReturn500WithGenericMessage() {
        // Given
        RuntimeException ex = new RuntimeException("Something unexpected");

        // When
        ResponseEntity<Map<String, Object>> response = handler.handleGeneric(ex);

        // Then
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(500, body.get("status"));
        assertEquals("Internal server error", body.get("message"));
    }

    @Test
    void handleIllegalArgument_shouldReturn400WithMessage() {
        // Given
        IllegalArgumentException ex = new IllegalArgumentException("Invalid status: INVALID_STATUS");

        // When
        ResponseEntity<Map<String, Object>> response = handler.handleIllegalArgument(ex);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(400, body.get("status"));
        assertEquals("Invalid status: INVALID_STATUS", body.get("message"));
    }
}
