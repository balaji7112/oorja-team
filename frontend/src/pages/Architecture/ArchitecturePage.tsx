import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { Network } from 'lucide-react';

const layers = [
  { name: 'Presentation Layer', color: 'var(--color-primary)', items: ['React 18 + TypeScript', 'React Three Fiber (3D)', 'Framer Motion', 'Apache ECharts', 'Tailwind CSS v3'] },
  { name: 'State Layer', color: 'var(--color-secondary)', items: ['Zustand + subscribeWithSelector', 'TanStack Query v5', 'Demo Simulator (3s ticks)', 'WebSocket (STOMP)'] },
  { name: 'API Layer', color: 'var(--color-solar)', items: ['Spring Boot 3.3 REST APIs', 'WebSocket (STOMP/SockJS)', 'JWT Authentication (HS256)', 'Spring Security 6'] },
  { name: 'Intelligence Layer', color: '#FF8A3D', items: ['FastAPI ML Service (port 8001)', 'RandomForestRegressor (Solar)', 'HistGradientBoosting (Demand)', 'IsolationForest (Anomaly)'] },
  { name: 'Data Layer', color: 'var(--color-grid)', items: ['PostgreSQL 15', 'Spring Data JPA', 'IoT Simulator (@Scheduled)', 'Flyway Migrations'] },
];

export default function ArchitecturePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Network size={20} color="var(--color-secondary)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>System Architecture</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {layers.map((layer, i) => (
          <GlassCard key={layer.name} style={{ borderLeft: `3px solid ${layer.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: layer.color, marginBottom: 8 }}>{layer.name}</div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Layer {layers.length - i}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {layer.items.map(item => (
                <span key={item} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item}</span>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
      <GlassCard>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12 }}>DATA FLOW</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {['IoT Simulator (3s)', '→', 'Spring Boot Backend', '→', 'PostgreSQL', '↔', 'ML Service (FastAPI)', '→', 'WebSocket Broadcast', '→', 'React Frontend', '→', 'Zustand Store', '→', '3D Canvas + Charts'].map((step, i) => (
            <span key={i} style={{ fontSize: step === '→' || step === '↔' ? '1rem' : '0.75rem', color: step === '→' || step === '↔' ? 'var(--color-primary)' : 'var(--text-secondary)', fontWeight: step.includes('→') ? 700 : 400 }}>{step}</span>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
