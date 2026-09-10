import React from 'react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import { Lightbulb, CheckCircle, XCircle } from 'lucide-react';

export default function RecommendationsPage() {
  const { recommendations, approveRecommendation, rejectRecommendation } = useEnergyStore();
  const priorityColor = (p: string) => p === 'HIGH' ? 'var(--color-critical)' : p === 'MEDIUM' ? 'var(--color-solar)' : 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Lightbulb size={20} color="var(--color-solar)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>OORJA Intelligence Recommendations</h2>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{recommendations.filter(r => r.status === 'PENDING').length} pending</span>
      </div>
      {recommendations.length === 0 && (
        <GlassCard><div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No recommendations at this time. System is operating optimally.</div></GlassCard>
      )}
      {recommendations.map(rec => (
        <GlassCard key={rec.id} glow={rec.priority === 'HIGH' ? 'critical' : 'none'} style={{ opacity: rec.status !== 'PENDING' ? 0.6 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: priorityColor(rec.priority), background: `${priorityColor(rec.priority)}20`, padding: '2px 8px', borderRadius: 20 }}>{rec.priority}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Confidence: {rec.confidence}%</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rec.affectedAsset.replace(/_/g, ' ')}</span>
            </div>
            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 20, background: rec.status === 'APPROVED' ? 'rgba(32,214,123,0.15)' : rec.status === 'REJECTED' ? 'rgba(255,90,90,0.15)' : 'rgba(255,255,255,0.06)', color: rec.status === 'APPROVED' ? 'var(--color-primary)' : rec.status === 'REJECTED' ? 'var(--color-critical)' : 'var(--text-muted)' }}>
              {rec.status}
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8 }}>{rec.title}</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px' }}>{rec.reason}</p>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6 }}>INPUTS USED BY AI:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {rec.inputs.map((inp, i) => (
                <span key={i} style={{ background: 'rgba(39,215,208,0.08)', border: '1px solid rgba(39,215,208,0.15)', borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', color: 'var(--color-secondary)' }}>{inp}</span>
              ))}
            </div>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 10 }}>
            <div style={{ height: '100%', width: `${rec.confidence}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>📊 Impact: {rec.projectedImpact}</div>
          {rec.status === 'PENDING' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => approveRecommendation(rec.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(32,214,123,0.12)', border: '1px solid rgba(32,214,123,0.25)', borderRadius: 8, padding: '9px', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                <CheckCircle size={14} /> Approve & Simulate
              </button>
              <button onClick={() => rejectRecommendation(rec.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,90,90,0.08)', border: '1px solid rgba(255,90,90,0.15)', borderRadius: 8, padding: '9px 16px', color: 'var(--color-critical)', cursor: 'pointer', fontSize: '0.8rem' }}>
                <XCircle size={14} /> Reject
              </button>
            </div>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
