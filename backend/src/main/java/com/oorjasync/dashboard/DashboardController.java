package com.oorjasync.dashboard;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    @GetMapping("/summary")
    public Map<String, Object> summary() { return Map.of("status", "success", "data", "summary", "timestamp", LocalDateTime.now()); }
    @GetMapping("/energy-flow")
    public Map<String, Object> energyFlow() { return Map.of("status", "success", "data", "flow", "timestamp", LocalDateTime.now()); }
    @GetMapping("/score")
    public Map<String, Object> score() { return Map.of("status", "success", "data", "score", "timestamp", LocalDateTime.now()); }
}
