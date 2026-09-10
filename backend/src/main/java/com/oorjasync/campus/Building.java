package com.oorjasync.campus;
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
