package com.oorjasync.cost;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/cost")
public class CostController {
    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("status", "success", "data", "list of cost", "timestamp", LocalDateTime.now());
    }
}
