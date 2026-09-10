import React from 'react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import { Cloud, Thermometer, Wind, Droplets } from 'lucide-react';

const conditionIcon: Record<string, string> = { SUNNY: '☀', PARTLY_CLOUDY: '⛅', CLOUDY: '☁', RAIN: '🌧', NIGHT: '🌙' };

export default function WeatherPage() {
  const { weather, solar } = useEnergyStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Cloud size={20} color="var(--color-secondary)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>Weather Intelligence</h2>
        <div className="status-demo">DEMO SIMULATOR</div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPICard label="Temperature" value={weather.temperature} unit="°C" icon={<Thermometer size={13} />} />
        <KPICard label="Wind Speed" value={weather.windSpeed} unit="m/s" icon={<Wind size={13} />} color="var(--color-secondary)" />
        <KPICard label="Cloud Cover" value={Math.round(weather.cloudCover * 100)} unit="%" icon={<Cloud size={13} />} />
        <KPICard label="Humidity" value={weather.humidity} unit="%" icon={<Droplets size={13} />} />
        <KPICard label="UV Index" value={weather.uvIndex} unit="" />
        <KPICard label="Rain Probability" value={weather.rainProbability} unit="%" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32 }}>
          <div style={{ fontSize: '5rem', marginBottom: 12 }}>{conditionIcon[weather.condition] || '☀'}</div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 700 }}>{weather.condition.replace('_', ' ')}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Bhopal, Madhya Pradesh, India · 23.25°N</div>
          <div style={{ marginTop: 12, padding: '8px 16px', background: weather.solarImpact < 0 ? 'rgba(255,90,90,0.08)' : 'rgba(32,214,123,0.08)', border: `1px solid ${weather.solarImpact < 0 ? 'rgba(255,90,90,0.2)' : 'rgba(32,214,123,0.2)'}`, borderRadius: 8, fontSize: '0.8rem', color: weather.solarImpact < 0 ? 'var(--color-critical)' : 'var(--color-primary)' }}>
            Solar Impact: {weather.solarImpact > 0 ? '+' : ''}{weather.solarImpact}% <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>ESTIMATED</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 14 }}>SOLAR ENERGY FACTORS</div>
          {[
            { label: 'Irradiance', value: `${weather.solarIrradiance} W/m²`, bar: weather.solarIrradiance / 1000, color: 'var(--color-solar)' },
            { label: 'Cloud Attenuation', value: `${Math.round(weather.cloudCover * 100)}%`, bar: weather.cloudCover, color: 'var(--color-critical)' },
            { label: 'Temperature Derating', value: `${Math.max(0, weather.temperature - 25) * 0.4}%`, bar: Math.max(0, weather.temperature - 25) / 20, color: 'var(--color-solar)' },
            { label: 'Rain Probability', value: `${weather.rainProbability}%`, bar: weather.rainProbability / 100, color: 'var(--color-grid)' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{item.value}</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${Math.min(100, item.bar * 100)}%`, background: item.color, borderRadius: 3, transition: 'width 1s' }} />
              </div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}
