import React from 'react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import { AlertTriangle } from 'lucide-react';

const sevColor: Record<string, string> = { LOW: '#91AAA2', MEDIUM: '#FFB84D', HIGH: '#FF8A3D', CRITICAL: '#FF5A5A' };

export default function AnomaliesPage() {
  const { anomalies, injectFault } = useEnergyStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <AlertTriangle size={20} color="var(--color-critical)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>Anomaly Detection</h2>
        <span style={{ fontSize: '0.72rem', color: anomalies.length > 0 ? 'var(--color-critical)' : 'var(--color-primary)' }}>
          {anomalies.length > 0 ? `${anomalies.length} Active` : 'No Anomalies'}
        </span>
      </div>

      <GlassCard padding="12px 16px">
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10 }}>FAULT INJECTION — DEMO SCENARIOS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {([['CLOUD_COVER', 'Cloud Event'], ['SOLAR_DUST', 'Panel Soiling'], ['BATTERY_HEATING', 'Battery Overheat'], ['LAB_LOAD_SPIKE', 'Load Spike'], ['SENSOR_DISCONNECT', 'Sensor Offline'], ['RESET', '↺ Reset']] as const).map(([fault, label]) => (
            <button key={fault} onClick={() => injectFault(fault)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer',
                background: fault === 'RESET' ? 'rgba(32,214,123,0.1)' : 'rgba(255,90,90,0.1)',
                border: `1px solid ${fault === 'RESET' ? 'rgba(32,214,123,0.25)' : 'rgba(255,90,90,0.25)'}`,
                color: fault === 'RESET' ? 'var(--color-primary)' : 'var(--color-critical)',
              }}>
              {label}
            </button>
          ))}
        </div>
      </GlassCard>

      {anomalies.length === 0 && (
        <GlassCard>
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>All Systems Normal</div>
            <div style={{ fontSize: '0.78rem', marginTop: 6 }}>No anomalies detected. IsolationForest model scanning all assets.</div>
          </div>
        </GlassCard>
      )}

      {anomalies.map(a => (
        <GlassCard key={a.id} glow={a.severity === 'CRITICAL' ? 'critical' : 'none'}
          style={{ borderColor: `${sevColor[a.severity]}30` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle size={15} color={sevColor[a.severity]} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.asset}</span>
              <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 20, background: `${sevColor[a.severity]}20`, color: sevColor[a.severity], fontWeight: 700 }}>{a.severity}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Score: {a.score.toFixed(2)} · {a.status}</div>
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{a.type.replace(/_/g, ' ')}</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px' }}>{a.possibleCause}</p>
          <div style={{ padding: '8px 12px', background: 'rgba(255,90,90,0.06)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            ⚡ <strong style={{ color: 'var(--text-primary)' }}>Action:</strong> {a.recommendedAction}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
