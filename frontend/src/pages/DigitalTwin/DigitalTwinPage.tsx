import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import { Globe, Cpu, BarChart2, Sun, Wind, Battery, Zap } from 'lucide-react';

// ── Asset types ──────────────────────────────────────────────────────
type Preset = 'AERIAL' | 'SOLAR' | 'BATTERY' | 'BUILDING' | 'WIND' | 'ENERGY_NETWORK';
const presets: Preset[] = ['AERIAL', 'SOLAR', 'BATTERY', 'BUILDING', 'WIND', 'ENERGY_NETWORK'];

const ASSET_INFO: Record<string, { label: string; icon: string; desc: string; color: string }> = {
  solar:   { label: 'Solar Farm',     icon: '☀️',  desc: '640 bifacial panels · 180 kWp peak · MPPT inverters', color: 'var(--color-solar)' },
  wind:    { label: 'Wind Turbines',  icon: '💨',  desc: '3 × 25 kW micro-turbines · hub height 30m', color: 'var(--color-grid)' },
  battery: { label: 'Battery Bank',   icon: '🔋',  desc: '400 kWh LiFePO₄ · 4C discharge · BMS protected', color: 'var(--color-secondary)' },
  grid:    { label: 'Grid Connection',icon: '🏭',  desc: '3-phase 11 kV connection · bidirectional metering', color: 'var(--color-accent)' },
  academic:{ label: 'Academic Block', icon: '🏛️',  desc: 'Classrooms, labs, faculty offices · 40 kW peak', color: 'var(--color-primary)' },
  hostel:  { label: 'Hostel Block',   icon: '🏠',  desc: 'Residential block · 24hr load · 22 kW avg', color: 'var(--color-primary)' },
  canteen: { label: 'Canteen',        icon: '🍽️',  desc: 'Kitchen + seating · 15 kW · solar water heating', color: 'var(--color-success)' },
  library: { label: 'Library',        icon: '📚',  desc: 'AC + lighting · smart occupancy sensors · 12 kW', color: 'var(--color-primary)' },
};

