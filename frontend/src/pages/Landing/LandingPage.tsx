import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSceneStore } from '../../store/sceneStore';
import { useEnergyStore } from '../../store/energyStore';

// ── Floating metric panel ──────────────────────────────────────────────
function MetricPanel({ label, value, unit, color = 'var(--color-primary)', delay = 0 }: {
  label: string; value: string | number; unit: string; color?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.18 } }}
      style={{
        background: 'rgba(20, 25, 32, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 12,
        padding: '14px 18px',
        minWidth: 130,
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Space Grotesk', color, lineHeight: 1 }}>
          {value}
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{unit}</span>
      </div>
    </motion.div>
  );
}

// ── Animated energy grid background ────────────────────────────────────
function EnergyGrid() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Subtle grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(14,17,23,0.7) 100%)',
      }} />
      {/* Animated accent orbs — CSS only, no JS */}
      <div style={{
        position: 'absolute', width: 600, height: 600,
        borderRadius: '50%', top: '-200px', left: '10%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500,
        borderRadius: '50%', bottom: '-150px', right: '5%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />
    </div>
  );
}

// ── Bottom live status strip ────────────────────────────────────────────
function LiveStrip({ solar, load, battery, grid }: { solar: number; load: number; battery: number; grid: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24,
      background: 'rgba(20,25,32,0.85)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
      padding: '10px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <div className="live-indicator"><div className="dot" />LIVE</div>
      {[
        { label: 'Solar', value: `${solar} kW`, color: 'var(--color-solar)' },
        { label: 'Load',  value: `${load} kW`,  color: 'var(--text-primary)' },
        { label: 'Battery', value: `${battery}%`, color: 'var(--color-primary)' },
        { label: 'Grid', value: `${grid}%`, color: 'var(--color-grid)' },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{label}:</span>
          <span style={{ color, fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.85rem' }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ── LANDING PAGE ──────────────────────────────────────────────────────
//   No Three.js / WebGL — pure CSS + Framer Motion
//   Startup: immediate dark bg → 4s animate → enter app
// ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { introComplete, skipIntro } = useSceneStore();
  const { solar, battery, totalLoad, gridDependency, renewableShare } = useEnergyStore();

  // Auto-advance after 5s (was 13s with 3D models)
  useEffect(() => {
    if (introComplete) return;
    const t = setTimeout(() => skipIntro(), 5000);
    return () => clearTimeout(t);
  }, [introComplete, skipIntro]);

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
      background: 'var(--bg-primary)',
    }}>
      <EnergyGrid />

      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px', zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
          }}>
            <img src="/logo.png" alt="OORJA SYNC" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>OORJA SYNC</div>
            <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)' }}>Energy Intelligence Platform</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: 8, padding: '6px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-saffron)', letterSpacing: '0.1em' }}>SMART INDIA HACKATHON</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-saffron)' }}>SIH 2026</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>SYSTEM ONLINE</span>
          </div>
          <button
            onClick={() => { skipIntro(); navigate('/dashboard'); }}
            style={{
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: 6, padding: '6px 14px',
              color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Skip Intro
          </button>
        </div>
      </motion.div>

      {/* ── Hero text ── */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        textAlign: 'center', zIndex: 10, width: '100%', maxWidth: 800, padding: '0 32px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.22em', color: 'var(--color-primary)', marginBottom: 18, fontWeight: 600, textTransform: 'uppercase' }}>
            Smart India Hackathon 2026 · Energy Tech
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
            fontFamily: 'Space Grotesk', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20,
            background: 'linear-gradient(135deg, #F1F5F9 0%, var(--color-primary) 60%, var(--color-secondary) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Synchronizing India's<br />Energy Future
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}>
            An intelligent digital twin that predicts renewable generation,
            understands demand, optimizes storage, and turns energy data into explainable decisions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(59,130,246,0.25)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { skipIntro(); navigate('/dashboard'); }}
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2))',
              border: '1px solid rgba(59,130,246,0.5)', borderRadius: 10,
              padding: '13px 32px', color: 'var(--color-primary)',
              fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Space Grotesk',
              letterSpacing: '0.05em', cursor: 'pointer',
            }}
          >
            ⚡ ENTER COMMAND CENTER
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { skipIntro(); navigate('/digital-twin'); }}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 10, padding: '13px 32px', color: 'var(--text-secondary)',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            🌐 Explore Digital Twin
          </motion.button>
        </motion.div>
      </div>

      {/* ── Floating metrics (right) ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        style={{
          position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: 12, zIndex: 10,
        }}
      >
        <MetricPanel label="Live Energy"     value={solar.currentPower} unit="kW"  color="var(--color-solar)"    delay={1.0} />
        <MetricPanel label="Renewable Share" value={renewableShare}     unit="%"   color="var(--color-primary)"  delay={1.15} />
        <MetricPanel label="Battery SOC"     value={battery.soc}        unit="%"   color="var(--color-secondary)" delay={1.3} />
        <MetricPanel label="Grid Import"     value={gridDependency}     unit="%"   color="var(--color-grid)"     delay={1.45} />
      </motion.div>

      {/* ── Bottom live strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
      >
        <LiveStrip solar={solar.currentPower} load={totalLoad} battery={battery.soc} grid={Math.round(gridDependency)} />
      </motion.div>

      {/* Progress bar — matches 5s auto-advance */}
      {!introComplete && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, ease: 'linear' }}
          style={{
            position: 'absolute', bottom: 0, left: 0,
            height: 2, width: '100%',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            transformOrigin: 'left', zIndex: 20, opacity: 0.4,
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ delay: 1.5 }}
        style={{ position: 'absolute', bottom: 12, right: 32, fontSize: '0.63rem', color: 'var(--text-muted)', zIndex: 10 }}
      >
        SIMULATED DEMO · Not real hardware
      </motion.div>
    </div>
  );
}
