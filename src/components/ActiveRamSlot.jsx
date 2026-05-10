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
    borderColor: '#2D6A4F',
    boxShadow: '0 0 16px rgba(45,106,79,0.20)',
  } : {};

  const missStyle = animType === 'fault' ? {
    borderColor: '#C0392B',
    boxShadow: '0 0 16px rgba(192,57,43,0.18)',
  } : {};

  const baseStyle = {
    background: isEmpty ? '#FAFAF9' : '#FFFFFF',
    border: `1px solid ${isEmpty ? '#D6D1CB' : (app?.border || '#D6D1CB')}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
      <span className="absolute top-2.5 right-3 text-xs font-mono font-bold tracking-wider" style={{ color: '#6B6560' }}>
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
            style={{ background: '#1A1A1A', color: '#FFFFFF', border: '1px solid #D6D1CB' }}
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
        <span className="text-[#D6D1CB] text-4xl select-none">—</span>
      )}
    </motion.div>
  );
}
