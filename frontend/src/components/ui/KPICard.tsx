import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  color?: string;
  icon?: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical' | 'good';
  onClick?: () => void;
  small?: boolean;
}

// Smooth counter animation
function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [displayed, setDisplayed] = useState(value);
  useEffect(() => {
    const steps = 10;
    const diff = value - displayed;
    let step = 0;
    const id = setInterval(() => {
      step++;
      setDisplayed(prev => prev + diff / steps);
      if (step >= steps) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <>{displayed.toFixed(decimals)}</>;
}

const statusColors: Record<string, string> = {
  normal:   'var(--text-primary)',
  warning:  'var(--color-solar)',
  critical: 'var(--color-critical)',
  good:     'var(--color-success)',
};

export default function KPICard({
  label, value, unit = '', trend, trendLabel, color, icon,
  status = 'normal', onClick, small = false,
}: KPICardProps) {
  const valueColor = color || statusColors[status];

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      whileHover={onClick
        ? { scale: 1.02, y: -2, transition: { duration: 0.15 } }
        : undefined
      }
      style={{
        /* Premium navy metric card matching reference */
        background: 'rgba(16, 17, 30, 0.9)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(99, 102, 241, 0.1)',
        borderRadius: 10,
        padding: small ? '10px 14px' : '14px 18px',
        cursor: onClick ? 'pointer' : 'default',
        minWidth: small ? 118 : 148,
        flexShrink: 0,
        boxShadow: '0 2px 12px rgba(0,0,0,0.38)',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        {icon && <div style={{ color: valueColor, opacity: 0.75, flexShrink: 0 }}>{icon}</div>}
        <span style={{
          fontSize: '0.63rem', fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.07em', textTransform: 'uppercase',
        }}>
          {label}
        </span>
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontSize: small ? '1.35rem' : '1.75rem',
          fontWeight: 700,
          fontFamily: 'Space Grotesk',
          color: valueColor,
          lineHeight: 1,
        }}>
          {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
        </span>
        {unit && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          {trend > 0
            ? <TrendingUp  size={11} color="var(--color-success)"  />
            : trend < 0
            ? <TrendingDown size={11} color="var(--color-critical)" />
            : <Minus size={11} color="var(--text-muted)" />
          }
          <span style={{
            fontSize: '0.68rem', fontWeight: 500,
            color: trend > 0 ? 'var(--color-success)' : trend < 0 ? 'var(--color-critical)' : 'var(--text-muted)',
          }}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
          {trendLabel && (
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{trendLabel}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
