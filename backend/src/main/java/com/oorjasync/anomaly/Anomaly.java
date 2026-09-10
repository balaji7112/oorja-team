package com.oorjasync.anomaly;
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
