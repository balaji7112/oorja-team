import React, { useMemo } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import { FileText, Thermometer, Wind, Droplets, Cloud, Sun, Battery, Zap, Leaf, AlertTriangle } from 'lucide-react';
import { useEnergyStore } from '../../store/energyStore';

const conditionLabel: Record<string, string> = {
  SUNNY: 'Sunny', PARTLY_CLOUDY: 'Partly Cloudy', CLOUDY: 'Cloudy', RAIN: 'Rainy', NIGHT: 'Clear Night',
};
const conditionIcon: Record<string, string> = {
  SUNNY: '☀️', PARTLY_CLOUDY: '⛅', CLOUDY: '☁️', RAIN: '🌧️', NIGHT: '🌙',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: 'var(--text-muted)',
      paddingBottom: 8, marginBottom: 12,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {children}
    </div>
  );
}

function DataRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Space Grotesk' }}>{value}</span>
        {note && <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{note}</span>}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const weather = useEnergyStore(s => s.weather);
  const solar = useEnergyStore(s => s.solar);
  const battery = useEnergyStore(s => s.battery);
  const totalLoad = useEnergyStore(s => s.totalLoad);
  const renewableShare = useEnergyStore(s => s.renewableShare);
  const gridDependency = useEnergyStore(s => s.gridDependency);
  const gridImport = useEnergyStore(s => s.gridImport);
  const co2Avoided = useEnergyStore(s => s.co2Avoided);
  const dailyCo2Avoided = useEnergyStore(s => s.dailyCo2Avoided);
  const estimatedCostSaving = useEnergyStore(s => s.estimatedCostSaving);
  const windPower = useEnergyStore(s => s.windPower);
  const solarForecast = useEnergyStore(s => s.solarForecast);
  const anomalies = useEnergyStore(s => s.anomalies);
  const oorjaSyncScore = useEnergyStore(s => s.oorjaSyncScore);

  const now = useMemo(() => new Date(), []);
  const generatedAt = useMemo(() => now.toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }), [now]);

  // Weather insights — computed from live data
  const insights = useMemo(() => {
    const list: { icon: string; text: string; severity: 'normal' | 'warn' | 'ok' }[] = [];
    if (weather.cloudCover > 0.5) list.push({ icon: '☁️', text: `High cloud cover (${Math.round(weather.cloudCover * 100)}%) is reducing solar output. Battery or grid support recommended.`, severity: 'warn' });
    if (weather.rainProbability > 50) list.push({ icon: '🌧️', text: `Rain probability ${weather.rainProbability}% — natural panel washing expected. Defer manual cleaning.`, severity: 'warn' });
    if (weather.windSpeed > 7) list.push({ icon: '💨', text: `Wind speed ${weather.windSpeed.toFixed(1)} m/s — wind generation near peak efficiency.`, severity: 'ok' });
    if (weather.temperature > 38) list.push({ icon: '🌡️', text: `High ambient temperature (${weather.temperature}°C) — expect solar panel derating. Monitor battery thermals.`, severity: 'warn' });
    if (weather.uvIndex >= 7) list.push({ icon: '☀️', text: `UV Index ${weather.uvIndex} — excellent solar irradiance for peak generation.`, severity: 'ok' });
    if (weather.cloudCover < 0.2 && weather.rainProbability < 20) list.push({ icon: '✅', text: 'Clear sky conditions — ideal for EV charging and high-load scheduling during solar peak.', severity: 'ok' });
    if (list.length === 0) list.push({ icon: '✅', text: 'Weather conditions are nominal. No special advisories at this time.', severity: 'ok' });
    return list;
  }, [weather]);

  // Recommendations based on live data
  const recommendations = useMemo(() => {
    const list: string[] = [];
    if (battery.soc < 40) list.push('Battery SOC is below 40% — increase charging priority using available solar surplus.');
    if (battery.soc > 90 && solar.currentPower > totalLoad) list.push('Battery is near full. Consider exporting excess solar to grid or deferring charging.');
    if (weather.cloudCover > 0.4) list.push('Cloud cover detected — pre-charge battery storage before cloud peak for uninterrupted supply.');
    if (weather.rainProbability > 40) list.push('Defer panel cleaning until after rainfall for a natural washing effect.');
    if (weather.temperature > 35) list.push('Activate battery thermal management. Limit charge rate to reduce internal heating.');
    if (gridDependency > 30) list.push('Grid dependency above 30% — review load scheduling to maximize self-consumption.');
    list.push('Schedule high-energy loads (Computer Lab, EV charging) during forecast solar peak hours.');
    if (anomalies.length > 0) list.push(`${anomalies.length} active anomaly${anomalies.length > 1 ? 'ies' : ''} detected — review Anomalies section for details.`);
    return list.slice(0, 5);
  }, [battery, solar, weather, gridDependency, totalLoad, anomalies]);

  // Next 6-hour solar outlook from forecast
  const forecastPeak = useMemo(() => {
    if (!solarForecast.length) return null;
    const next6 = solarForecast.slice(0, 6);
    const peak = Math.max(...next6.map(p => p.predicted));
    const peakPoint = next6.find(p => p.predicted === peak);
    return peakPoint ? { kw: peak.toFixed(1), time: new Date(peakPoint.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) } : null;
  }, [solarForecast]);

  const energyState = solar.currentPower > totalLoad ? 'SURPLUS' : solar.currentPower < totalLoad * 0.5 ? 'DEFICIT' : 'BALANCED';
  const stateColor = energyState === 'SURPLUS' ? 'var(--color-primary)' : energyState === 'DEFICIT' ? 'var(--color-critical)' : 'var(--color-solar)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileText size={20} color="var(--color-secondary)" />
          <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>
            Energy &amp; Weather Report
          </h2>
          <div className="live-indicator"><div className="dot" />LIVE</div>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          <div>Bhopal, Madhya Pradesh · 23.25°N</div>
          <div style={{ marginTop: 2 }}>Updated: {generatedAt}</div>
        </div>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPICard label="Solar Output" value={solar.currentPower} unit="kW" color="var(--color-solar)" icon={<Sun size={13} />} />
        <KPICard label="Battery SOC" value={battery.soc} unit="%" color="var(--color-primary)" icon={<Battery size={13} />} />
        <KPICard label="Total Load" value={totalLoad} unit="kW" icon={<Zap size={13} />} />
        <KPICard label="Renewable Share" value={renewableShare} unit="%" color="var(--color-primary)" />
        <KPICard label="CO₂ Avoided" value={dailyCo2Avoided.toFixed(1)} unit="kg" color="var(--color-primary)" icon={<Leaf size={13} />} />
        <KPICard label="Est. Saving" value={`₹${estimatedCostSaving.toLocaleString()}`} unit="" color="var(--color-solar)" />
      </div>

      {/* ── Two-column: Weather + Energy ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Weather Summary */}
        <GlassCard>
          <SectionTitle>Weather Summary</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ fontSize: '2.8rem' }}>{conditionIcon[weather.condition] || '☀️'}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{conditionLabel[weather.condition] || weather.condition.replace('_', ' ')}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Bhopal, India</div>
            </div>
          </div>
          <DataRow label="Temperature" value={`${weather.temperature}°C`} />
          <DataRow label="Humidity" value={`${weather.humidity}%`} />
          <DataRow label="Wind Speed" value={`${weather.windSpeed.toFixed(1)} m/s`} />
          <DataRow label="Cloud Cover" value={`${Math.round(weather.cloudCover * 100)}%`} />
          <DataRow label="Rain Probability" value={`${weather.rainProbability}%`} />
          <DataRow label="UV Index" value={`${weather.uvIndex}`} />
          <DataRow label="Solar Irradiance" value={`${weather.solarIrradiance} W/m²`} />
          <DataRow label="Solar Impact" value={`${weather.solarImpact > 0 ? '+' : ''}${weather.solarImpact}%`} note="ESTIMATED" />
        </GlassCard>

        {/* Energy Status */}
        <GlassCard>
          <SectionTitle>Energy Status</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.4rem', color: stateColor }}>{energyState}</div>
            <span style={{ fontSize: '0.7rem', background: `${stateColor}15`, border: `1px solid ${stateColor}30`, borderRadius: 20, padding: '2px 10px', color: stateColor }}>
              {energyState === 'SURPLUS' ? 'Exporting / Charging' : energyState === 'DEFICIT' ? 'Grid / Battery Draw' : 'Self-Sufficient'}
            </span>
          </div>
          <DataRow label="Solar Generation" value={`${solar.currentPower.toFixed(1)} kW`} />
          <DataRow label="Wind Power" value={`${windPower.toFixed(1)} kW`} />
          <DataRow label="Total Renewable" value={`${(solar.currentPower + windPower).toFixed(1)} kW`} />
          <DataRow label="Grid Import" value={`${gridImport.toFixed(1)} kW`} note={`${gridDependency.toFixed(0)}% dependency`} />
          <DataRow label="Battery Action" value={battery.chargingAction} />
          <DataRow label="Battery Temperature" value={`${battery.temperature.toFixed(1)}°C`} />
          <DataRow label="Backup Hours" value={`${battery.projectedBackupHours.toFixed(1)} hrs`} />
          {forecastPeak && <DataRow label="Forecast Solar Peak" value={`${forecastPeak.kw} kW @ ${forecastPeak.time}`} note="PROJECTED" />}
        </GlassCard>
      </div>

      {/* ── Forecast Summary ─────────────────────────────────────── */}
      {solarForecast.length > 0 && (
        <GlassCard>
          <SectionTitle>Forecast Summary — Next 6 Periods</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
            {solarForecast.slice(0, 6).map((p, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px',
                textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  {new Date(p.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: 'var(--color-solar)' }}>
                  {p.predicted.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>kW</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  ±{((p.upper - p.lower) / 2).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 10 }}>
            Solar generation forecast · ± values represent 95% confidence interval half-width
          </div>
        </GlassCard>
      )}

      {/* ── Oorja Score ──────────────────────────────────────────── */}
      <GlassCard>
        <SectionTitle>OORJA Sync Score</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          {[
            { label: 'Overall Score', value: oorjaSyncScore.total, color: 'var(--color-primary)' },
            { label: 'Renewable Util.', value: oorjaSyncScore.renewableUtilization, color: 'var(--color-primary)' },
            { label: 'Storage Efficiency', value: oorjaSyncScore.storageEfficiency, color: 'var(--color-secondary)' },
            { label: 'Load Optimization', value: oorjaSyncScore.loadOptimization, color: 'var(--color-solar)' },
            { label: 'Grid Reduction', value: oorjaSyncScore.gridReduction, color: 'var(--color-primary)' },
            { label: 'Carbon Performance', value: oorjaSyncScore.carbonPerformance, color: 'var(--color-primary)' },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem', color: item.color }}>
                {item.value.toFixed(0)}<span style={{ fontSize: '0.7rem', fontWeight: 400 }}>/100</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 6 }}>
                <div style={{ height: '100%', width: `${item.value}%`, background: item.color, borderRadius: 2, transition: 'width 1s' }} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Weather Insights ─────────────────────────────────────── */}
      <GlassCard>
        <SectionTitle>Weather Insights</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insights.map((ins, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              background: ins.severity === 'warn' ? 'rgba(255,184,77,0.05)' : 'rgba(32,214,123,0.05)',
              borderLeft: `3px solid ${ins.severity === 'warn' ? 'var(--color-solar)' : 'var(--color-primary)'}`,
              padding: '9px 12px', borderRadius: '0 8px 8px 0',
              fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-secondary)',
            }}>
              <span style={{ flexShrink: 0 }}>{ins.icon}</span>
              <span>{ins.text}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Recommendations ──────────────────────────────────────── */}
      <GlassCard>
        <SectionTitle>Recommendations</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recommendations.map((rec, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              padding: '9px 12px', borderRadius: 8,
              fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-secondary)',
            }}>
              <span style={{
                background: 'var(--color-primary)', color: '#07110F',
                fontWeight: 700, fontSize: '0.65rem', width: 18, height: 18,
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, marginTop: 1,
              }}>{i + 1}</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Active Anomalies ─────────────────────────────────────── */}
      {anomalies.length > 0 && (
        <GlassCard glow="critical">
          <SectionTitle>Active Anomalies ({anomalies.length})</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {anomalies.map(a => (
              <div key={a.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255,90,90,0.05)', border: '1px solid rgba(255,90,90,0.15)',
                padding: '8px 12px', borderRadius: 8,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{a.asset}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{a.possibleCause}</div>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-critical)', background: 'rgba(255,90,90,0.12)', borderRadius: 20, padding: '2px 8px' }}>
                  {a.severity}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ── Footer Note ──────────────────────────────────────────── */}
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: 8 }}>
        Report generated from live simulation data · OORJA SYNC · {generatedAt}
      </div>

    </div>
  );
}
