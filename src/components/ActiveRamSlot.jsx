import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getApp } from '../utils/algorithms.js';
import s from '../styles/mica.module.css';

export default function ActiveRamSlot({ frameIdx, appId, animType, onAnimEnd }) {
  const app = appId > 0 ? getApp(appId) : null;
  const isEmpty = !app;

  useEffect(() => {
    if (animType) {
      const t = setTimeout(() => onAnimEnd?.(), 600);
      return () => clearTimeout(t);
    }
  }, [animType, onAnimEnd]);

  // Determine border/shadow based on anim type
  const hitStyle = animType === 'hit' ? {
    boxShadow: '0 0 28px rgba(108,203,95,0.25)',
    borderColor: 'var(--color-hit)',
  } : {};

  const missStyle = animType === 'fault' ? {
    boxShadow: '0 0 18px rgba(255,107,107,0.25)',
    borderColor: 'var(--color-miss)',
  } : {};

  return (
    <motion.div
      layout
      className={`${s.ramSlot} w-[114px] h-[132px] rounded-lg flex flex-col items-center justify-center gap-1.5 relative overflow-hidden ${isEmpty ? 'border-dashed !border-white/[0.06]' : ''}`}
      style={{
        background: app?.bg || undefined,
        borderColor: app?.border || undefined,
        ...hitStyle,
        ...missStyle,
      }}
      animate={animType === 'fault' ? { x: [0, -3, 3, -3, 0] } : {}}
      transition={animType === 'fault' ? { duration: 0.4 } : {}}
    >
      {/* Frame label */}
      <span className="absolute top-1.5 right-2 text-[9px] text-[var(--win-text-secondary)] font-mono">
        F{frameIdx}
      </span>

      {app ? (
        <motion.div
          key={appId}
          initial={{ opacity: 0, y: animType === 'fault' ? -28 : 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-1.5"
        >
          <app.Icon size={30} style={{ color: app.color }} />
          <span className="text-[10px] font-semibold tracking-wide" style={{ color: app.color }}>
            {app.name}
          </span>
        </motion.div>
      ) : (
        <span className="text-white/[0.08] text-[26px]">⬜</span>
      )}
    </motion.div>
  );
}
