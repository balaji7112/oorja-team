package com.oorjasync.optimization;
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
