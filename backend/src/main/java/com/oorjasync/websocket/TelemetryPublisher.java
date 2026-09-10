package com.oorjasync.websocket;
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
