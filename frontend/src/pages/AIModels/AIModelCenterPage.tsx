import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { Bot } from 'lucide-react';

// Anomaly Detector and Optimization Engine removed per specification.
// Only ML forecasting models remain visible in Model Center.
const MODELS = [
  {
    name: 'Solar Forecast',
    algo: 'RandomForestRegressor',
    status: 'ACTIVE',
    mae: '0.0405 kW',
    r2: '0.9983',
    features: ['Hour of day', 'Cloud cover (%)', 'Temperature (°C)', 'Solar irradiance (W/m²)', 'Season', 'Latitude/Angle'],
    trainSamples: 1728,
    testSamples: 432,
    dataSource: '90-day synthetic campus data',
  },
  {
    name: 'Demand Forecast',
    algo: 'HistGradientBoostingRegressor',
    status: 'ACTIVE',
    mae: '0.4087 kW',
    r2: '0.9937',
    features: ['Hour of day', 'Day of week', 'Building type', 'Academic calendar', 'Holiday flag', 'Temperature'],
    trainSamples: 1728,
    testSamples: 432,
    dataSource: '90-day synthetic campus data',
  },
];

export default function AIModelCenterPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Bot size={20} color="var(--color-secondary)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>Model Center</h2>
        <div className="live-indicator"><div className="dot" />All Models Active</div>
      </div>
      {MODELS.map(m => (
        <GlassCard key={m.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', fontFamily: 'Space Grotesk' }}>{m.algo}</div>
            </div>
            <span style={{ fontSize: '0.65rem', padding: '3px 10px', background: 'rgba(32,214,123,0.1)', border: '1px solid rgba(32,214,123,0.25)', borderRadius: 20, color: 'var(--color-primary)', fontWeight: 600 }}>
              {m.status}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'MAE',              value: m.mae },
              { label: 'R²',               value: m.r2 },
              { label: 'Training Samples', value: m.trainSamples ? m.trainSamples.toLocaleString() : '—' },
              { label: 'Test Samples',     value: m.testSamples  ? m.testSamples.toLocaleString()  : '—' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--color-primary)' }}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6 }}>INPUT FEATURES:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {m.features.map(f => (
                <span key={f} style={{ background: 'rgba(39,215,208,0.07)', border: '1px solid rgba(39,215,208,0.15)', borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', color: 'var(--color-secondary)' }}>{f}</span>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Data Source: {m.dataSource}</div>
        </GlassCard>
      ))}
    </div>
  );
}
