package com.oorjasync.forecast;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {
    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("status", "success", "data", "list of forecast", "timestamp", LocalDateTime.now());
    }
}
