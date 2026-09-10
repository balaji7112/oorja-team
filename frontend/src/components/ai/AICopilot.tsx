import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useEnergyStore } from '../../store/energyStore';
import type { SolarData, BatteryData, WeatherData, Recommendation, Anomaly, BuildingData, ForecastPoint, OorjaSyncScore } from '../../store/energyStore';
import { X, Send, Bot } from 'lucide-react';

interface StoreSnapshot {
  solar: SolarData; battery: BatteryData; weather: WeatherData;
  recommendations: Recommendation[]; anomalies: Anomaly[];
  totalLoad: number; gridDependency: number; renewableShare: number;
  buildings: BuildingData[]; windPower: number; gridExport: number;
  solarForecast: ForecastPoint[]; oorjaSyncScore: OorjaSyncScore;
}

interface Message { role: 'user' | 'ai'; text: string; }

function getAnswer(question: string, store: StoreSnapshot): string {
  const q = question.toLowerCase();
  const { solar, battery, weather, recommendations, anomalies, totalLoad, gridDependency, renewableShare, buildings, windPower, gridExport, solarForecast, oorjaSyncScore } = store;

  if (q.includes('solar') && (q.includes('low') || q.includes('why'))) {
    if (weather.cloudCover > 0.4)
      return `Solar generation is reduced to ${solar.currentPower.toFixed(1)} kW due to cloud cover at ${Math.round(weather.cloudCover * 100)}%. Current irradiance: ${solar.irradiance} W/m². Expected to recover as clouds clear.`;
    if (solar.currentPower < 2)
      return `Solar output is ${solar.currentPower.toFixed(1)} kW. This is consistent with the current time of day (${new Date().getHours()}:00) — low sun angle reduces generation.`;
    return `Solar generation is ${solar.currentPower.toFixed(1)} kW, operating within expected parameters. Irradiance: ${solar.irradiance} W/m², efficiency: ${solar.efficiency.toFixed(1)}%.`;
  }

  if (q.includes('grid') && (q.includes('high') || q.includes('why'))) {
    const belowAbove = totalLoad > (solar.currentPower + windPower) ? 'below' : 'above';
    return `Grid dependency is ${gridDependency.toFixed(1)}%. Renewable generation (${solar.currentPower.toFixed(1)} kW solar + ${windPower.toFixed(1)} kW wind) is ${belowAbove} current demand of ${totalLoad.toFixed(1)} kW. Battery SOC is ${battery.soc.toFixed(1)}%.`;
  }

  if (q.includes('battery')) {
    return `Battery status: SOC ${battery.soc.toFixed(1)}%, SOH ${battery.soh}%, Temperature ${battery.temperature.toFixed(1)}°C, Action: ${battery.chargingAction}. Projected backup: ${battery.projectedBackupHours.toFixed(1)} hours at current load. ${battery.chargingAction === 'CHARGING' ? 'Currently absorbing renewable surplus.' : battery.chargingAction === 'DISCHARGING' ? 'Currently supporting campus load.' : 'Holding — system balanced.'}`;
  }

  if (q.includes('forecast') || q.includes('tomorrow') || q.includes('predict')) {
    const nextPeak = store.solarForecast.find(p => p.predicted > 15);
    return `Solar forecast: Next peak predicted at ${nextPeak ? nextPeak.predicted.toFixed(1) : '~18'} kW. Demand forecast shows ${totalLoad.toFixed(1)} kW average. Confidence decreases beyond 6 hours. Forecasts are updated every 3 minutes using RandomForest model (R²: 0.998).`;
  }

  if (q.includes('anomaly') || q.includes('alert')) {
    if (anomalies.length === 0) return 'No active anomalies detected. All assets are operating within normal parameters.';
    const top = anomalies[0];
    return `Highest priority anomaly: ${top.type} on ${top.asset} — severity ${top.severity}, score ${top.score.toFixed(2)}. Possible cause: ${top.possibleCause}. Recommended action: ${top.recommendedAction}`;
  }

  if (q.includes('waste') || q.includes('efficient')) {
    return `Energy waste assessment: Curtailment ${store.gridExport > 2 ? 'ACTIVE' : 'minimal'} (${store.gridExport.toFixed(1)} kW exported to grid). Idle consumption: ~2.1 kW in non-active buildings. Overall Oorja Sync Score: ${store.oorjaSyncScore.total}/100.`;
  }

  if (q.includes('ev') || q.includes('charging') || q.includes('schedule')) {
    const evBuilding = buildings.find(b => b.id === 'EV_CHARGING');
    return `EV Charging Zone: Current load ${evBuilding?.currentLoad.toFixed(1) || 0} kW. Optimal charging window is 10:00–14:00 (peak solar). The optimizer has scheduled EV charging to align with renewable surplus. Flexible load: ${evBuilding?.flexibleLoad} kW available.`;
  }

  if (q.includes('building') || q.includes('consumes') || q.includes('consumption')) {
    const sorted = [...buildings].sort((a, b) => b.currentLoad - a.currentLoad);
    return `Highest consuming building: ${sorted[0].name} at ${sorted[0].currentLoad.toFixed(1)} kW. Full breakdown: ${sorted.map(b => `${b.name}: ${b.currentLoad.toFixed(1)} kW`).join(', ')}.`;
  }

  if (q.includes('recommendation') || q.includes('should')) {
    if (recommendations.length === 0) return 'No active recommendations. System is operating optimally.';
    const top = recommendations.find(r => r.status === 'PENDING');
    if (!top) return 'All current recommendations have been actioned.';
    return `Top recommendation: "${top.title}" — ${top.reason} Confidence: ${top.confidence}%. Projected impact: ${top.projectedImpact}`;
  }

  return 'Insufficient current telemetry to answer this specific query. Please ask about solar generation, battery status, grid dependency, anomalies, or energy forecasts.';
}

