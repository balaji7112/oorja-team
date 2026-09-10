package com.oorjasync.optimization;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OptimizationService {
    public OptimizationDecision optimize() {
        return new OptimizationDecision("HOLD", "Preserve headroom", 0.9, "{}", "ESTIMATED 5kWh saving");
    }
}
