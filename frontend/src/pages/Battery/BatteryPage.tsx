import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import LiveBatteryChart from '../../components/charts/LiveBatteryChart';
import { Battery, Thermometer, Clock, Zap } from 'lucide-react';

export default function BatteryPage() {
  const { battery, batteryHistory, optimizationDecision } = useEnergyStore();

  const gaugeOption = useMemo(() => ({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 220, endAngle: -40, min: 0, max: 100,
      pointer: { itemStyle: { color: battery.soc > 50 ? '#20D67B' : battery.soc > 25 ? '#FFB84D' : '#FF5A5A' } },
      axisLine: { lineStyle: { width: 14, color: [[0.2, '#FF5A5A'], [0.5, '#FFB84D'], [1, '#20D67B']] } },
      axisTick: { show: false },
      splitLine: { length: 10, lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      axisLabel: { color: '#91AAA2', fontSize: 11 },
      detail: {
        valueAnimation: true,
        formatter: '{value}%\nSOC',
        color: battery.soc > 50 ? '#20D67B' : battery.soc > 25 ? '#FFB84D' : '#FF5A5A',
        fontSize: 20, fontFamily: 'Space Grotesk', fontWeight: 700,
        offsetCenter: [0, '40%'],
      },
      data: [{ value: battery.soc, name: '' }],
    }],
  }), [battery.soc]);

  const actionColor = battery.chargingAction === 'CHARGING' ? 'var(--color-primary)' : battery.chargingAction === 'DISCHARGING' ? 'var(--color-solar)' : 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Battery size={20} color="var(--color-primary)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>Battery Intelligence</h2>
        <div className="live-indicator"><div className="dot" />SIMULATED</div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPICard label="SOC" value={battery.soc} unit="%" color={battery.soc > 50 ? 'var(--color-primary)' : 'var(--color-solar)'} />
        <KPICard label="SOH" value={battery.soh} unit="%" />
        <KPICard label="Temperature" value={battery.temperature} unit="°C" status={battery.temperature > 38 ? 'warning' : 'normal'} icon={<Thermometer size={13} />} />
        <KPICard label="Voltage" value={battery.voltage} unit="V" />
        <KPICard label="Backup Time" value={battery.projectedBackupHours} unit="hrs" color="var(--color-secondary)" icon={<Clock size={13} />} />
        <KPICard label="Cycle Count" value={battery.cycleCount} unit="cycles" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14 }}>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ReactECharts option={gaugeOption} style={{ height: 220, width: '100%' }} notMerge />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Action</div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: actionColor }}>
              {battery.chargingAction}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {battery.chargingAction === 'CHARGING' ? 'Absorbing solar surplus' : battery.chargingAction === 'DISCHARGING' ? 'Supporting campus load' : 'System balanced — hold'}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>SOC HISTORY (SIMULATED)</div>
          <LiveBatteryChart height={200} />
        </GlassCard>
      </div>

      {optimizationDecision && (
        <GlassCard glow="primary">
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>AI Optimization Decision</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>{optimizationDecision.action}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 12 }}>Confidence: {optimizationDecision.confidence}%</span>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{optimizationDecision.reason}</p>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {optimizationDecision.inputs.map((inp, i) => (
              <span key={i} style={{ background: 'rgba(32,214,123,0.08)', border: '1px solid rgba(32,214,123,0.15)', borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', color: 'var(--color-primary)' }}>
                {inp}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            📊 Expected Impact: {optimizationDecision.expectedImpact}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
