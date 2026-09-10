package com.oorjasync.carbon;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/carbon")
public class CarbonController {
    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("status", "success", "data", "list of carbon", "timestamp", LocalDateTime.now());
    }
}
