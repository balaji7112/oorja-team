package com.oorjasync.optimization;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/optimization")
public class OptimizationController {
    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("status", "success", "data", "list of optimization", "timestamp", LocalDateTime.now());
    }
}
