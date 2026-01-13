package com.didacta.api.common;

import com.didacta.api.security.TenantContext;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class GeneralController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }


}