// ── Campus Schematic (replaces 3D canvas) ────────────────────────────
function CampusSchematic({ selected, onSelect, preset }: {
  selected: string | null;
  onSelect: (id: string) => void;
  preset: Preset;
}) {
  const { solar, battery, windPower, totalLoad, gridDependency, energyState } = useEnergyStore();

  const AssetNode = ({ id, x, y, label, icon, value, unit, color, size = 80 }: {
    id: string; x: number; y: number; label: string; icon: string;
    value: string; unit: string; color: string; size?: number;
  }) => {
    const isSelected = selected === id;
    return (
      <motion.div
        onClick={() => onSelect(id)}
        whileHover={{ scale: 1.06, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.97 }}
        style={{
          position: 'absolute', left: `${x}%`, top: `${y}%`,
          transform: 'translate(-50%,-50%)',
          width: size, height: size,
          background: isSelected ? `${color}18` : 'rgba(20,25,32,0.92)',
          border: `${isSelected ? 2 : 1}px solid ${isSelected ? color : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 14, cursor: 'pointer', zIndex: 5,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: isSelected ? `0 4px 20px ${color}25` : '0 2px 12px rgba(0,0,0,0.3)',
          padding: 8,
          transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        }}
      >
        <div style={{ fontSize: '1.4rem', lineHeight: 1, marginBottom: 3 }}>{icon}</div>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.85rem', color }}>{value}<span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 1 }}>{unit}</span></div>
        <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2, marginTop: 2 }}>{label}</div>
      </motion.div>
    );
  };

  const stateColor: Record<string, string> = {
    SURPLUS: 'var(--color-success)', BALANCED: 'var(--color-primary)',
    DEFICIT: 'var(--color-solar)', CRITICAL: 'var(--color-critical)',
    NORMAL: 'var(--color-success)', FAULT: 'var(--color-critical)',
  };
  const sc = stateColor[energyState] || 'var(--color-primary)';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 380 }}>
      {/* State */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ background: `${sc}12`, border: `1px solid ${sc}25`, borderRadius: 20, padding: '3px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc, animation: 'pulse-dot 2s infinite' }} />
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: sc, fontSize: '0.75rem' }}>{energyState}</span>
        </div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>View: {preset.replace('_',' ')}</span>
      </div>

      {/* SVG connection lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        {[
          { x1: '20%', y1: '22%', x2: '50%', y2: '48%', color: '#F59E0B', active: solar.currentPower > 1 },
          { x1: '80%', y1: '22%', x2: '50%', y2: '48%', color: '#38BDF8', active: windPower > 0.3 },
          { x1: '50%', y1: '52%', x2: '20%', y2: '76%', color: '#6366F1', active: true },
          { x1: '50%', y1: '52%', x2: '80%', y2: '76%', color: '#8B5CF6', active: gridDependency > 5 },
          { x1: '50%', y1: '52%', x2: '35%', y2: '88%', color: '#3B82F6', active: totalLoad > 0 },
          { x1: '50%', y1: '52%', x2: '65%', y2: '88%', color: '#10B981', active: totalLoad > 0 },
        ].map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={l.active ? l.color : 'rgba(255,255,255,0.05)'}
            strokeWidth={l.active ? 1.5 : 1}
            strokeDasharray={l.active ? '5 4' : '2 6'}
            opacity={l.active ? 0.5 : 0.2}
          />
        ))}
      </svg>

      {/* Nodes */}
      <AssetNode id="solar"   x={20} y={22} label="Solar Farm" icon="☀️" value={solar.currentPower.toFixed(1)} unit="kW" color="var(--color-solar)" />
      <AssetNode id="wind"    x={80} y={22} label="Wind"       icon="💨" value={windPower.toFixed(1)}          unit="kW" color="var(--color-grid)" />
      <AssetNode id="hub"     x={50} y={50} label="Energy Hub" icon="⚡" value={((solar.currentPower + windPower)).toFixed(1)} unit="kW" color="var(--color-primary)" size={90} />
      <AssetNode id="battery" x={20} y={76} label="Battery"    icon="🔋" value={battery.soc.toFixed(0)}        unit="%" color="var(--color-secondary)" />
      <AssetNode id="grid"    x={80} y={76} label="Grid"       icon="🏭" value={gridDependency.toFixed(0)}      unit="%" color="var(--color-accent)" />
      <AssetNode id="academic" x={35} y={90} label="Academic"  icon="🏛️" value={(totalLoad * 0.45).toFixed(1)}  unit="kW" color="var(--color-primary)" size={72} />
      <AssetNode id="hostel"   x={65} y={90} label="Hostel"    icon="🏠" value={(totalLoad * 0.3).toFixed(1)}   unit="kW" color="var(--color-primary)" size={72} />

      <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: '0.6rem', color: 'var(--text-muted)', zIndex: 10 }}>
        Campus Topology · Bhopal, India · Click nodes to inspect · All values SIMULATED
      </div>
    </div>
  );
}

// ── Asset detail panel ────────────────────────────────────────────────
function AssetDetail({ id }: { id: string }) {
  const info = ASSET_INFO[id];
  if (!info) return null;
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      style={{ padding: '10px 0' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: '1.8rem' }}>{info.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: info.color }}>{info.label}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{info.desc}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
export default function DigitalTwinPage() {
  const { solar, battery, totalLoad, windPower, buildings } = useEnergyStore();
  const [selectedPreset, setSelectedPreset] = useState<Preset>('AERIAL');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 'calc(100vh - 88px)' }}>
      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {presets.map(p => (
          <button key={p} onClick={() => setSelectedPreset(p)}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              background: selectedPreset === p ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedPreset === p ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: selectedPreset === p ? 'var(--color-primary)' : 'var(--text-secondary)',
              transition: 'all 0.18s',
            }}
          >{p.replace('_', ' ')}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div className="live-indicator"><div className="dot" />SIMULATED DEMO</div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12 }}>
        {/* Campus schematic */}
        <GlassCard style={{ position: 'relative', overflow: 'hidden' }} padding={12}>
          <CampusSchematic selected={selectedAsset} onSelect={setSelectedAsset} preset={selectedPreset} />
        </GlassCard>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }} className="styled-scroll">
          <KPICard label="Solar Farm"  value={solar.currentPower} unit="kW" color="var(--color-solar)"     icon={<Sun size={13} />} small />
          <KPICard label="Wind Power"  value={windPower}          unit="kW" color="var(--color-grid)"      icon={<Wind size={13} />} small />
          <KPICard label="Battery"     value={battery.soc}        unit="%"  color="var(--color-secondary)" icon={<Cpu size={13} />} small />
          <KPICard label="Total Load"  value={totalLoad}          unit="kW" icon={<BarChart2 size={13} />} small />

          {selectedAsset && (
            <GlassCard padding="12px 14px">
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Asset Inspector</div>
              <AssetDetail id={selectedAsset} />
            </GlassCard>
          )}

          <GlassCard padding="12px 14px">
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Building Status</div>
            {buildings.map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', color: b.status === 'ANOMALY' ? 'var(--color-critical)' : 'var(--text-secondary)' }}>{b.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${(b.currentLoad / b.peakLoad) * 100}%`, background: b.status === 'ANOMALY' ? 'var(--color-critical)' : 'var(--color-primary)', borderRadius: 2, transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'Space Grotesk', fontWeight: 600 }}>{b.currentLoad.toFixed(1)} kW</span>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
