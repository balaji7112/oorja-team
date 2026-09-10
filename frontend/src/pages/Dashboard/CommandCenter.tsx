import React from 'react';
import { motion } from 'framer-motion';
import { useEnergyStore } from '../../store/energyStore';
import { useUIStore } from '../../store/uiStore';
import KPICard from '../../components/ui/KPICard';
import GlassCard from '../../components/ui/GlassCard';
import LiveSolarChart from '../../components/charts/LiveSolarChart';
import LiveLoadChart from '../../components/charts/LiveLoadChart';
import LiveBatteryChart from '../../components/charts/LiveBatteryChart';
import { Sun, Battery, Zap, Leaf, Activity, TrendingDown, DollarSign, Star, Bot, Wind } from 'lucide-react';

// ── KPI Strip ──────────────────────────────────────────────────────────
function KPIStrip() {
  const { solar, battery, totalLoad, gridDependency, renewableShare, co2Avoided, oorjaSyncScore, estimatedCostSaving, windPower } = useEnergyStore();
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }} className="styled-scroll">
      <KPICard label="Renewable Generation" value={solar.currentPower + windPower} unit="kW"  trend={13.2} trendLabel="vs yesterday" color="var(--color-solar)" icon={<Sun size={13} />} small />
      <KPICard label="Current Load"         value={totalLoad}           unit="kW"  trend={-2.1} trendLabel="vs 1h ago"   icon={<Activity size={13} />} small />
      <KPICard label="Battery SOC"          value={battery.soc}         unit="%"   color={battery.soc > 50 ? 'var(--color-success)' : battery.soc > 25 ? 'var(--color-solar)' : 'var(--color-critical)'} icon={<Battery size={13} />} small />
      <KPICard label="Grid Dependency"      value={gridDependency}      unit="%"   color={gridDependency < 20 ? 'var(--color-success)' : gridDependency < 40 ? 'var(--color-solar)' : 'var(--color-critical)'} trend={-8.4} trendLabel="vs yesterday" icon={<Zap size={13} />} small />
      <KPICard label="Renewable Share"      value={renewableShare}      unit="%"   color="var(--color-primary)"  icon={<Leaf size={13} />} small />
      <KPICard label="CO₂ Avoided"          value={co2Avoided}          unit="kg/hr" color="var(--color-secondary)" icon={<TrendingDown size={13} />} small />
      <KPICard label="Est. Cost Saving"     value={`₹${estimatedCostSaving}`} unit="/day" color="var(--color-solar)" icon={<DollarSign size={13} />} small />
      <KPICard label="Oorja Sync Score"     value={oorjaSyncScore.total} unit="/100" color={oorjaSyncScore.total >= 80 ? 'var(--color-success)' : oorjaSyncScore.total >= 60 ? 'var(--color-solar)' : 'var(--color-critical)'} icon={<Star size={13} />} small />
    </div>
  );
}

// ── Energy Flow Diagram — replaces 3D canvas ──────────────────────────
function EnergyFlowDiagram() {
  const { solar, battery, totalLoad, windPower, gridDependency, renewableShare, energyState } = useEnergyStore();

  const stateColor: Record<string, string> = {
    SURPLUS: 'var(--color-success)', BALANCED: 'var(--color-primary)',
    DEFICIT: 'var(--color-solar)', CRITICAL: 'var(--color-critical)',
    NORMAL: 'var(--color-success)', FAULT: 'var(--color-critical)',
  };
  const sc = stateColor[energyState] || 'var(--color-primary)';

  const Node = ({ label, value, unit, color, icon, x, y }: {
    label: string; value: string; unit?: string; color: string; icon: string; x: number; y: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)',
        background: 'rgba(20,25,32,0.9)', border: `1px solid ${color}30`,
        borderRadius: 12, padding: '12px 16px', minWidth: 100, textAlign: 'center',
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${color}15`,
      }}
    >
      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color }}>
        {value}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 2 }}>{unit}</span>
      </div>
      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </motion.div>
  );

  // Animated flow line SVG
  const FlowLine = ({ from, to, active = true, color }: { from: [number,number]; to: [number,number]; active?: boolean; color: string }) => {
    const x1 = `${from[0]}%`, y1 = `${from[1]}%`, x2 = `${to[0]}%`, y2 = `${to[1]}%`;
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <marker id={`arrow-${color.replace(/[^a-z0-9]/gi,'')}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={active ? color : 'rgba(255,255,255,0.08)'} />
          </marker>
        </defs>
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={active ? color : 'rgba(255,255,255,0.06)'}
          strokeWidth={active ? 1.5 : 1}
          strokeDasharray={active ? '6 4' : '3 6'}
          markerEnd={`url(#arrow-${color.replace(/[^a-z0-9]/gi,'')})`}
          style={{ animation: active ? 'energy-pulse 3s ease-in-out infinite' : 'none' }}
          opacity={active ? 0.6 : 0.25}
        />
      </svg>
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 280 }}>
      {/* State badge */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 5 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: `${sc}10`, border: `1px solid ${sc}25`, borderRadius: 20,
          padding: '4px 12px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc, animation: 'pulse-dot 2s infinite' }} />
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: sc, fontSize: '0.78rem' }}>{energyState}</span>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 5 }}>
        <div className="live-indicator"><div className="dot" />SIMULATED</div>
      </div>

      {/* Flow lines */}
      <FlowLine from={[20,28]} to={[50,50]} active={solar.currentPower > 2} color="#F59E0B" />
      <FlowLine from={[80,28]} to={[50,50]} active={windPower > 0.5} color="#38BDF8" />
      <FlowLine from={[50,50]} to={[20,72]} active={true} color="#3B82F6" />
      <FlowLine from={[50,50]} to={[80,72]} active={gridDependency < 80} color="#6366F1" />
      <FlowLine from={[50,50]} to={[50,82]} active={totalLoad > 0} color="#10B981" />

      {/* Nodes */}
      <Node label="Solar Farm"    value={solar.currentPower.toFixed(1)} unit="kW"  color="var(--color-solar)"     icon="☀️" x={20} y={28} />
      <Node label="Wind"         value={windPower.toFixed(1)}          unit="kW"  color="var(--color-grid)"      icon="💨" x={80} y={28} />
      <Node label="Hub"          value={renewableShare.toFixed(0)}     unit="%RE" color="var(--color-primary)"   icon="⚡" x={50} y={50} />
      <Node label="Battery"      value={battery.soc.toFixed(0)}        unit="%"   color="var(--color-secondary)" icon="🔋" x={20} y={72} />
      <Node label="Grid"         value={gridDependency.toFixed(0)}     unit="%"   color="var(--color-accent)"    icon="🏭" x={80} y={72} />
      <Node label="Campus Load"  value={totalLoad.toFixed(1)}          unit="kW"  color="var(--color-success)"   icon="🏫" x={50} y={86} />

      <div style={{ position: 'absolute', bottom: 8, left: 12, fontSize: '0.6rem', color: 'var(--text-muted)' }}>
        Energy Flow — Smart Campus, Bhopal · All values SIMULATED
      </div>
    </div>
  );
}

