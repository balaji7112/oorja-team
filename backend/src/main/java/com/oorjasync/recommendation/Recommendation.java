package com.oorjasync.recommendation;
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
