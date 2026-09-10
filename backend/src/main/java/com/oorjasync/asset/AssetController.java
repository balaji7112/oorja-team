package com.oorjasync.asset;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/asset")
public class AssetController {
    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("status", "success", "data", "list of asset", "timestamp", LocalDateTime.now());
    }
}
