import React from 'react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import { Settings } from 'lucide-react';

export default function AdminPage() {
  const { mode, setMode } = useEnergyStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Settings size={20} color="var(--text-secondary)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>Admin &amp; Configuration</h2>
      </div>
      <GlassCard>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12 }}>SYSTEM MODE</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['DEMO', 'LIVE', 'SCENARIO'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ padding: '8px 20px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', background: mode === m ? 'rgba(32,214,123,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${mode === m ? 'rgba(32,214,123,0.3)' : 'var(--glass-border)'}`, color: mode === m ? 'var(--color-primary)' : 'var(--text-secondary)' }}>
              {m}
            </button>
          ))}
        </div>
      </GlassCard>
      <GlassCard>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12 }}>ENVIRONMENT INFO</div>
        {[
          { label: 'Frontend', value: 'React 18 + Vite 6 + TypeScript' },
          { label: 'Backend', value: 'Spring Boot 3.3 + PostgreSQL' },
          { label: 'ML Service', value: 'FastAPI + scikit-learn' },
          { label: 'Campus Location', value: 'Bhopal, India (23.25°N)' },
          { label: 'Data Update Rate', value: 'Every 3 seconds (demo)' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
