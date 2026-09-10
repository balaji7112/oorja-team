import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import { Brain } from 'lucide-react';

export default function ForecastPage() {
  const { solarForecast, demandForecast } = useEnergyStore();

  const solarOpt = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 24, right: 16, bottom: 40, left: 50, containLabel: false },
    xAxis: { type: 'category', data: solarForecast.slice(0, 30).map(p => new Date(p.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })), axisLabel: { color: '#91AAA2', fontSize: 10, rotate: 30 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } } },
    yAxis: { type: 'value', name: 'kW', nameTextStyle: { color: '#91AAA2' }, min: 0, max: 30, axisLabel: { color: '#91AAA2', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    series: [
      { type: 'line', name: 'Predicted', data: solarForecast.slice(0, 30).map(p => p.predicted), smooth: true, symbol: 'none', lineStyle: { color: '#FFB84D', width: 2 }, areaStyle: { color: 'rgba(255,184,77,0.1)' } },
      { type: 'line', name: 'Lower 95%', data: solarForecast.slice(0, 30).map(p => p.lower), smooth: true, symbol: 'none', lineStyle: { color: 'rgba(255,184,77,0.3)', width: 1, type: 'dashed' } },
      { type: 'line', name: 'Upper 95%', data: solarForecast.slice(0, 30).map(p => p.upper), smooth: true, symbol: 'none', lineStyle: { color: 'rgba(255,184,77,0.3)', width: 1, type: 'dashed' } },
      { type: 'line', name: 'Actual', data: solarForecast.slice(0, 30).map(p => p.actual ?? null), smooth: true, symbolSize: 4, lineStyle: { color: '#20D67B', width: 2 } },
    ],
    legend: { data: ['Predicted', 'Actual', 'Lower 95%', 'Upper 95%'], textStyle: { color: '#91AAA2', fontSize: 10 } },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(9,20,17,0.95)', textStyle: { color: '#F4FAF7', fontSize: 11 } },
  }), [solarForecast]);

  const demandOpt = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 24, right: 16, bottom: 40, left: 50, containLabel: false },
    xAxis: { type: 'category', data: demandForecast.slice(0, 30).map(p => new Date(p.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })), axisLabel: { color: '#91AAA2', fontSize: 10, rotate: 30 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } } },
    yAxis: { type: 'value', name: 'kW', nameTextStyle: { color: '#91AAA2' }, min: 0, max: 25, axisLabel: { color: '#91AAA2', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    series: [
      { type: 'line', name: 'Predicted', data: demandForecast.slice(0, 30).map(p => p.predicted), smooth: true, symbol: 'none', lineStyle: { color: '#27D7D0', width: 2 }, areaStyle: { color: 'rgba(39,215,208,0.08)' } },
      { type: 'line', name: 'Lower 95%', data: demandForecast.slice(0, 30).map(p => p.lower), smooth: true, symbol: 'none', lineStyle: { color: 'rgba(39,215,208,0.3)', width: 1, type: 'dashed' } },
      { type: 'line', name: 'Upper 95%', data: demandForecast.slice(0, 30).map(p => p.upper), smooth: true, symbol: 'none', lineStyle: { color: 'rgba(39,215,208,0.3)', width: 1, type: 'dashed' } },
    ],
    legend: { data: ['Predicted', 'Lower 95%', 'Upper 95%'], textStyle: { color: '#91AAA2', fontSize: 10 } },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(9,20,17,0.95)', textStyle: { color: '#F4FAF7', fontSize: 11 } },
  }), [demandForecast]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Brain size={20} color="var(--color-secondary)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>AI Forecast Engine</h2>
        <div className="live-indicator"><div className="dot" />PROJECTED</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <GlassCard>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8 }}>SOLAR FORECAST · RandomForestRegressor · MAE: 0.04 kW · R²: 0.998 · 30-HOUR WINDOW</div>
          <ReactECharts option={solarOpt} style={{ height: 300 }} notMerge />
        </GlassCard>
        <GlassCard>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8 }}>DEMAND FORECAST · HistGradientBoosting · MAE: 0.41 kW · R²: 0.994 · 30-HOUR WINDOW</div>
          <ReactECharts option={demandOpt} style={{ height: 300 }} notMerge />
        </GlassCard>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { model: 'Solar Forecast', algo: 'RandomForestRegressor', mae: '0.04 kW', r2: '0.9983', features: 'Hour, Cloud Cover, Temp, Irradiance, Season' },
          { model: 'Demand Forecast', algo: 'HistGradientBoosting', mae: '0.41 kW', r2: '0.9937', features: 'Hour, Day, Building Type, Academic Calendar' },
          { model: 'Anomaly Detection', algo: 'IsolationForest + Rules', mae: '—', r2: '—', features: 'Power delta, Z-score, Temporal patterns' },
        ].map(m => (
          <GlassCard key={m.model}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: 'var(--color-secondary)' }}>{m.model}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Algorithm</span><span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{m.algo}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MAE</span><span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-primary)' }}>{m.mae}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>R²</span><span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-primary)' }}>{m.r2}</span></div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>Features: {m.features}</div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
