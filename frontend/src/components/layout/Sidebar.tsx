import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Globe, Sun, Battery, BarChart3,
  Lightbulb, Cloud, ShieldAlert,
  Cpu, Leaf, DollarSign, FileText,
  Bot
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Command Center' },
  { to: '/digital-twin', icon: Globe,            label: 'Digital Twin' },
  { to: '/solar',        icon: Sun,              label: 'Solar Intelligence' },
  { to: '/battery',      icon: Battery,          label: 'Battery Intelligence' },
  { to: '/consumption',  icon: BarChart3,        label: 'Consumption' },
  { to: '/weather',      icon: Cloud,            label: 'Weather Forecast' },
  { to: '/recommendations', icon: Lightbulb,     label: 'Recommendations' },
  { to: '/early-warning', icon: ShieldAlert,     label: 'Early Warning System' },
  { to: '/iot',          icon: Cpu,              label: 'IoT Devices' },
  { to: '/carbon',       icon: Leaf,             label: 'Carbon' },
  { to: '/cost',         icon: DollarSign,       label: 'Cost' },
  { to: '/reports',      icon: FileText,         label: 'Reports' },
  { to: '/ai-models',    icon: Bot,              label: 'Model Center' },
];

export default function Sidebar() {
  const sidebarOpen = useUIStore(s => s.sidebarOpen);

  return (
    <motion.nav
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        background: 'rgba(10, 11, 20, 0.99)',
        borderRight: '1px solid rgba(99, 102, 241, 0.12)',
        zIndex: 200,
        overflowX: 'hidden', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        backdropFilter: 'blur(18px)',
      }}
      className="styled-scroll"
    >
      {/* Brand header */}
      <div style={{
        padding: sidebarOpen ? '18px 16px' : '18px 0',
        display: 'flex', alignItems: 'center',
        gap: 10, justifyContent: sidebarOpen ? 'flex-start' : 'center',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(99,102,241,0.3)',
        }}>
          <img src="/logo.png" alt="OORJA SYNC" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <div style={{
                fontFamily: 'Space Grotesk', fontWeight: 700,
                fontSize: '0.9rem', lineHeight: 1.1,
                color: 'var(--text-primary)',
              }}>OORJA SYNC</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Energy Intelligence
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }} className="styled-scroll">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: sidebarOpen ? '8px 16px' : '8px 0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              textDecoration: 'none',
              color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
              transition: 'all 0.18s',
              marginBottom: 1,
            })}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  style={{
                    flexShrink: 0,
                    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                  }}
                />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 600 : 400,
                        whiteSpace: 'nowrap', overflow: 'hidden',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
}
