import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import { FlaskConical, Play } from 'lucide-react';

const SCENARIOS = [
  { id: 'cloud-event', label: '☁ Cloud Cover Event', desc: 'Simulates 80% cloud cover — solar output drops ~65%', fault: 'CLOUD_COVER' as const },
  { id: 'panel-dust', label: '🌫 Panel Soiling', desc: 'Reduces solar efficiency by 38% due to dust accumulation', fault: 'SOLAR_DUST' as const },
  { id: 'bat-heat', label: '🌡 Battery Overheating', desc: 'Battery temp rises to 42°C — triggers HOLD action', fault: 'BATTERY_HEATING' as const },
  { id: 'load-spike', label: '⚡ Demand Spike', desc: 'Computer Lab draws 2× normal load — anomaly detected', fault: 'LAB_LOAD_SPIKE' as const },
  { id: 'demand', label: '📈 High Demand Day', desc: 'All buildings at peak occupancy — 40% load increase', fault: 'INCREASE_DEMAND' as const },
  { id: 'sensor', label: '🔌 Sensor Offline', desc: 'Lab power meter disconnects — triggers fallback estimation', fault: 'SENSOR_DISCONNECT' as const },
];

export default function ScenarioLabPage() {
  const { injectFault, activeFault, solar, battery, totalLoad, gridDependency } = useEnergyStore();
  const [runningScenario, setRunningScenario] = useState<string | null>(null);

  const runScenario = (s: typeof SCENARIOS[0]) => {
    setRunningScenario(s.id);
    injectFault(s.fault);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <FlaskConical size={20} color="var(--color-secondary)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>Scenario Lab</h2>
        <div className="status-demo">SIMULATED</div>
        {activeFault && <span style={{ fontSize: '0.72rem', color: 'var(--color-critical)', fontWeight: 600 }}>⚡ {activeFault} ACTIVE</span>}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPICard label="Solar Output" value={solar.currentPower} unit="kW" color="var(--color-solar)" small />
        <KPICard label="Battery SOC" value={battery.soc} unit="%" small />
        <KPICard label="Total Load" value={totalLoad} unit="kW" small />
        <KPICard label="Grid Dependency" value={gridDependency} unit="%" small />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {SCENARIOS.map(s => (
          <GlassCard key={s.id} hover
            style={{ borderColor: runningScenario === s.id && activeFault ? 'rgba(255,90,90,0.3)' : undefined }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>{s.label}</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px' }}>{s.desc}</p>
            <button
              onClick={() => runScenario(s)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'rgba(255,90,90,0.1)', border: '1px solid rgba(255,90,90,0.25)',
                borderRadius: 8, padding: '8px', color: 'var(--color-critical)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              }}
            >
              <Play size={13} /> Run Scenario
            </button>
          </GlassCard>
        ))}
      </div>

      <button
        onClick={() => { injectFault('RESET'); setRunningScenario(null); }}
        style={{
          alignSelf: 'flex-start', background: 'rgba(32,214,123,0.1)', border: '1px solid rgba(32,214,123,0.25)',
          borderRadius: 8, padding: '9px 20px', color: 'var(--color-primary)',
          cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
        }}
      >
        ↺ Reset All Scenarios
      </button>
    </div>
  );
}
