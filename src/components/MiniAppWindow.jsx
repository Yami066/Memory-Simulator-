import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApp } from '../utils/algorithms.js';
import s from '../styles/mica.module.css';
import { Minus, Square, X } from 'lucide-react';

export default function MiniAppWindow({ appId, frameIdx }) {
  const app = getApp(appId);
  const [pos] = useState(() => {
    // Only spawn in left gutter (2–14%) or right gutter (86–98%)
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const top = 5 + Math.random() * 55; // 5–60% vertically
    const left = side === 'left'
      ? 1 + Math.random() * 12   // 1–13%
      : 86 + Math.random() * 12; // 86–98%

    return { top: `${top}%`, left: `${left}%` };
  });

  if (!app) return null;
  const Icon = app.Icon;

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, y: 18 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.7, opacity: 0, y: 18 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`${s.miniWindow} absolute w-[180px] h-[130px] rounded-lg overflow-hidden flex flex-col pointer-events-auto z-[1]`}
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Mini title bar */}
      <div className={`${s.miniTitlebar} h-[24px] min-h-[24px] flex items-center justify-between px-2`}>
        <div className="flex items-center gap-1.5">
          <Icon size={10} style={{ color: app.color }} />
          <span className="text-[9px] text-[#bbb] font-medium font-sans">{app.name}</span>
        </div>
        <div className="flex">
          <span className="flex items-center justify-center w-[16px] h-[16px] text-[7px] text-[#777]"><Minus size={7} /></span>
          <span className="flex items-center justify-center w-[16px] h-[16px] text-[7px] text-[#777]"><Square size={6} /></span>
          <span className="flex items-center justify-center w-[16px] h-[16px] text-[7px] text-[#777]"><X size={7} /></span>
        </div>
      </div>
      {/* Mini body */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        style={{ background: app.bg }}
      >
        <Icon size={36} style={{ color: app.color, opacity: 0.75 }} className="relative z-[1] drop-shadow-lg" />
      </div>
    </motion.div>
  );
}
