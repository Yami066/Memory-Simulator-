import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { silentRun } from '../utils/algorithms.js';
import s from '../styles/mica.module.css';

export default function BeladyBanner({ refString, frameCount, trigger }) {
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!trigger || !refString.length) return;
    const fc = Math.max(1, Math.min(6, frameCount));
    if (fc >= 6) return;
    const rs = [...refString];
    const fN = silentRun(rs, fc, 'FIFO');
    const fN1 = silentRun(rs, fc + 1, 'FIFO');
    const isAnomaly = fN1 >= fN;
    setResult({ isAnomaly, fc, fN, fN1 });
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <AnimatePresence>
      {visible && result && (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`${result.isAnomaly ? s.beladyBanner : `${s.beladyBanner} ${s.beladyPass}`}
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200]
            py-5 px-8 rounded-lg text-[13px] text-center max-w-[440px]
            border-2 ${result.isAnomaly ? 'border-[var(--color-miss)] text-[var(--color-miss)]' : 'border-[var(--color-hit)] text-[var(--color-hit)]'}`}
        >
          <div className="text-[38px] mb-2">{result.isAnomaly ? '⚠️' : '✅'}</div>
          <div className="text-[15px] font-bold mb-2 tracking-wide">
            {result.isAnomaly ? "SYSTEM ALERT: BELADY'S ANOMALY" : 'SYSTEM CHECK PASSED'}
          </div>
          {result.isAnomaly ? (
            <div>
              FIFO with {result.fc} frames = <b>{result.fN}</b> faults<br />
              FIFO with {result.fc + 1} frames = <b>{result.fN1}</b> faults<br /><br />
              More frames did NOT reduce faults!
            </div>
          ) : (
            <div>
              No Belady's Anomaly detected.<br />
              FIFO: {result.fc} frames = {result.fN} faults, {result.fc + 1} frames = {result.fN1} faults
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
