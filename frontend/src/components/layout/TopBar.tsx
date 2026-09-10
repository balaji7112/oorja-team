import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useEnergyStore } from '../../store/energyStore';
import { Bell, Search, WifiOff, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{
      color: 'var(--text-secondary)', fontSize: '0.8rem',
      fontFamily: 'Space Grotesk, monospace', fontWeight: 500,
      letterSpacing: '0.04em',
    }}>
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
    </span>
  );
}

export default function TopBar() {
  const { toggleSidebar, notifications, markAllRead, setCommandPaletteOpen } = useUIStore();
  const { mode, systemOnline } = useEnergyStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <header style={{
      height: 56,
      background: 'rgba(11, 12, 20, 0.97)',
      borderBottom: '1px solid rgba(99,102,241,0.12)',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 14, flexShrink: 0,
      backdropFilter: 'blur(18px)',
      zIndex: 100,
    }}>
      {/* Menu toggle */}
      <button
        onClick={toggleSidebar}
        title="Toggle sidebar"
        style={{
          background: 'none', border: 'none',
          color: 'var(--text-secondary)', cursor: 'pointer', padding: 4,
          display: 'flex', alignItems: 'center', borderRadius: 6,
          transition: 'color 0.18s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <Menu size={18} />
      </button>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
          boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
        }}>
          <img src="/logo.png" alt="OORJA SYNC" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span style={{
          fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.92rem',
          color: 'var(--text-primary)', letterSpacing: '-0.01em',
        }}>
          OORJA SYNC
        </span>
      </div>

      {/* SIH Badge */}
      <div style={{
        background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
        borderRadius: 4, padding: '2px 8px',
        fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-saffron)', letterSpacing: '0.08em',
      }}>
        SIH 2026
      </div>

      <div style={{ flex: 1 }} />

      {/* Campus */}
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 500 }}>
        Smart Campus, Bhopal
      </span>

      <div style={{ width: 1, height: 20, background: 'rgba(99,102,241,0.15)' }} />

      {/* System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {systemOnline ? (
          <>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ color: 'var(--color-success)', fontSize: '0.73rem', fontWeight: 600 }}>ONLINE</span>
          </>
        ) : (
          <>
            <WifiOff size={12} color="var(--color-critical)" />
            <span style={{ color: 'var(--color-critical)', fontSize: '0.73rem', fontWeight: 600 }}>OFFLINE</span>
          </>
        )}
      </div>

      <div style={{ width: 1, height: 20, background: 'rgba(99,102,241,0.15)' }} />

      {/* Mode badge */}
      <div style={{
        padding: '2px 8px', borderRadius: 4,
        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
        background: mode === 'DEMO' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
        border: `1px solid ${mode === 'DEMO' ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
        color: mode === 'DEMO' ? 'var(--color-solar)' : 'var(--color-success)',
      }}>
        {mode}
      </div>

      <LiveClock />

      {/* Search — opens command palette */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        title="Search (Ctrl+K)"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 6, padding: '5px 10px',
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem',
          transition: 'border-color 0.18s, color 0.18s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.35)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.15)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
        }}
      >
        <Search size={12} />
        <span>Search</span>
        <span style={{ fontSize: '0.63rem', color: 'var(--text-muted)', marginLeft: 4 }}>Ctrl+K</span>
      </button>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setNotifOpen(v => !v)}
          title={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
          style={{
            position: 'relative', background: 'none', border: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer', padding: 4,
            display: 'flex', alignItems: 'center', transition: 'color 0.18s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <Bell size={16} />
          {unread > 0 && (
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 14, height: 14, borderRadius: '50%',
              background: 'var(--color-critical)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.5rem', fontWeight: 700, color: '#fff',
            }}>{unread}</div>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 8,
                width: 320, maxHeight: 400, overflowY: 'auto',
                background: 'rgba(14, 15, 26, 0.98)',
                border: '1px solid rgba(99,102,241,0.18)',
                borderRadius: 12, zIndex: 1000,
                backdropFilter: 'blur(20px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)',
              }}
              className="styled-scroll"
            >
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid rgba(99,102,241,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  Notifications
                </span>
                <button
                  onClick={markAllRead}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Mark all read
                </button>
              </div>
              {notifications.length === 0 && (
                <div style={{ padding: '20px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                  No notifications
                </div>
              )}
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  background: n.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                      background: n.type === 'critical' ? 'var(--color-critical)'
                        : n.type === 'warning' ? 'var(--color-solar)'
                        : n.type === 'success' ? 'var(--color-success)'
                        : 'var(--color-primary)',
                    }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 2, color: 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
