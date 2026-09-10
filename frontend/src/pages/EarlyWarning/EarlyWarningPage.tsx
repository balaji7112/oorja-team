import React, { useState, useMemo } from 'react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import { ShieldAlert, Play, RotateCcw, AlertTriangle, Zap, Sun, Battery } from 'lucide-react';

// ── Severity colour map ────────────────────────────────────────────────
const sevColor: Record<string, string> = {
  LOW: '#91AAA2', MEDIUM: '#FFB84D', HIGH: '#FF8A3D', CRITICAL: '#FF5A5A',
};
const sevBg: Record<string, string> = {
  LOW: 'rgba(145,170,162,0.08)', MEDIUM: 'rgba(255,184,77,0.08)',
  HIGH: 'rgba(255,138,61,0.08)', CRITICAL: 'rgba(255,90,90,0.08)',
};

// ── Risk colours by scenario impact ───────────────────────────────────
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

// ── Scenario definitions ───────────────────────────────────────────────
const SCENARIOS = [
  {
    id: 'cloud-event', label: '☁️ Cloud Cover Event',
    desc: 'Simulates 80% cloud cover — solar output drops ~65%',
    fault: 'CLOUD_COVER' as const,
    risk: 'HIGH',
    impact: 'Solar drops ~65%. Battery covers gap for ~3 hrs. Grid import rises sharply.',
    recommendation: 'Pre-charge battery. Alert demand response. Switch non-critical loads to off-peak.',
  },
  {
    id: 'panel-dust', label: '🌫️ Panel Soiling',
    desc: 'Reduces solar efficiency by 38% due to dust accumulation',
    fault: 'SOLAR_DUST' as const,
    risk: 'MEDIUM',
    impact: 'Gradual 38% output loss. Renewable share falls. Minor grid compensation needed.',
    recommendation: 'Schedule immediate panel cleaning. Monitor efficiency trend daily.',
  },
  {
    id: 'bat-heat', label: '🌡️ Battery Overheating',
    desc: 'Battery temp rises to 42°C — triggers HOLD action',
    fault: 'BATTERY_HEATING' as const,
    risk: 'CRITICAL',
    impact: 'Battery charge/discharge suspended. No storage buffer. Grid dependency spikes.',
    recommendation: 'Activate thermal cooling immediately. Reduce ambient temperature. Limit charge rate.',
  },
  {
    id: 'load-spike', label: '⚡ Demand Spike',
    desc: 'Computer Lab draws 2× normal load — anomaly detected',
    fault: 'LAB_LOAD_SPIKE' as const,
    risk: 'HIGH',
    impact: 'Campus demand peaks 40% above forecast. Battery discharges rapidly. Grid import increases.',
    recommendation: 'Enable demand response. Curtail EV charging. Alert facilities manager.',
  },
  {
    id: 'demand', label: '📈 High Demand Day',
    desc: 'All buildings at peak occupancy — 40% load increase',
    fault: 'INCREASE_DEMAND' as const,
    risk: 'MEDIUM',
    impact: 'Total load exceeds solar + storage capacity. Grid becomes primary supply.',
    recommendation: 'Pre-schedule battery charging overnight. Stagger high-load activities.',
  },
  {
    id: 'sensor', label: '🔌 Sensor Offline',
    desc: 'Lab power meter disconnects — triggers fallback estimation',
    fault: 'SENSOR_DISCONNECT' as const,
    risk: 'LOW',
    impact: 'One zone loses accurate metering. Estimation fallback active. Data quality drops.',
    recommendation: 'Send maintenance ticket. Use adjacent sensor data for interpolation.',
  },
];

