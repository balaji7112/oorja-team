package com.oorjasync.scenario;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/scenario")
public class ScenarioController {
    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("status", "success", "data", "list of scenario", "timestamp", LocalDateTime.now());
    }
}
