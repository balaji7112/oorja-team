import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glow?: 'primary' | 'solar' | 'secondary' | 'critical' | 'none';
  onClick?: () => void;
  hover?: boolean;
  padding?: number | string;
}

// Refined glow map: subtle coloured rings only (no neon blur)
const glowMap: Record<string, string> = {
  primary:   '0 0 0 1px rgba(99,102,241,0.22)',
  solar:     '0 0 0 1px rgba(245,158,11,0.20)',
  secondary: '0 0 0 1px rgba(59,130,246,0.20)',
  critical:  '0 0 0 1px rgba(239,68,68,0.25)',
  none:      'none',
};

export default function GlassCard({
  children, className = '', style = {},
  glow = 'none', onClick, hover = false, padding = 16,
}: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover
        ? { scale: 1.005, y: -2, transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] } }
        : undefined
      }
      style={{
        /* Deep navy surface — matches reference fintech card style */
        background: 'rgba(18, 19, 34, 0.88)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(99, 102, 241, 0.1)',
        borderRadius: 12,
        padding,
        boxShadow: `0 4px 24px rgba(0,0,0,0.45), ${glowMap[glow]}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
