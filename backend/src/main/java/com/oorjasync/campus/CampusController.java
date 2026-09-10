package com.oorjasync.campus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/campus")
public class CampusController {
    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("status", "success", "data", "list of campus", "timestamp", LocalDateTime.now());
    }
}