// ── Step indicator ─────────────────────────────────────────────────────
function FlowStep({ number, label, active }: { number: number; label: string; active?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        background: active ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${active ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.65rem', fontWeight: 700,
        color: active ? '#07110F' : 'var(--text-muted)',
      }}>{number}</div>
      <span style={{ fontSize: '0.72rem', fontWeight: active ? 700 : 400, color: active ? 'var(--color-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function EarlyWarningPage() {
  const { anomalies, injectFault, activeFault, solar, battery, totalLoad, gridDependency } = useEnergyStore();
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const activeScenario = useMemo(
    () => SCENARIOS.find(s => s.id === activeScenarioId) ?? null,
    [activeScenarioId]
  );

  const runScenario = (s: typeof SCENARIOS[0]) => {
    setActiveScenarioId(s.id);
    injectFault(s.fault);
  };

  const reset = () => {
    setActiveScenarioId(null);
    injectFault('RESET');
  };

  const hasAnomaly = anomalies.length > 0;
  const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldAlert size={20} color={hasAnomaly ? 'var(--color-critical)' : 'var(--color-primary)'} />
          <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>
            Early Warning System
          </h2>
          {hasAnomaly ? (
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, padding: '2px 10px', borderRadius: 20,
              background: 'rgba(255,90,90,0.12)', color: 'var(--color-critical)',
              border: '1px solid rgba(255,90,90,0.25)',
            }}>
              {anomalies.length} ANOMAL{anomalies.length > 1 ? 'IES' : 'Y'} DETECTED
            </span>
          ) : (
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, padding: '2px 10px', borderRadius: 20,
              background: 'rgba(32,214,123,0.1)', color: 'var(--color-primary)',
              border: '1px solid rgba(32,214,123,0.2)',
            }}>ALL CLEAR</span>
          )}
        </div>
        {activeFault && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-critical)', fontWeight: 600 }}>
              ⚡ {activeFault} ACTIVE
            </span>
            <button onClick={reset} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(32,214,123,0.1)', border: '1px solid rgba(32,214,123,0.25)',
              borderRadius: 8, padding: '6px 14px', color: 'var(--color-primary)',
              cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
            }}>
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        )}
      </div>

      {/* ── Workflow Flow ────────────────────────────────────────── */}
      <GlassCard padding="12px 16px">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <FlowStep number={1} label="Real-Time Data" active />
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</div>
          <FlowStep number={2} label="Anomaly Detection" active={hasAnomaly} />
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</div>
          <FlowStep number={3} label="Scenario / Impact Analysis" active={!!activeScenario} />
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</div>
          <FlowStep number={4} label="Risk Level" active={hasAnomaly || !!activeScenario} />
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</div>
          <FlowStep number={5} label="AI Recommendation" active={hasAnomaly || !!activeScenario} />
        </div>
      </GlassCard>

      {/* ── Live Telemetry KPIs ──────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPICard label="Solar Output" value={solar.currentPower} unit="kW" color="var(--color-solar)" icon={<Sun size={13} />} />
        <KPICard label="Battery SOC" value={battery.soc} unit="%" color="var(--color-primary)" icon={<Battery size={13} />} />
        <KPICard label="Total Load" value={totalLoad} unit="kW" icon={<Zap size={13} />} />
        <KPICard label="Grid Dependency" value={gridDependency} unit="%" />
      </div>

      {/* ── Two column: Anomalies | Active Scenario Result ───────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* STEP 2 — Anomaly Detection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 2px' }}>
            Step 2 — Anomaly Detection
          </div>

          {!hasAnomaly ? (
            <GlassCard>
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>All Systems Normal</div>
                <div style={{ fontSize: '0.75rem', marginTop: 6, lineHeight: 1.5 }}>
                  IsolationForest model scanning all assets.<br />No anomalous behavior detected.
                </div>
              </div>
            </GlassCard>
          ) : (
            anomalies.map(a => (
              <GlassCard key={a.id}
                glow={a.severity === 'CRITICAL' ? 'critical' : 'none'}
                style={{ borderColor: `${sevColor[a.severity]}30`, background: sevBg[a.severity] }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <AlertTriangle size={14} color={sevColor[a.severity]} />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{a.asset}</span>
                    <span style={{
                      fontSize: '0.62rem', padding: '2px 8px', borderRadius: 20,
                      background: `${sevColor[a.severity]}20`, color: sevColor[a.severity], fontWeight: 700,
                    }}>{a.severity}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Score: {a.score.toFixed(2)}</div>
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {a.type.replace(/_/g, ' ')}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 8px' }}>{a.possibleCause}</p>
                <div style={{ padding: '7px 10px', background: 'rgba(255,90,90,0.06)', borderRadius: 6, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Action:</strong> {a.recommendedAction}
                </div>
              </GlassCard>
            ))
          )}
        </div>

        {/* STEP 3–5 — Scenario / Impact / Recommendation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 2px' }}>
            Steps 3–5 — Impact Analysis · Risk · Recommendation
          </div>

          {!activeScenario ? (
            <GlassCard>
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No Scenario Active</div>
                <div style={{ fontSize: '0.75rem', marginTop: 6 }}>Run a scenario below to see impact analysis and AI recommendation.</div>
              </div>
            </GlassCard>
          ) : (
            <>
              <GlassCard style={{
                borderColor: `${sevColor[activeScenario.risk]}30`,
                background: sevBg[activeScenario.risk],
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{activeScenario.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{activeScenario.desc}</div>
                  </div>
                  <span style={{
                    fontSize: '0.65rem', padding: '3px 10px', borderRadius: 20, fontWeight: 700, flexShrink: 0,
                    background: `${sevColor[activeScenario.risk]}20`,
                    color: sevColor[activeScenario.risk],
                    border: `1px solid ${sevColor[activeScenario.risk]}40`,
                  }}>
                    {activeScenario.risk} RISK
                  </span>
                </div>

                {/* Impact */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>Impact Analysis</div>
                  <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {activeScenario.impact}
                  </div>
                </div>

                {/* Recommendation */}
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>AI Recommendation</div>
                  <div style={{ padding: '8px 10px', background: 'rgba(32,214,123,0.06)', border: '1px solid rgba(32,214,123,0.15)', borderRadius: 6, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    ✅ {activeScenario.recommendation}
                  </div>
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </div>

      {/* ── Scenario Simulation Panel ────────────────────────────── */}
      <div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
          Scenario Simulation — What-If Analysis
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
          {SCENARIOS.map(s => {
            const isActive = activeScenarioId === s.id && !!activeFault;
            return (
              <GlassCard key={s.id} hover
                style={{ borderColor: isActive ? `${sevColor[s.risk]}40` : undefined }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{s.label}</div>
                  <span style={{
                    fontSize: '0.58rem', padding: '2px 7px', borderRadius: 20, fontWeight: 700, flexShrink: 0, marginLeft: 8,
                    background: `${sevColor[s.risk]}15`, color: sevColor[s.risk],
                  }}>{s.risk}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 10px' }}>{s.desc}</p>
                <button
                  onClick={() => isActive ? reset() : runScenario(s)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: isActive ? 'rgba(32,214,123,0.1)' : 'rgba(255,90,90,0.08)',
                    border: `1px solid ${isActive ? 'rgba(32,214,123,0.3)' : 'rgba(255,90,90,0.2)'}`,
                    borderRadius: 7, padding: '7px', cursor: 'pointer',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-critical)',
                    fontSize: '0.76rem', fontWeight: 600, transition: 'all 0.2s',
                  }}
                >
                  {isActive
                    ? <><RotateCcw size={12} /> Reset Scenario</>
                    : <><Play size={12} /> Simulate</>
                  }
                </button>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* ── Summary if no scenario and no anomaly ────────────────── */}
      {!hasAnomaly && !activeScenario && (
        <GlassCard padding="12px 16px">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>How it works:</strong>{' '}
            The Early Warning System continuously monitors energy telemetry using an IsolationForest anomaly detector.
            When abnormal behavior is detected, it triggers an impact analysis using historical scenario data and provides
            preventive AI recommendations. Use the simulation panel above to test "what-if" scenarios proactively.
          </div>
        </GlassCard>
      )}

    </div>
  );
}
