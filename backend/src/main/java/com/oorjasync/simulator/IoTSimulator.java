package com.oorjasync.simulator;
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
