package com.oorjasync.device;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/device")
public class DeviceController {
    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("status", "success", "data", "list of device", "timestamp", LocalDateTime.now());
    }
}
