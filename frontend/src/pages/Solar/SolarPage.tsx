import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import LiveSolarChart from '../../components/charts/LiveSolarChart';
import { Sun, Thermometer, Zap, Activity } from 'lucide-react';

export default function SolarPage() {
  const { solar, weather, solarForecast, solarHistory } = useEnergyStore();

  const forecastOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 16, right: 16, bottom: 24, left: 48, containLabel: false },
    xAxis: {
      type: 'category',
      data: solarForecast.map(p => new Date(p.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })),
      axisLabel: { color: '#91AAA2', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    },
    yAxis: {
      type: 'value', min: 0, max: 30,
      axisLabel: { color: '#91AAA2', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
    },
    series: [
      {
        type: 'line', name: 'Predicted',
        data: solarForecast.map(p => p.predicted),
        smooth: true, symbol: 'none',
        lineStyle: { color: '#FFB84D', width: 2 },
        areaStyle: { color: 'rgba(255,184,77,0.08)' },
        markLine: {
          symbol: 'none',
          data: [{ xAxis: solarForecast.findIndex(p => !p.actual), label: { formatter: 'Forecast →', color: '#91AAA2' }, lineStyle: { color: 'rgba(255,255,255,0.15)', type: 'dashed' } }],
        },
      },
      {
        type: 'line', name: 'Lower', data: solarForecast.map(p => p.lower),
        smooth: true, symbol: 'none', lineStyle: { color: 'rgba(255,184,77,0.3)', width: 1, type: 'dashed' },
      },
      {
        type: 'line', name: 'Upper', data: solarForecast.map(p => p.upper),
        smooth: true, symbol: 'none', lineStyle: { color: 'rgba(255,184,77,0.3)', width: 1, type: 'dashed' },
        areaStyle: { color: 'rgba(255,184,77,0.04)', origin: 'start' },
      },
      {
        type: 'line', name: 'Actual', data: solarForecast.map(p => p.actual ?? null),
        smooth: true, symbol: 'circle', symbolSize: 4,
        lineStyle: { color: '#20D67B', width: 2 },
      },
    ],
    legend: { data: ['Predicted', 'Actual'], textStyle: { color: '#91AAA2', fontSize: 11 }, right: 16, top: 0 },
    tooltip: {
      trigger: 'axis', backgroundColor: 'rgba(9,20,17,0.95)', borderColor: 'rgba(255,184,77,0.3)',
      textStyle: { color: '#F4FAF7', fontSize: 11 },
      formatter: (params: any) => params.map((p: any) => `${p.seriesName}: ${p.value?.toFixed(2) || '—'} kW`).join('<br/>') + '<br/><i style="color:#666;font-size:10px">PROJECTED</i>',
    },
  }), [solarForecast]);

  const panelHealthOption = useMemo(() => ({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 200, endAngle: -20, min: 0, max: 100,
      splitNumber: 4,
      pointer: { itemStyle: { color: '#FFB84D' } },
      axisLine: { lineStyle: { width: 12, color: [[0.3, '#FF5A5A'], [0.6, '#FFB84D'], [1, '#20D67B']] } },
      axisTick: { show: false },
      splitLine: { length: 8, lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      axisLabel: { color: '#91AAA2', fontSize: 10 },
      title: { color: '#91AAA2', fontSize: 12 },
      detail: {
        valueAnimation: true,
        formatter: '{value}',
        color: '#FFB84D', fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 700,
        offsetCenter: [0, '35%'],
      },
      data: [{ value: solar.healthScore, name: 'Health Score' }],
    }],
  }), [solar.healthScore]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Sun size={20} color="var(--color-solar)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>Solar Intelligence</h2>
        <div className="live-indicator"><div className="dot" />SIMULATED</div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPICard label="Generation" value={solar.currentPower} unit="kW" color="var(--color-solar)" icon={<Sun size={13} />} />
        <KPICard label="Irradiance" value={solar.irradiance} unit="W/m²" icon={<Zap size={13} />} />
        <KPICard label="Efficiency" value={solar.efficiency} unit="%" icon={<Activity size={13} />} />
        <KPICard label="Panel Temp" value={solar.temperature} unit="°C" icon={<Thermometer size={13} />} status={solar.temperature > 50 ? 'warning' : 'normal'} />
        <KPICard label="Daily Total" value={solar.dailyGeneration} unit="kWh" color="var(--color-solar)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 14 }}>
        <GlassCard>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>AI SOLAR FORECAST — PROJECTED · RandomForest R²: 0.9983</div>
          <ReactECharts option={forecastOption} style={{ height: 280 }} notMerge />
        </GlassCard>
        <GlassCard>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>PANEL HEALTH</div>
          <ReactECharts option={panelHealthOption} style={{ height: 200 }} notMerge />
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{solar.panelCount} Panels · {solar.capacity} kWp</div>
          </div>
        </GlassCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <GlassCard>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>LIVE GENERATION HISTORY</div>
          <LiveSolarChart height={160} />
        </GlassCard>
        <GlassCard>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>WEATHER IMPACT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {[
              { label: 'Cloud Cover', value: `${Math.round(weather.cloudCover * 100)}%`, impact: weather.solarImpact },
              { label: 'UV Index', value: `${weather.uvIndex}`, impact: weather.uvIndex > 6 ? 8 : -5 },
              { label: 'Irradiance', value: `${weather.solarIrradiance} W/m²`, impact: weather.solarIrradiance > 600 ? 15 : -10 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.82rem', fontFamily: 'Space Grotesk', fontWeight: 600 }}>{item.value}</span>
                  <span style={{ fontSize: '0.7rem', color: item.impact >= 0 ? 'var(--color-primary)' : 'var(--color-critical)' }}>
                    {item.impact >= 0 ? '+' : ''}{item.impact}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
