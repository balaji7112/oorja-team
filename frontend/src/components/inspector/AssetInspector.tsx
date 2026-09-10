import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { useEnergyStore } from '../../store/energyStore';
import { X, Zap, Sun, Battery, Building } from 'lucide-react';
import { motion } from 'framer-motion';

const ASSET_INFO: Record<string, { icon: React.ReactNode; color: string }> = {
  SOLAR_FARM: { icon: <Sun size={16} />, color: 'var(--color-solar)' },
  BATTERY: { icon: <Battery size={16} />, color: 'var(--color-primary)' },
  WIND_TURBINE: { icon: <Zap size={16} />, color: 'var(--color-secondary)' },
  ACADEMIC: { icon: <Building size={16} />, color: 'var(--color-grid)' },
  COMPUTER_LAB: { icon: <Building size={16} />, color: 'var(--color-grid)' },
  LIBRARY: { icon: <Building size={16} />, color: 'var(--color-grid)' },
  HOSTEL: { icon: <Building size={16} />, color: 'var(--color-grid)' },
  CANTEEN: { icon: <Building size={16} />, color: 'var(--color-grid)' },
  EV_CHARGING: { icon: <Zap size={16} />, color: 'var(--color-secondary)' },
};

export default function AssetInspector() {
  const inspectorAsset = useUIStore(s => s.inspectorAsset);
  const setInspectorAsset = useUIStore(s => s.setInspectorAsset);
  const { solar, battery, buildings, windPower, weather } = useEnergyStore();

  if (!inspectorAsset) return null;

  const info = ASSET_INFO[inspectorAsset] || { icon: <Zap size={16} />, color: 'var(--text-primary)' };

  const getContent = () => {
    if (inspectorAsset === 'SOLAR_FARM') {
      return [
        { label: 'Power Output', value: `${solar.currentPower.toFixed(1)} kW`, note: 'SIMULATED' },
        { label: 'Irradiance', value: `${solar.irradiance} W/m²`, note: 'ESTIMATED' },
        { label: 'Efficiency', value: `${solar.efficiency.toFixed(1)}%` },
        { label: 'Temperature', value: `${solar.temperature}°C` },
        { label: 'Daily Generation', value: `${solar.dailyGeneration.toFixed(1)} kWh`, note: 'SIMULATED' },
        { label: 'Panel Count', value: `${solar.panelCount}` },
        { label: 'Health Score', value: `${solar.healthScore}/100` },
      ];
    }
    if (inspectorAsset === 'BATTERY') {
      return [
        { label: 'State of Charge', value: `${battery.soc.toFixed(1)}%` },
        { label: 'State of Health', value: `${battery.soh}%` },
        { label: 'Temperature', value: `${battery.temperature.toFixed(1)}°C`, note: battery.temperature > 38 ? '⚠ HIGH' : '' },
        { label: 'Action', value: battery.chargingAction },
        { label: 'Backup Hours', value: `${battery.projectedBackupHours.toFixed(1)} hrs`, note: 'PROJECTED' },
        { label: 'Cycle Count', value: `${battery.cycleCount}` },
      ];
    }
    if (inspectorAsset === 'WIND_TURBINE') {
      return [
        { label: 'Power Output', value: `${windPower.toFixed(1)} kW`, note: 'SIMULATED' },
        { label: 'Wind Speed', value: `${weather.windSpeed.toFixed(1)} m/s` },
      ];
    }
    const building = buildings.find(b => b.id === inspectorAsset);
    if (building) {
      return [
        { label: 'Current Load', value: `${building.currentLoad.toFixed(1)} kW`, note: 'SIMULATED' },
        { label: 'Peak Load', value: `${building.peakLoad.toFixed(1)} kW` },
        { label: 'Renewable Share', value: `${building.renewableShare}%` },
        { label: 'Status', value: building.status, note: building.status === 'ANOMALY' ? '⚠' : '' },
        { label: 'Health Score', value: `${building.healthScore}/100` },
      ];
    }
    return [];
  };

  const items = getContent();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 20,
        background: 'rgba(9,20,17,0.95)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(32,214,123,0.2)', borderRadius: 10,
        padding: '12px 14px', minWidth: 200,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: info.color }}>
          {info.icon}
          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{inspectorAsset.replace(/_/g, ' ')}</span>
        </div>
        <button onClick={() => setInspectorAsset(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={13} />
        </button>
      </div>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
            {item.note && <span style={{ fontSize: '0.6rem', color: item.note.includes('⚠') ? 'var(--color-critical)' : 'var(--text-muted)', letterSpacing: '0.04em' }}>{item.note}</span>}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
