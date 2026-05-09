import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import s from '../styles/mica.module.css';

export default function EventLogTerminal({ eventLog }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [eventLog]);

  return (
    <div className={`rounded-md overflow-hidden border border-white/[0.06]`}>
      {/* Terminal title bar */}
      <div className={`${s.terminalTitlebar} flex justify-between items-center px-2 py-1`}>
        <span className="text-[9px] text-[#888] font-mono">C:\Windows\System32\vmm.exe</span>
        <span className="text-[9px] text-[#666] tracking-[3px]">─ □ ✕</span>
      </div>
      {/* Terminal body */}
      <div
        ref={scrollRef}
        className={`${s.terminalBody} text-[10px] text-[#b0b0b0] flex flex-col gap-px max-h-[180px] overflow-y-auto p-1.5 px-2`}
      >
        <AnimatePresence initial={false}>
          {eventLog.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={`py-0.5 px-1 rounded-[3px] bg-white/[0.02] ${
                entry.type === 'fault' ? 'text-[var(--color-miss)]' :
                entry.type === 'hit' ? 'text-[var(--color-hit)]' : ''
              }`}
            >
              {entry.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
