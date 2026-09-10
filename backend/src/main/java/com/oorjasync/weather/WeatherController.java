package com.oorjasync.weather;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {
    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("status", "success", "data", "list of weather", "timestamp", LocalDateTime.now());
    }
}
