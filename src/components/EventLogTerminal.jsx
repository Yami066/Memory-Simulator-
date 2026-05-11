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
    <div className="overflow-hidden rounded-none border border-[var(--win-border)] bg-[linear-gradient(180deg,rgba(26,34,54,0.98),rgba(13,18,30,0.98))] shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
      <div className={`${s.terminalTitlebar} flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--win-border)]`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] shadow-[0_0_14px_rgba(0,229,255,0.8)]" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--win-text-secondary)] font-bold">Event log</p>
            <span className="text-[9px] text-[var(--win-text-secondary)] font-mono truncate block">C:\Windows\System32\vmm.exe</span>
          </div>
        </div>
        <span className="text-[9px] text-[var(--win-text-secondary)] tracking-[3px]">─ □ ✕</span>
      </div>

      <div
        ref={scrollRef}
        className={`${s.terminalBody} text-[10px] text-[#b0b0b0] flex flex-col gap-1 max-h-[220px] overflow-y-auto p-3`}
      >
        {eventLog.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--win-border)] bg-[rgba(20,28,46,0.8)] px-4 py-5 text-center text-[var(--win-text-secondary)]">
            No events yet. Start the simulation to see hits and faults here.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {eventLog.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`rounded-xl px-3 py-2 border ${
                  entry.type === 'fault'
                    ? 'border-[rgba(255,107,107,0.22)] bg-[rgba(255,107,107,0.08)] text-[var(--color-miss)]'
                    : entry.type === 'hit'
                    ? 'border-[rgba(0,229,255,0.22)] bg-[rgba(0,229,255,0.08)] text-[var(--color-hit)]'
                    : 'border-[var(--win-border)] bg-[rgba(20,28,46,0.8)] text-[var(--win-text-secondary)]'
                }`}
              >
                {entry.msg}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
