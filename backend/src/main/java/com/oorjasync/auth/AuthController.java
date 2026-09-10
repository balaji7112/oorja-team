package com.oorjasync.auth;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/login")
    public Map<String, Object> login() {
        return Map.of("status", "success", "data", "token", "timestamp", LocalDateTime.now());
    }
    @PostMapping("/register")
    public Map<String, Object> register() {
        return Map.of("status", "success", "data", "registered", "timestamp", LocalDateTime.now());
    }
}