// ── AI Decision Panel ──────────────────────────────────────────────────
function AIDecisionPanel() {
  const { recommendations, optimizationDecision, anomalies, energyState } = useEnergyStore();
  const { approveRecommendation, rejectRecommendation } = useEnergyStore();
  const setCopilotOpen = useUIStore(s => s.setCopilotOpen);

  const pendingRecs = recommendations.filter(r => r.status === 'PENDING').slice(0, 3);
  const priorityColor = (p: string) => p === 'HIGH' ? 'var(--color-critical)' : p === 'MEDIUM' ? 'var(--color-solar)' : 'var(--text-muted)';
  const stateColor: Record<string, string> = {
    SURPLUS: 'var(--color-success)', BALANCED: 'var(--color-primary)',
    DEFICIT: 'var(--color-solar)',   CRITICAL: 'var(--color-critical)',
    NORMAL: 'var(--color-success)', FAULT: 'var(--color-critical)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto' }} className="styled-scroll">
      {/* Energy State */}
      <GlassCard padding="12px 14px">
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Energy State</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: stateColor[energyState] || 'var(--text-muted)', animation: 'pulse-dot 2s infinite' }} />
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: stateColor[energyState], fontSize: '1rem' }}>{energyState}</span>
        </div>
        {optimizationDecision && (
          <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>⚡ {optimizationDecision.action}</span>
            <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>— {optimizationDecision.reason.slice(0, 70)}...</span>
          </div>
        )}
      </GlassCard>

      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 2px' }}>
        OORJA Intelligence
      </div>
      {pendingRecs.length === 0 && (
        <GlassCard padding="12px 14px">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No pending recommendations. System optimized.</div>
        </GlassCard>
      )}
      {pendingRecs.map(rec => (
        <GlassCard key={rec.id} padding="12px 14px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: priorityColor(rec.priority), letterSpacing: '0.06em' }}>{rec.priority}</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Confidence: {rec.confidence}%</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 4 }}>{rec.title}</div>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 8 }}>{rec.reason.slice(0, 90)}...</div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${rec.confidence}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => approveRecommendation(rec.id)} style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 6, padding: '5px', color: 'var(--color-success)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>✓ Approve</button>
            <button onClick={() => rejectRecommendation(rec.id)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: 6, padding: '5px 10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
          </div>
        </GlassCard>
      ))}

      {anomalies.length > 0 && (
        <GlassCard padding="12px 14px" glow="critical">
          <div style={{ fontSize: '0.65rem', color: 'var(--color-critical)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Active Anomalies</div>
          {anomalies.slice(0, 2).map(a => (
            <div key={a.id} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{a.asset} — {a.type}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Severity: {a.severity} · Score: {a.score.toFixed(2)}</div>
            </div>
          ))}
        </GlassCard>
      )}

      <button
        onClick={() => setCopilotOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 10, padding: '10px 14px', color: 'var(--color-secondary)',
          cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, width: '100%',
        }}
      >
        <Bot size={14} /> Ask OORJA Copilot
      </button>
    </div>
  );
}

// ── Main CommandCenter ─────────────────────────────────────────────────
export default function CommandCenter() {
  return (
    <div style={{ height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <KPIStrip />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 12, minHeight: 0 }}>
        {/* Center: Energy Flow Diagram + Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <GlassCard style={{ flex: '0 0 55%', position: 'relative', overflow: 'hidden', minHeight: 300 }} padding={12}>
            <EnergyFlowDiagram />
          </GlassCard>
          {/* Bottom charts */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, minHeight: 0 }}>
            <GlassCard padding="10px 12px">
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Solar Generation</div>
              <LiveSolarChart height={100} />
            </GlassCard>
            <GlassCard padding="10px 12px">
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Campus Load</div>
              <LiveLoadChart height={100} />
            </GlassCard>
            <GlassCard padding="10px 12px">
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Battery SOC</div>
              <LiveBatteryChart height={100} />
            </GlassCard>
          </div>
        </div>
        {/* Right: AI Panel */}
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <AIDecisionPanel />
        </div>
      </div>
    </div>
  );
}
