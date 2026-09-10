package com.oorjasync.telemetry;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {
    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("status", "success", "data", "list of telemetry", "timestamp", LocalDateTime.now());
    }
}
