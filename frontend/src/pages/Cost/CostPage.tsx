import React from 'react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import { DollarSign } from 'lucide-react';

export default function CostPage() {
  const { estimatedCostSaving, gridImport, gridDependency, renewableShare, solar } = useEnergyStore();
  const peakTariff = 12; const offPeakTariff = 5; const solarCost = 0;
  const dailyGridCost = gridImport * 24 * 0.3 * peakTariff;
  const dailyBaseline = (solar.currentPower + gridImport) * 24 * 0.3 * peakTariff;
  const saving = dailyBaseline - dailyGridCost;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <DollarSign size={20} color="var(--color-solar)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>Cost Analysis</h2>
        <div className="status-demo">PROJECTED</div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPICard label="Estimated Daily Saving" value={`₹${estimatedCostSaving.toLocaleString()}`} unit="" color="var(--color-primary)" />
        <KPICard label="Grid Import Cost" value={`₹${Math.round(dailyGridCost).toLocaleString()}`} unit="/day" />
        <KPICard label="Peak Tariff" value={`₹${peakTariff}`} unit="/kWh" />
        <KPICard label="Off-Peak Tariff" value={`₹${offPeakTariff}`} unit="/kWh" />
        <KPICard label="Solar LCOE" value="₹2.5" unit="/kWh" color="var(--color-primary)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <GlassCard>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12 }}>TARIFF SCHEDULE — INDIA GRID</div>
          {[
            { period: 'Peak (18:00–22:00)', tariff: '₹12/kWh', color: 'var(--color-critical)' },
            { period: 'Day (06:00–18:00)', tariff: '₹8/kWh', color: 'var(--color-solar)' },
            { period: 'Off-Peak (22:00–06:00)', tariff: '₹5/kWh', color: 'var(--color-primary)' },
            { period: 'Solar (On-site)', tariff: '₹2.5/kWh LCOE', color: 'var(--color-secondary)' },
          ].map(t => (
            <div key={t.period} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t.period}</span>
              <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: t.color }}>{t.tariff}</span>
            </div>
          ))}
        </GlassCard>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8 }}>PROJECTED ANNUAL SAVING</div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '2.5rem', color: 'var(--color-primary)' }}>
            ₹{(estimatedCostSaving * 365).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>Based on current renewable output & tariffs</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>ESTIMATED — based on demo simulation</div>
        </GlassCard>
      </div>
    </div>
  );
}
