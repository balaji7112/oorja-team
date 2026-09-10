import os

base_dir = r"C:\Users\Balaji\.gemini\antigravity\scratch\oorja-sync\backend\src\main\java\com\oorjasync"

files = {
    "user/Role.java": """package com.oorjasync.user;
public enum Role { ADMIN, ENERGY_MANAGER, ANALYST, OPERATOR, VIEWER }
""",
    "user/User.java": """package com.oorjasync.user;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    private Role role;
    private String fullName;
    private boolean active = true;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
""",
    "campus/Campus.java": """package com.oorjasync.campus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "campuses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Campus {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String location;
    private String city;
    private String state;
    private Double latitude;
    private Double longitude;
    private Double totalSolarCapacity;
    private Double totalBatteryCapacity;
    private Double totalWindCapacity;
    private Integer buildingCount;
    private String status;
}
""",
    "campus/Building.java": """package com.oorjasync.campus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "buildings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Building {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Campus campus;
    private String name;
    private String type;
    private Double peakLoad;
    private Double floorArea;
    private String status;
    private Double latitude;
    private Double longitude;
    private String description;
}
""",
    "telemetry/SensorReading.java": """package com.oorjasync.telemetry;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_readings", indexes = {
    @Index(name = "idx_sensor_timestamp", columnList = "recorded_at"),
    @Index(name = "idx_sensor_asset", columnList = "asset_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorReading {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long assetId;
    private String deviceId;
    private String readingType;
    private Double solarPower;
    private Double totalLoad;
    private Double batterySoc;
    private Double batteryVoltage;
    private Double batteryCurrent;
    private Double batteryTemp;
    private Double gridImport;
    private Double gridExport;
    private Double windPower;
    private Double temperature;
    private Double humidity;
    private Double cloudCover;
    private Double solarIrradiance;
    private Double windSpeed;
    private Double academicLoad;
    private Double labLoad;
    private Double libraryLoad;
    private Double hostelLoad;
    private Double canteenLoad;
    private Double evLoad;
    private Double anomalyScore;
    private String anomalyType;
    private String batteryAction;
    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}
""",
    "recommendation/Recommendation.java": """package com.oorjasync.recommendation;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String priority;
    private Double confidence;
    private String reason;
    @Column(columnDefinition = "TEXT")
    private String inputs;
    private String projectedImpact;
    private String affectedAsset;
    private String status;
    private Long approvedById;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
}
""",
    "anomaly/Anomaly.java": """package com.oorjasync.anomaly;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "anomalies")
@Data
public class Anomaly {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String asset;
    private String type;
    private String severity;
    private Double score;
    private String possibleCause;
    private String recommendedAction;
    private String status;
    @Column(name = "detected_at")
    private LocalDateTime detectedAt;
}
""",
    # JWT & Security
    "security/UserDetailsServiceImpl.java": """package com.oorjasync.security;
import com.oorjasync.user.UserRepository;
import com.oorjasync.user.User;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.Collections;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;
    public UserDetailsServiceImpl(UserRepository userRepository) { this.userRepository = userRepository; }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPasswordHash(), Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
    }
}
""",
    "security/JwtUtil.java": """package com.oorjasync.security;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.util.function.Function;
import javax.crypto.SecretKey;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    private Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder().subject(userDetails.getUsername()).issuedAt(new Date(System.currentTimeMillis())).expiration(new Date(System.currentTimeMillis() + expiration)).signWith(getSigningKey()).compact();
    }
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
""",
    "security/JwtFilter.java": """package com.oorjasync.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    public JwtFilter(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            username = jwtUtil.extractUsername(jwt);
        }
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            if (jwtUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(token);
            }
        }
        chain.doFilter(request, response);
    }
}
""",
    "config/WebSecurityConfig.java": """package com.oorjasync.config;
import com.oorjasync.security.JwtFilter;
import com.oorjasync.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final JwtFilter jwtFilter;
    private final UserDetailsServiceImpl userDetailsService;
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/ws/**", "/actuator/health").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
""",
    "config/WebSocketConfig.java": """package com.oorjasync.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
}
""",
    "BackendApplication.java": """package com.oorjasync;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
""",
    "user/UserRepository.java": """package com.oorjasync.user;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
""",
    "websocket/TelemetryPublisher.java": """package com.oorjasync.websocket;
import com.oorjasync.telemetry.SensorReading;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TelemetryPublisher {
    private final SimpMessagingTemplate messagingTemplate;
    public void publishTelemetry(SensorReading reading) {
        messagingTemplate.convertAndSend("/topic/telemetry", reading);
    }
    public void publishAlert(String alert) {
        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }
}
""",
    "simulator/IoTSimulator.java": """package com.oorjasync.simulator;
import com.oorjasync.websocket.TelemetryPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.oorjasync.telemetry.SensorReading;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class IoTSimulator {
    private final TelemetryPublisher publisher;
    @Scheduled(fixedRate = 3000)
    public void simulateTelemetry() {
        SensorReading reading = SensorReading.builder().recordedAt(LocalDateTime.now()).solarPower(50.0).build();
        publisher.publishTelemetry(reading);
    }
}
""",
    "optimization/OptimizationService.java": """package com.oorjasync.optimization;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OptimizationService {
    public OptimizationDecision optimize() {
        return new OptimizationDecision("HOLD", "Preserve headroom", 0.9, "{}", "ESTIMATED 5kWh saving");
    }
}
""",
    "optimization/OptimizationDecision.java": """package com.oorjasync.optimization;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationDecision {
    private String action;
    private String reason;
    private Double confidence;
    private String inputs;
    private String expectedImpact;
}
""",
    "seed/DataSeeder.java": """package com.oorjasync.seed;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Seed data
    }
}
""",
    "dashboard/DashboardService.java": """package com.oorjasync.dashboard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {
    public Object getSummary() { return new Object(); }
    public Object getEnergyFlow() { return new Object(); }
    public Object getScore() { return new Object(); }
}
"""
}

# Generate some dummy controllers
controllers = ["AuthController", "CampusController", "AssetController", "TelemetryController", "WeatherController", "ForecastController", "OptimizationController", "RecommendationController", "AnomalyController", "ScenarioController", "CarbonController", "CostController", "DeviceController", "DashboardController", "ReportController"]

for c in controllers:
    pkg = c.replace("Controller", "").lower()
    if pkg == 'auth':
        continue
    files[f"{pkg}/{c}.java"] = f"""package com.oorjasync.{pkg};
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/{pkg}")
public class {c} {{
    @GetMapping
    public Map<String, Object> getAll() {{
        return Map.of("status", "success", "data", "list of {pkg}", "timestamp", LocalDateTime.now());
    }}
}}
"""

files["auth/AuthController.java"] = """package com.oorjasync.auth;
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
"""

files["dashboard/DashboardController.java"] = """package com.oorjasync.dashboard;
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
"""

# Other specific endpoints
for e in ["solar", "battery", "consumption", "forecast", "optimization", "recommendations", "anomalies", "weather", "devices", "sensor-data", "scenario", "carbon", "cost", "reports", "audit"]:
    files[f"dummy/{e}Controller.java"] = f"""package com.oorjasync.dummy;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/{e}")
public class {e}Controller {{
    @GetMapping
    public Map<String, Object> get() {{ return Map.of("status", "success", "data", "ESTIMATED", "timestamp", LocalDateTime.now()); }}
    @PostMapping
    public Map<String, Object> post() {{ return Map.of("status", "success", "data", "ESTIMATED", "timestamp", LocalDateTime.now()); }}
}}
"""

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
