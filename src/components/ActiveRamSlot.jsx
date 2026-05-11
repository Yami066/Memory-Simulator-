import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getApp } from '../utils/algorithms.js';

export default function ActiveRamSlot({ frameIdx, appId, animType, onAnimEnd }) {
  const app = appId > 0 ? getApp(appId) : null;
  const isEmpty = !app;

  useEffect(() => {
    if (animType) {
      const t = setTimeout(() => onAnimEnd?.(), 600);
      return () => clearTimeout(t);
    }
  }, [animType, onAnimEnd]);

  // Border/glow per animation type
  const hitStyle = animType === 'hit' ? {
    borderColor: 'var(--win-accent)',
    boxShadow: '0 0 16px rgba(0,229,255,0.20)',
  } : {};

  const missStyle = animType === 'fault' ? {
    borderColor: '#C0392B',
    boxShadow: '0 0 16px rgba(192,57,43,0.18)',
  } : {};

  const baseStyle = {
    background: isEmpty ? 'var(--win-surface2)' : 'var(--win-surface)',
    border: `1px solid ${isEmpty ? 'var(--win-border)' : (app?.border || 'var(--win-border)')}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
    ...hitStyle,
    ...missStyle,
  };

  return (
    <motion.div
      layout
      className={`w-[150px] h-[174px] rounded-2xl flex flex-col items-center justify-center gap-2.5 relative overflow-hidden transition-shadow
        ${isEmpty ? 'border-dashed' : ''}`}
      style={baseStyle}
      animate={animType === 'fault' ? { x: [0, -4, 4, -4, 0] } : {}}
      transition={animType === 'fault' ? { duration: 0.4 } : {}}
    >
      {/* Frame label */}
      <span className="absolute top-2.5 right-3 text-xs font-mono font-bold tracking-wider" style={{ color: 'var(--win-text-secondary)' }}>
        F{frameIdx}
      </span>

      {app ? (
        <motion.div
          key={appId}
          initial={{ opacity: 0, y: animType === 'fault' ? -34 : 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 34 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-2.5 relative w-full h-full justify-center"
        >
          {/* Page ID badge */}
          <span
            className="absolute top-2 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono shadow"
            style={{ background: 'var(--win-nav-active)', color: 'var(--win-text)', border: '1px solid var(--win-border)' }}
          >
            {app.id}
          </span>
          <app.Icon size={52} style={{ color: app.color }} className="drop-shadow" />
          <span className="text-sm font-bold tracking-wide mt-1" style={{ color: app.color }}>
            {app.name}
          </span>
        </motion.div>
      ) : (
        /* Empty slot indicator */
        <span className="text-[var(--win-text-secondary)] text-4xl select-none">—</span>
      )}
    </motion.div>
  );
}