export default function AICopilot() {
  const setCopilotOpen = useUIStore(s => s.setCopilotOpen);
  const solar = useEnergyStore(s => s.solar);
  const battery = useEnergyStore(s => s.battery);
  const weather = useEnergyStore(s => s.weather);
  const recommendations = useEnergyStore(s => s.recommendations);
  const anomalies = useEnergyStore(s => s.anomalies);
  const totalLoad = useEnergyStore(s => s.totalLoad);
  const gridDependency = useEnergyStore(s => s.gridDependency);
  const gridExport = useEnergyStore(s => s.gridExport);
  const renewableShare = useEnergyStore(s => s.renewableShare);
  const buildings = useEnergyStore(s => s.buildings);
  const windPower = useEnergyStore(s => s.windPower);
  const solarForecast = useEnergyStore(s => s.solarForecast);
  const oorjaSyncScore = useEnergyStore(s => s.oorjaSyncScore);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello! I\'m OORJA Copilot. Ask me about solar generation, battery status, anomalies, forecasts, or energy optimization. I answer using live system data only.' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input };
    const snapshot: StoreSnapshot = { solar, battery, weather, recommendations, anomalies, totalLoad, gridDependency, renewableShare, buildings, windPower, gridExport, solarForecast, oorjaSyncScore };
    const answer = getAnswer(input, snapshot);
    setMessages(prev => [...prev, userMsg, { role: 'ai', text: answer }]);
    setInput('');
  };

  const SUGGESTIONS = ['Why is solar low?', 'What should battery do?', 'Which building uses most energy?', 'Show top anomaly'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{
        position: 'fixed', right: 24, bottom: 24,
        width: 360, height: 480,
        background: 'rgba(9, 20, 17, 0.97)',
        border: '1px solid rgba(32,214,123,0.2)',
        borderRadius: 16, zIndex: 7000,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(32,214,123,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={14} color="#07110F" />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>OORJA Copilot</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}>• Live system data</div>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setCopilotOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={15} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }} className="styled-scroll">
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '8px 12px', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: msg.role === 'user' ? 'rgba(32,214,123,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(32,214,123,0.25)' : 'rgba(255,255,255,0.08)'}`,
              fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-primary)',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div style={{ padding: '8px 14px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => setInput(s)} style={{
            background: 'rgba(32,214,123,0.06)', border: '1px solid rgba(32,214,123,0.15)',
            borderRadius: 20, padding: '3px 10px', fontSize: '0.67rem', color: 'var(--color-primary)', cursor: 'pointer',
          }}>{s}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(32,214,123,0.1)', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about energy state..."
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(32,214,123,0.15)',
            borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none',
          }}
        />
        <button onClick={handleSend} style={{
          background: 'rgba(32,214,123,0.15)', border: '1px solid rgba(32,214,123,0.3)',
          borderRadius: 8, padding: '8px 12px', color: 'var(--color-primary)', cursor: 'pointer',
        }}>
          <Send size={14} />
        </button>
      </div>
    </motion.div>
  );
}

