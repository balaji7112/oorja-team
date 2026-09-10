import React, { useMemo, useState, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEnergyStore } from '../../store/energyStore';
import type { WeatherData, SolarData, ForecastPoint } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import { Cloud, Thermometer, Wind, Droplets, FileText, Loader } from 'lucide-react';

const conditionIcon: Record<string, string> = {
  SUNNY: '☀️', PARTLY_CLOUDY: '⛅', CLOUDY: '☁️', RAIN: '🌧️', NIGHT: '🌙',
};

const conditionLabel: Record<string, string> = {
  SUNNY: 'Sunny', PARTLY_CLOUDY: 'Partly Cloudy', CLOUDY: 'Cloudy', RAIN: 'Rainy', NIGHT: 'Clear Night',
};

// ── Report Generator ─────────────────────────────────────────────────────────
interface ReportData {
  weather: WeatherData;
  solar: SolarData;
  solarForecast: ForecastPoint[];
  demandForecast: ForecastPoint[];
}

function buildReportHTML(data: ReportData): string {
  const { weather, solar, solarForecast, demandForecast } = data;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Build forecast table rows (next 12 points)
  const forecastRows = solarForecast.slice(0, 12).map((p, i) => {
    const demand = demandForecast[i];
    const t = new Date(p.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const solarKW = p.predicted.toFixed(2);
    const demandKW = demand ? demand.predicted.toFixed(2) : '—';
    const lowerKW = p.lower.toFixed(2);
    const upperKW = p.upper.toFixed(2);
    const isActual = p.actual != null;
    return `
      <tr>
        <td>${t}</td>
        <td>${solarKW} kW</td>
        <td>${lowerKW} – ${upperKW} kW</td>
        <td>${demandKW} kW</td>
        <td><span class="badge ${isActual ? 'badge-actual' : 'badge-forecast'}">${isActual ? 'Measured' : 'Forecast'}</span></td>
      </tr>`;
  }).join('');

  // Weather insights
  const insights: string[] = [];
  if (weather.cloudCover > 0.5) insights.push(`☁️ High cloud cover (${Math.round(weather.cloudCover * 100)}%) — solar output is reduced significantly. Consider switching to battery or grid support.`);
  if (weather.rainProbability > 50) insights.push(`🌧️ Rain probability is ${weather.rainProbability}% — ensure drainage around panel arrays and secure outdoor equipment.`);
  if (weather.windSpeed > 7) insights.push(`💨 Wind speed is elevated at ${weather.windSpeed.toFixed(1)} m/s — wind turbine generation near peak efficiency.`);
  if (weather.temperature > 38) insights.push(`🌡️ High ambient temperature (${weather.temperature}°C) — expect solar panel derating of ~${((weather.temperature - 25) * 0.4).toFixed(1)}%. Monitor battery thermal management.`);
  if (weather.uvIndex >= 7) insights.push(`☀️ UV Index is ${weather.uvIndex} (High) — optimal solar irradiance conditions for peak generation.`);
  if (weather.cloudCover < 0.2 && weather.rainProbability < 20) insights.push(`✅ Excellent generation conditions — recommend scheduling EV charging and non-critical loads during solar peak hours.`);
  if (insights.length === 0) insights.push('✅ Weather conditions are nominal. No special advisories at this time.');

  // Recommendations
  const recs: string[] = [];
  if (weather.cloudCover > 0.4) recs.push('Pre-charge battery storage before cloud cover peaks to ensure uninterrupted campus supply.');
  if (weather.rainProbability > 40) recs.push('Defer panel cleaning operations until after rainfall to benefit from natural washing effect.');
  if (weather.temperature > 35) recs.push('Activate battery thermal management systems. Limit charge rate to reduce internal heating.');
  recs.push('Schedule high-energy loads (Computer Lab, EV charging) to coincide with the forecast solar peak window.');
  recs.push('Monitor grid import in real-time during cloud cover periods to avoid unplanned demand peaks.');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weather Forecast Report — OORJA SYNC</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fa;
      color: #1a2a22;
      padding: 0;
    }
    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }
      .page { box-shadow: none !important; }
    }
    .header {
      background: linear-gradient(135deg, #0d2418 0%, #143d25 100%);
      color: white;
      padding: 40px 48px 32px;
    }
    .header-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(32,214,123,0.15); border: 1px solid rgba(32,214,123,0.3);
      border-radius: 20px; padding: 4px 14px; font-size: 0.72rem;
      color: #20D67B; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; margin-bottom: 16px;
    }
    .header h1 {
      font-size: 2rem; font-weight: 800; letter-spacing: -0.02em;
      color: #f4faf7; margin-bottom: 6px;
    }
    .header .sub {
      font-size: 0.92rem; color: rgba(244,250,247,0.6); margin-top: 4px;
    }
    .header-meta {
      margin-top: 20px; display: flex; gap: 32px; flex-wrap: wrap;
    }
    .header-meta .meta-item { font-size: 0.82rem; color: rgba(244,250,247,0.7); }
    .header-meta .meta-item strong { color: #f4faf7; display: block; font-size: 0.95rem; }

    .page { max-width: 1000px; margin: 0 auto; padding: 0 0 40px; }
    .content { padding: 0 48px; }

    .condition-strip {
      background: #fff; border-bottom: 1px solid #e8eed0;
      padding: 24px 48px; display: flex; align-items: center; gap: 24px;
      flex-wrap: wrap;
    }
    .condition-icon { font-size: 3.5rem; }
    .condition-text h2 { font-size: 1.4rem; font-weight: 700; color: #1a2a22; }
    .condition-text p { font-size: 0.85rem; color: #6a8a72; margin-top: 2px; }
    .metrics-row { display: flex; gap: 20px; flex-wrap: wrap; margin-left: auto; }
    .metric { text-align: center; background: #f0f7f3; border-radius: 10px; padding: 12px 18px; min-width: 90px; }
    .metric .val { font-size: 1.3rem; font-weight: 700; color: #0d5c36; }
    .metric .lbl { font-size: 0.68rem; color: #6a8a72; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

    section { margin-top: 32px; }
    section h3 {
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; color: #6a8a72;
      border-bottom: 1px solid #e0ebe4; padding-bottom: 8px; margin-bottom: 16px;
    }

    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    thead tr { background: #0d2418; color: #fff; }
    thead th { padding: 10px 14px; text-align: left; font-weight: 600; font-size: 0.78rem; letter-spacing: 0.04em; }
    tbody tr:nth-child(even) { background: #f5f9f6; }
    tbody td { padding: 9px 14px; border-bottom: 1px solid #e8eed0; color: #2a3a30; }
    .badge { display: inline-flex; padding: 2px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; }
    .badge-actual { background: rgba(32,214,123,0.12); color: #0d7a42; }
    .badge-forecast { background: rgba(74,158,224,0.12); color: #1a5c8a; }

    .insight-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .insight-list li {
      background: #f0f7f3; border-left: 3px solid #20D67B;
      padding: 10px 14px; border-radius: 0 8px 8px 0;
      font-size: 0.85rem; line-height: 1.6; color: #2a4a32;
    }

    .rec-list { list-style: none; counter-reset: rec-counter; display: flex; flex-direction: column; gap: 8px; }
    .rec-list li {
      counter-increment: rec-counter;
      display: flex; gap: 10px; align-items: flex-start;
      background: #fff; border: 1px solid #e0ebe4;
      padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; color: #2a3a30; line-height: 1.5;
    }
    .rec-list li::before {
      content: counter(rec-counter);
      background: #0d5c36; color: #fff;
      font-weight: 700; font-size: 0.7rem;
      width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      margin-top: 1px;
    }

    .solar-factors { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
    .factor-card {
      background: #fff; border: 1px solid #e0ebe4; border-radius: 10px; padding: 14px;
    }
    .factor-card .f-label { font-size: 0.72rem; color: #6a8a72; margin-bottom: 4px; }
    .factor-card .f-value { font-size: 1.1rem; font-weight: 700; color: #1a2a22; margin-bottom: 8px; }
    .factor-bar { height: 5px; background: #e0ebe4; border-radius: 3px; overflow: hidden; }
    .factor-fill { height: 100%; border-radius: 3px; }

    .footer {
      margin-top: 40px; padding: 20px 48px;
      background: #f0f7f3; border-top: 1px solid #e0ebe4;
      font-size: 0.72rem; color: #6a8a72;
      display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
    }

    .print-btn {
      position: fixed; top: 20px; right: 20px; z-index: 100;
      background: #0d5c36; color: #fff; border: none; border-radius: 8px;
      padding: 10px 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }
    .print-btn:hover { background: #0a4a2c; }
  </style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save PDF</button>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-badge">⚡ OORJA SYNC · Energy Intelligence Platform</div>
    <h1>Weather Forecast Report</h1>
    <div class="sub">Energy & Climate Analysis — Smart Campus, Bhopal</div>
    <div class="header-meta">
      <div class="meta-item"><strong>${dateStr}</strong>Report Date</div>
      <div class="meta-item"><strong>${timeStr}</strong>Generated At</div>
      <div class="meta-item"><strong>Bhopal, Madhya Pradesh</strong>Location (23.25°N, 77.41°E)</div>
      <div class="meta-item"><strong>${conditionLabel[weather.condition] || weather.condition}</strong>Current Condition</div>
    </div>
  </div>

  <!-- Current Condition Strip -->
  <div class="condition-strip">
    <div class="condition-icon">${conditionIcon[weather.condition] || '☀️'}</div>
    <div class="condition-text">
      <h2>${conditionLabel[weather.condition] || weather.condition.replace('_', ' ')}</h2>
      <p>Bhopal, Madhya Pradesh, India · Elevation 523 m · IST (UTC+5:30)</p>
    </div>
    <div class="metrics-row">
      <div class="metric"><div class="val">${weather.temperature}°C</div><div class="lbl">Temperature</div></div>
      <div class="metric"><div class="val">${weather.humidity}%</div><div class="lbl">Humidity</div></div>
      <div class="metric"><div class="val">${weather.windSpeed.toFixed(1)} m/s</div><div class="lbl">Wind</div></div>
      <div class="metric"><div class="val">${Math.round(weather.cloudCover * 100)}%</div><div class="lbl">Cloud Cover</div></div>
      <div class="metric"><div class="val">${weather.uvIndex}</div><div class="lbl">UV Index</div></div>
      <div class="metric"><div class="val">${weather.rainProbability}%</div><div class="lbl">Rain Prob.</div></div>
    </div>
  </div>

  <div class="content">

    <!-- Solar Energy Factors -->
    <section>
      <h3>Solar Energy Factors</h3>
      <div class="solar-factors">
        <div class="factor-card">
          <div class="f-label">Solar Irradiance</div>
          <div class="f-value">${weather.solarIrradiance} W/m²</div>
          <div class="factor-bar"><div class="factor-fill" style="width:${Math.min(100, weather.solarIrradiance / 10)}%;background:#FFB84D;"></div></div>
        </div>
        <div class="factor-card">
          <div class="f-label">Cloud Attenuation</div>
          <div class="f-value">${Math.round(weather.cloudCover * 100)}%</div>
          <div class="factor-bar"><div class="factor-fill" style="width:${Math.round(weather.cloudCover * 100)}%;background:#FF8A3D;"></div></div>
        </div>
        <div class="factor-card">
          <div class="f-label">Current Solar Output</div>
          <div class="f-value">${solar.currentPower.toFixed(1)} kW</div>
          <div class="factor-bar"><div class="factor-fill" style="width:${Math.min(100, (solar.currentPower / 25) * 100)}%;background:#20D67B;"></div></div>
        </div>
        <div class="factor-card">
          <div class="f-label">Solar Impact</div>
          <div class="f-value" style="color:${weather.solarImpact < 0 ? '#c0392b' : '#0d5c36'}">${weather.solarImpact > 0 ? '+' : ''}${weather.solarImpact}%</div>
          <div class="factor-bar"><div class="factor-fill" style="width:${Math.abs(weather.solarImpact)}%;background:${weather.solarImpact < 0 ? '#FF5A5A' : '#20D67B'};"></div></div>
        </div>
      </div>
    </section>

    <!-- Forecast Table -->
    <section>
      <h3>Energy Forecast — Next 12 Periods</h3>
      <p style="font-size:0.8rem;color:#6a8a72;margin-bottom:12px;">Solar generation forecast with 95% confidence interval and campus demand forecast. All values in kW.</p>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Solar Forecast</th>
            <th>Confidence Interval (95%)</th>
            <th>Demand Forecast</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${forecastRows}
        </tbody>
      </table>
    </section>

    <!-- Weather Insights -->
    <section>
      <h3>Weather Insights</h3>
      <ul class="insight-list">
        ${insights.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </section>

    <!-- Recommendations -->
    <section>
      <h3>Recommendations</h3>
      <ul class="rec-list">
        ${recs.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </section>

  </div><!-- /content -->

  <!-- Footer -->
  <div class="footer">
    <span>OORJA SYNC · Smart Energy Intelligence Platform · SIH 2026</span>
    <span>Generated: ${dateStr}, ${timeStr} IST</span>
    <span>Data: Simulation-based forecast · For demonstration purposes</span>
  </div>

</div><!-- /page -->
</body>
</html>`;
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function WeatherForecastPage() {
  const weather = useEnergyStore(s => s.weather);
  const solar = useEnergyStore(s => s.solar);
  const solarForecast = useEnergyStore(s => s.solarForecast);
  const demandForecast = useEnergyStore(s => s.demandForecast);
  const [generating, setGenerating] = useState(false);

  // Forecast chart options
  const solarForecastOpt = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 24, right: 16, bottom: 40, left: 50, containLabel: false },
    xAxis: {
      type: 'category',
      data: solarForecast.slice(0, 24).map(p => new Date(p.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })),
      axisLabel: { color: '#91AAA2', fontSize: 10, rotate: 30 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    },
    yAxis: {
      type: 'value', name: 'kW', nameTextStyle: { color: '#91AAA2' },
      min: 0, max: 30,
      axisLabel: { color: '#91AAA2', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
    },
    series: [
      { type: 'line', name: 'Solar Forecast', data: solarForecast.slice(0, 24).map(p => p.predicted), smooth: true, symbol: 'none', lineStyle: { color: '#FFB84D', width: 2 }, areaStyle: { color: 'rgba(255,184,77,0.1)' } },
      { type: 'line', name: 'Lower 95%', data: solarForecast.slice(0, 24).map(p => p.lower), smooth: true, symbol: 'none', lineStyle: { color: 'rgba(255,184,77,0.25)', width: 1, type: 'dashed' } },
      { type: 'line', name: 'Upper 95%', data: solarForecast.slice(0, 24).map(p => p.upper), smooth: true, symbol: 'none', lineStyle: { color: 'rgba(255,184,77,0.25)', width: 1, type: 'dashed' } },
      { type: 'line', name: 'Measured', data: solarForecast.slice(0, 24).map(p => p.actual ?? null), smooth: true, symbolSize: 4, lineStyle: { color: '#20D67B', width: 2 } },
    ],
    legend: { data: ['Solar Forecast', 'Measured', 'Lower 95%', 'Upper 95%'], textStyle: { color: '#91AAA2', fontSize: 10 } },
    tooltip: {
      trigger: 'axis', backgroundColor: 'rgba(9,20,17,0.95)',
      borderColor: 'rgba(255,184,77,0.3)', textStyle: { color: '#F4FAF7', fontSize: 11 },
      formatter: (params: any[]) => params.map(p => `${p.seriesName}: ${p.value != null ? `${Number(p.value).toFixed(2)} kW` : '—'}`).join('<br/>'),
    },
  }), [solarForecast]);

  const demandForecastOpt = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 24, right: 16, bottom: 40, left: 50, containLabel: false },
    xAxis: {
      type: 'category',
      data: demandForecast.slice(0, 24).map(p => new Date(p.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })),
      axisLabel: { color: '#91AAA2', fontSize: 10, rotate: 30 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    },
    yAxis: {
      type: 'value', name: 'kW', nameTextStyle: { color: '#91AAA2' },
      min: 0, max: 25,
      axisLabel: { color: '#91AAA2', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
    },
    series: [
      { type: 'line', name: 'Demand Forecast', data: demandForecast.slice(0, 24).map(p => p.predicted), smooth: true, symbol: 'none', lineStyle: { color: '#27D7D0', width: 2 }, areaStyle: { color: 'rgba(39,215,208,0.08)' } },
      { type: 'line', name: 'Lower 95%', data: demandForecast.slice(0, 24).map(p => p.lower), smooth: true, symbol: 'none', lineStyle: { color: 'rgba(39,215,208,0.25)', width: 1, type: 'dashed' } },
      { type: 'line', name: 'Upper 95%', data: demandForecast.slice(0, 24).map(p => p.upper), smooth: true, symbol: 'none', lineStyle: { color: 'rgba(39,215,208,0.25)', width: 1, type: 'dashed' } },
    ],
    legend: { data: ['Demand Forecast', 'Lower 95%', 'Upper 95%'], textStyle: { color: '#91AAA2', fontSize: 10 } },
    tooltip: {
      trigger: 'axis', backgroundColor: 'rgba(9,20,17,0.95)',
      borderColor: 'rgba(39,215,208,0.3)', textStyle: { color: '#F4FAF7', fontSize: 11 },
      formatter: (params: any[]) => params.map(p => `${p.seriesName}: ${p.value != null ? `${Number(p.value).toFixed(2)} kW` : '—'}`).join('<br/>'),
    },
  }), [demandForecast]);

  const handleGenerateReport = useCallback(async () => {
    setGenerating(true);
    // Small tick to let the UI show loading state
    await new Promise(r => setTimeout(r, 400));
    try {
      const html = buildReportHTML({ weather, solar, solarForecast, demandForecast });
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        // Fallback: direct download
        const a = document.createElement('a');
        a.href = url;
        a.download = `weather-forecast-report-${Date.now()}.html`;
        a.click();
      }
      // Revoke after 60s
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } finally {
      setGenerating(false);
    }
  }, [weather, solar, solarForecast, demandForecast]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Cloud size={20} color="var(--color-secondary)" />
          <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>
            Weather Forecast
          </h2>
          <div className="status-demo">SIMULATED</div>
        </div>
        {/* Generate Report Button */}
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: generating ? 'rgba(32,214,123,0.06)' : 'rgba(32,214,123,0.12)',
            border: '1px solid rgba(32,214,123,0.3)',
            borderRadius: 10, padding: '9px 18px',
            color: generating ? 'var(--text-muted)' : 'var(--color-primary)',
            cursor: generating ? 'not-allowed' : 'pointer',
            fontSize: '0.82rem', fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          {generating
            ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
            : <><FileText size={14} /> Generate Report</>
          }
        </button>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPICard label="Temperature" value={weather.temperature} unit="°C" icon={<Thermometer size={13} />} />
        <KPICard label="Wind Speed" value={Number(weather.windSpeed.toFixed(1))} unit="m/s" icon={<Wind size={13} />} color="var(--color-secondary)" />
        <KPICard label="Cloud Cover" value={Math.round(weather.cloudCover * 100)} unit="%" icon={<Cloud size={13} />} />
        <KPICard label="Humidity" value={weather.humidity} unit="%" icon={<Droplets size={13} />} />
        <KPICard label="UV Index" value={weather.uvIndex} unit="" />
        <KPICard label="Rain Probability" value={weather.rainProbability} unit="%" />
      </div>

      {/* Current Conditions + Solar Factors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 28 }}>
          <div style={{ fontSize: '4.5rem', marginBottom: 10 }}>{conditionIcon[weather.condition] || '☀️'}</div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 700 }}>
            {conditionLabel[weather.condition] || weather.condition.replace('_', ' ')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Bhopal, Madhya Pradesh · 23.25°N, 77.41°E
          </div>
          <div style={{
            marginTop: 14, padding: '8px 16px',
            background: weather.solarImpact < 0 ? 'rgba(255,90,90,0.08)' : 'rgba(32,214,123,0.08)',
            border: `1px solid ${weather.solarImpact < 0 ? 'rgba(255,90,90,0.2)' : 'rgba(32,214,123,0.2)'}`,
            borderRadius: 8, fontSize: '0.8rem',
            color: weather.solarImpact < 0 ? 'var(--color-critical)' : 'var(--color-primary)',
          }}>
            Solar Impact: {weather.solarImpact > 0 ? '+' : ''}{weather.solarImpact}%
            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginLeft: 6 }}>ESTIMATED</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Solar Energy Factors
          </div>
          {[
            { label: 'Irradiance', value: `${weather.solarIrradiance} W/m²`, bar: weather.solarIrradiance / 1000, color: 'var(--color-solar)' },
            { label: 'Cloud Attenuation', value: `${Math.round(weather.cloudCover * 100)}%`, bar: weather.cloudCover, color: 'var(--color-critical)' },
            { label: 'Temperature Derating', value: `${Math.max(0, (weather.temperature - 25) * 0.4).toFixed(1)}%`, bar: Math.max(0, weather.temperature - 25) / 20, color: 'var(--color-solar)' },
            { label: 'Rain Probability', value: `${weather.rainProbability}%`, bar: weather.rainProbability / 100, color: 'var(--color-grid)' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{item.value}</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                <div style={{
                  height: '100%', width: `${Math.min(100, item.bar * 100)}%`,
                  background: item.color, borderRadius: 3, transition: 'width 1s',
                }} />
              </div>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Solar Generation Forecast Chart */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2 }}>Solar Generation Forecast</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              24-hour window · 95% confidence interval · Based on weather conditions &amp; irradiance model
            </div>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            <div>MAE: 0.04 kW</div>
            <div>R²: 0.9983</div>
          </div>
        </div>
        <ReactECharts option={solarForecastOpt} style={{ height: 260 }} notMerge />
      </GlassCard>

      {/* Demand Forecast Chart */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2 }}>Campus Demand Forecast</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              24-hour window · Accounts for academic schedule, occupancy, and weather-based loads
            </div>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            <div>MAE: 0.41 kW</div>
            <div>R²: 0.9937</div>
          </div>
        </div>
        <ReactECharts option={demandForecastOpt} style={{ height: 260 }} notMerge />
      </GlassCard>

      {/* Weather Insights */}
      <GlassCard>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 12 }}>Weather Insights</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(() => {
            const insights: string[] = [];
            if (weather.cloudCover > 0.5) insights.push(`☁️ Cloud cover is high (${Math.round(weather.cloudCover * 100)}%) — solar output is reduced. Battery or grid backup recommended.`);
            if (weather.rainProbability > 50) insights.push(`🌧️ Rain probability at ${weather.rainProbability}% — expect panel self-cleaning benefit post-rain.`);
            if (weather.windSpeed > 7) insights.push(`💨 Wind speed ${weather.windSpeed.toFixed(1)} m/s — wind turbine near peak efficiency.`);
            if (weather.temperature > 38) insights.push(`🌡️ High temperature (${weather.temperature}°C) — solar panel derating ~${((weather.temperature - 25) * 0.4).toFixed(1)}%. Monitor battery thermals.`);
            if (weather.uvIndex >= 7) insights.push(`☀️ UV Index ${weather.uvIndex} — excellent irradiance conditions. Peak solar generation expected.`);
            if (weather.cloudCover < 0.2 && weather.rainProbability < 20) insights.push(`✅ Clear sky conditions — ideal for EV charging and high-load scheduling during solar peak.`);
            if (insights.length === 0) insights.push('✅ Weather conditions are nominal. No special advisories at this time.');
            return insights.map((ins, i) => (
              <div key={i} style={{
                background: 'rgba(32,214,123,0.05)', borderLeft: '3px solid var(--color-primary)',
                padding: '9px 12px', borderRadius: '0 8px 8px 0',
                fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-secondary)',
              }}>
                {ins}
              </div>
            ));
          })()}
        </div>
      </GlassCard>

      {/* Forecast methodology note */}
      <GlassCard padding="10px 16px">
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Forecast Methodology:</strong>{' '}
          Solar forecast uses a RandomForestRegressor model (MAE 0.04 kW, R² 0.9983) trained on 90-day campus data.
          Demand forecast uses HistGradientBoosting (MAE 0.41 kW, R² 0.9937). Confidence intervals represent 95% prediction bands.
          Weather data is provided by the integrated demo simulator. All values are simulated for demonstration.
        </div>
      </GlassCard>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
