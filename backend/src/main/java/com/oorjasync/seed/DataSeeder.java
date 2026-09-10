package com.oorjasync.seed;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Seed data
    }
}
