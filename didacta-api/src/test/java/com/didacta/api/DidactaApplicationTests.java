package com.didacta.api;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requires PostgreSQL and Keycloak infrastructure. Run with integration test profile.")
class DidactaApplicationTests {

    @Test
    void contextLoads() {
    }

}
