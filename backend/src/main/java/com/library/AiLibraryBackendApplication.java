package com.library;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AiLibraryBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiLibraryBackendApplication.class, args);
    }
}
