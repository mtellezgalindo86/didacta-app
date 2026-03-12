package com.didacta.api.domain.exception;

public class EntityNotFoundException extends DomainException {
    public EntityNotFoundException(String entity, String identifier) {
        super(entity + " not found: " + identifier);
    }
}
