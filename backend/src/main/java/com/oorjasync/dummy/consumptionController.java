package com.oorjasync.dummy;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/consumption")
public class consumptionController {
    @GetMapping
    public Map<String, Object> get() { return Map.of("status", "success", "data", "ESTIMATED", "timestamp", LocalDateTime.now()); }
    @PostMapping
    public Map<String, Object> post() { return Map.of("status", "success", "data", "ESTIMATED", "timestamp", LocalDateTime.now()); }
}
