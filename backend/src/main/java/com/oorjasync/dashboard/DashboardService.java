package com.oorjasync.dashboard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {
    public Object getSummary() { return new Object(); }
    public Object getEnergyFlow() { return new Object(); }
    public Object getScore() { return new Object(); }
}
