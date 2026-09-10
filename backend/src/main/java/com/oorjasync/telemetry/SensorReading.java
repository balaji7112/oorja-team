package com.oorjasync.telemetry;
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
