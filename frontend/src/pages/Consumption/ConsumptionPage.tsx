import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import LiveLoadChart from '../../components/charts/LiveLoadChart';
import { BarChart3 } from 'lucide-react';

export default function ConsumptionPage() {
  const { buildings, totalLoad, renewableShare } = useEnergyStore();

  const barOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 8, right: 8, bottom: 40, left: 80, containLabel: false },
    xAxis: { type: 'value', axisLabel: { color: '#91AAA2', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    yAxis: { type: 'category', data: buildings.map(b => b.name), axisLabel: { color: '#91AAA2', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } } },
    series: [
      {
        type: 'bar', name: 'Current Load',
        data: buildings.map(b => b.currentLoad),
        itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#20D67B' }, { offset: 1, color: '#27D7D0' }] }, borderRadius: 4 },
      },
      {
        type: 'bar', name: 'Peak Capacity',
        data: buildings.map(b => b.peakLoad),
        itemStyle: { color: 'rgba(255,255,255,0.06)', borderRadius: 4 },
      },
    ],
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(9,20,17,0.95)', textStyle: { color: '#F4FAF7', fontSize: 11 } },
    legend: { data: ['Current Load', 'Peak Capacity'], textStyle: { color: '#91AAA2', fontSize: 10 }, top: 'auto', bottom: 4 },
  }), [buildings]);

  const pieOption = useMemo(() => ({
    backgroundColor: 'transparent',
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'],
      data: buildings.map(b => ({ name: b.name, value: b.currentLoad })),
      label: { color: '#91AAA2', fontSize: 10 },
      itemStyle: { borderColor: '#0B1715', borderWidth: 2 },
    }],
    tooltip: { trigger: 'item', backgroundColor: 'rgba(9,20,17,0.95)', textStyle: { color: '#F4FAF7', fontSize: 11 } },
  }), [buildings]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <BarChart3 size={20} color="var(--color-primary)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>Consumption Analysis</h2>
        <div className="live-indicator"><div className="dot" />SIMULATED</div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPICard label="Total Campus Load" value={totalLoad} unit="kW" />
        <KPICard label="Renewable Share" value={renewableShare} unit="%" color="var(--color-primary)" />
        {buildings.map(b => <KPICard key={b.id} label={b.name} value={b.currentLoad} unit="kW" small status={b.status === 'ANOMALY' ? 'critical' : b.status === 'PEAK' ? 'warning' : 'normal'} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <GlassCard>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>BUILDING LOAD BREAKDOWN (kW) — ESTIMATED</div>
          <ReactECharts option={barOption} style={{ height: 260 }} notMerge />
        </GlassCard>
        <GlassCard>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>LOAD DISTRIBUTION — ESTIMATED</div>
          <ReactECharts option={pieOption} style={{ height: 260 }} notMerge />
        </GlassCard>
      </div>
      <GlassCard>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>LIVE CAMPUS LOAD TREND</div>
        <LiveLoadChart height={150} />
      </GlassCard>
    </div>
  );
}
