import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useEnergyStore } from '../../store/energyStore';
import {
  LayoutDashboard, Globe, Sun, Battery,
  Lightbulb, AlertTriangle, Cloud, ShieldAlert,
  FileText,
  Bot, RefreshCw, X
} from 'lucide-react';

const COMMANDS = [
  { icon: LayoutDashboard, label: 'Open Command Center', to: '/dashboard', group: 'Navigation' },
  { icon: Globe, label: 'Open Digital Twin', to: '/digital-twin', group: 'Navigation' },
  { icon: Sun, label: 'Solar Intelligence', to: '/solar', group: 'Navigation' },
  { icon: Battery, label: 'Battery Intelligence', to: '/battery', group: 'Navigation' },
  { icon: Cloud, label: 'Weather Forecast', to: '/weather', group: 'Navigation' },
  { icon: ShieldAlert, label: 'Early Warning System', to: '/early-warning', group: 'Navigation' },
  { icon: Lightbulb, label: 'Recommendations', to: '/recommendations', group: 'Navigation' },
  { icon: AlertTriangle, label: 'View Anomalies', to: '/early-warning', group: 'Navigation' },
  { icon: FileText, label: 'Reports', to: '/reports', group: 'Navigation' },
  { icon: Bot, label: 'Model Center', to: '/ai-models', group: 'Navigation' },
  { icon: RefreshCw, label: 'Reset Simulation', action: 'reset', group: 'Actions' },
];

export default function CommandPalette() {
  const setOpen = useUIStore(s => s.setCommandPaletteOpen);
  const injectFault = useEnergyStore(s => s.injectFault);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState('');

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const groups = [...new Set(filtered.map(c => c.group))];

  const handleSelect = (cmd: typeof COMMANDS[0]) => {
    if (cmd.to) navigate(cmd.to);
    if (cmd.action === 'reset') injectFault('RESET');
    setOpen(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(4, 8, 10, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 9000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '20vh',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 560,
            background: 'rgba(9, 20, 17, 0.98)',
            border: '1px solid rgba(32, 214, 123, 0.2)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(32,214,123,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(32,214,123,0.1)', gap: 10 }}>
            <span style={{ fontSize: '1rem' }}>⚡</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search commands, pages, actions..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '0.95rem',
              }}
            />
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }} className="styled-scroll">
            {groups.map(group => (
              <div key={group}>
                <div style={{ padding: '8px 16px 4px', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {group}
                </div>
                {filtered.filter(c => c.group === group).map(cmd => (
                  <div
                    key={cmd.label}
                    onClick={() => handleSelect(cmd)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px', cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(32,214,123,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <cmd.icon size={15} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.85rem' }}>{cmd.label}</span>
                  </div>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No commands found for "{query}"
              </div>
            )}
          </div>
          <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(32,214,123,0.1)', fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
            <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>↵</kbd> Select</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>Esc</kbd> Close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
