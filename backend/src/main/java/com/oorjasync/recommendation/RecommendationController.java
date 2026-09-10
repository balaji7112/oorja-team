package com.oorjasync.recommendation;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/recommendation")
public class RecommendationController {
    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("status", "success", "data", "list of recommendation", "timestamp", LocalDateTime.now());
    }
}
