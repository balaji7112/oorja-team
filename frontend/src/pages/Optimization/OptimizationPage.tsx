import React from 'react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import { Zap, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function OptimizationPage() {
  const { optimizationDecision, battery, solar, totalLoad, gridDependency, renewableShare } = useEnergyStore();

  const steps = [
    { label: 'Collect Telemetry', status: 'done', desc: 'Solar, battery, load, weather — 3s polling' },
    { label: 'Run Forecast', status: 'done', desc: 'RandomForest solar + HistGB demand — 15min window' },
    { label: 'Detect Anomalies', status: 'done', desc: 'IsolationForest + rule-based checks' },
    { label: 'Evaluate Rules', status: 'done', desc: 'Tariff window, temperature, cloud forecast, surplus' },
    { label: 'Make Decision', status: 'active', desc: optimizationDecision?.action || 'HOLD' },
    { label: 'Publish Recommendation', status: 'active', desc: 'Sent to UI and WebSocket clients' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Zap size={20} color="var(--color-primary)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>AI Optimization Engine</h2>
        <div className="live-indicator"><div className="dot" />ACTIVE</div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <KPICard label="Grid Dependency" value={gridDependency} unit="%" color={gridDependency < 20 ? 'var(--color-primary)' : 'var(--color-solar)'} />
        <KPICard label="Renewable Share" value={renewableShare} unit="%" color="var(--color-primary)" />
        <KPICard label="Optimization Action" value={optimizationDecision?.action || 'HOLD'} unit="" />
        <KPICard label="Confidence" value={optimizationDecision?.confidence || 0} unit="%" color="var(--color-secondary)" />
      </div>

      {optimizationDecision && (
        <GlassCard glow="primary">
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Current Optimization Decision</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{optimizationDecision.action}</div>
            <div style={{ padding: '3px 10px', background: 'rgba(32,214,123,0.1)', border: '1px solid rgba(32,214,123,0.2)', borderRadius: 20, fontSize: '0.72rem', color: 'var(--color-primary)' }}>
              Confidence: {optimizationDecision.confidence}%
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 12px' }}>{optimizationDecision.reason}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>Inputs:</div>
            {optimizationDecision.inputs.map((inp, i) => (
              <span key={i} style={{ background: 'rgba(32,214,123,0.07)', border: '1px solid rgba(32,214,123,0.15)', borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', color: 'var(--color-primary)' }}>{inp}</span>
            ))}
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            📊 <strong style={{ color: 'var(--text-primary)' }}>Expected Impact:</strong> {optimizationDecision.expectedImpact}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 14 }}>OPTIMIZATION PIPELINE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step.status === 'done' ? 'rgba(32,214,123,0.2)' : 'rgba(255,184,77,0.2)', flexShrink: 0 }}>
                {step.status === 'done' ? <CheckCircle size={13} color="var(--color-primary)" /> : <Clock size={13} color="var(--color-solar)" />}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{step.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
