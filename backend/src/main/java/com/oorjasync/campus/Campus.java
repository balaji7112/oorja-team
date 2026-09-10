package com.oorjasync.campus;
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
