import React from 'react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import { Leaf } from 'lucide-react';

export default function CarbonPage() {
  const { dailyCo2Avoided, co2Avoided, renewableShare, solar, windPower } = useEnergyStore();
  const annualProjected = Math.round(dailyCo2Avoided * 365);
  const treesEquivalent = Math.round(annualProjected / 21);
  const carsEquivalent = Math.round(annualProjected / 4600);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Leaf size={20} color="var(--color-primary)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>Carbon Impact</h2>
        <div className="status-demo">PROJECTED</div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPICard label="CO₂ Avoided (Today)" value={dailyCo2Avoided.toFixed(1)} unit="kg" color="var(--color-primary)" />
        <KPICard label="CO₂ Rate" value={co2Avoided.toFixed(2)} unit="kg/hr" color="var(--color-secondary)" />
        <KPICard label="Renewable Share" value={renewableShare} unit="%" color="var(--color-primary)" />
        <KPICard label="Annual Projected" value={annualProjected.toLocaleString()} unit="kg CO₂" color="var(--color-primary)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { emoji: '🌳', value: treesEquivalent.toLocaleString(), label: 'Trees Equivalent', sub: 'Annual CO₂ absorption at 21 kg/tree/year' },
          { emoji: '🚗', value: carsEquivalent.toLocaleString(), label: 'Cars Off Road', sub: 'Average car emits 4.6t CO₂/year' },
          { emoji: '🏠', value: Math.round(annualProjected / 2800).toLocaleString(), label: 'Homes Powered', sub: 'Average home uses 2.8t CO₂/year' },
        ].map(item => (
          <GlassCard key={item.label} style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{item.emoji}</div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '2rem', color: 'var(--color-primary)', marginBottom: 4 }}>{item.value}</div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.sub}</div>
          </GlassCard>
        ))}
      </div>
      <GlassCard>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10 }}>CARBON BASELINE COMPARISON — PROJECTED</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Grid Emission Factor', value: '0.82 kg CO₂/kWh', note: 'India National Average' },
            { label: 'Solar Generation Today', value: `${solar.dailyGeneration.toFixed(1)} kWh`, note: 'SIMULATED' },
            { label: 'Wind Generation Today', value: `${(windPower * 24 * 0.3).toFixed(1)} kWh`, note: 'ESTIMATED' },
            { label: 'CO₂ Avoided Today', value: `${dailyCo2Avoided.toFixed(1)} kg`, note: 'PROJECTED' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.label}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.9rem' }}>{item.value}</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{item.note}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
