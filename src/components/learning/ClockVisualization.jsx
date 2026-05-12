import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import s from '../../styles/mica.module.css';

const DEFAULT_PAGES = [
  { page: 3, refBit: 1 },
  { page: 7, refBit: 0 },
  { page: 1, refBit: 1 },
  { page: 4, refBit: 0 },
  { page: 2, refBit: 1 },
  { page: 5, refBit: 0 },
];

const REF_STRING = [3, 7, 8, 1, 4, 9, 2, 5, 3, 7];

export default function ClockVisualization({ compact = false }) {
  const frameCount = 6;
  const [slots, setSlots] = useState(DEFAULT_PAGES);
  const [pointer, setPointer] = useState(0);
  const [refString] = useState(REF_STRING);
  const [refIdx, setRefIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [animatingSlot, setAnimatingSlot] = useState(null);
  const [animType, setAnimType] = useState(null); // 'hit' | 'evict' | 'skip'
  const [isScanning, setIsScanning] = useState(false);
  const [scanPos, setScanPos] = useState(0);

  const radius = compact ? 90 : 120;
  const cx = compact ? 130 : 160;
  const cy = compact ? 130 : 160;
  const size = compact ? 260 : 320;

  const getSlotPos = (index) => {
    const angle = (index / frameCount) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const getPointerAngle = () => {
    return (pointer / frameCount) * 360 - 90;
  };

  const doStep = useCallback(() => {
    // If in scanning phase, continue scanning
    if (isScanning) {
      const requestedPage = refString[refIdx];
      let newScanPos = scanPos;
      let slotsClone = [...slots.map(sl => ({ ...sl }))];

      // Check current position for ref bit 0
      if (slotsClone[newScanPos].refBit === 0) {
        // EVICT - found a victim
        const evictedPage = slotsClone[newScanPos].page;
        slotsClone[newScanPos] = { page: requestedPage, refBit: 1 };
        setSlots(slotsClone);
        setPointer((newScanPos + 1) % frameCount);
        setAnimatingSlot(newScanPos);
        setAnimType('evict');
        setLog(prev => [...prev.slice(-8), {
          msg: `Page ${requestedPage} → FAULT (evicted page ${evictedPage} at slot ${newScanPos})`,
          type: 'fault'
        }]);
        setRefIdx(prev => prev + 1);
        setIsScanning(false);
        setScanPos(0);
        setTimeout(() => { setAnimatingSlot(null); setAnimType(null); }, 600);
        return;
      } else {
        // Second chance - reset ref bit and move to next
        slotsClone[newScanPos].refBit = 0;
        setSlots(slotsClone);
        setPointer(newScanPos);
        setAnimatingSlot(newScanPos);
        setAnimType('skip');
        setLog(prev => [...prev.slice(-8), {
          msg: `Pointer at slot ${newScanPos}: ref bit 1 → reset to 0 (second chance)`,
          type: 'skip'
        }]);
        const nextPos = (newScanPos + 1) % frameCount;
        setScanPos(nextPos);
        setTimeout(() => { setAnimatingSlot(null); setAnimType(null); }, 600);
        return;
      }
    }

    // Normal step (not scanning)
    if (refIdx >= refString.length) return;

    const requestedPage = refString[refIdx];
    const hitIdx = slots.findIndex(sl => sl.page === requestedPage);

    if (hitIdx !== -1) {
      // HIT — set ref bit to 1
      setSlots(prev => prev.map((sl, i) => i === hitIdx ? { ...sl, refBit: 1 } : sl));
      setAnimatingSlot(hitIdx);
      setAnimType('hit');
      setLog(prev => [...prev.slice(-8), { msg: `Page ${requestedPage} → HIT (ref bit set to 1)`, type: 'hit' }]);
      setRefIdx(prev => prev + 1);
      setTimeout(() => { setAnimatingSlot(null); setAnimType(null); }, 600);
      return;
    }

    // FAULT — start scanning for ref bit 0
    setIsScanning(true);
    setScanPos(pointer);
  }, [refIdx, refString, slots, pointer, frameCount, isScanning, scanPos]);

  useEffect(() => {
    if (!running) return;
    if (refIdx >= refString.length && !isScanning) { setRunning(false); return; }
    const timer = setTimeout(doStep, 1200);
    return () => clearTimeout(timer);
  }, [running, refIdx, doStep, refString.length, isScanning]);

  const handleReset = () => {
    setRunning(false);
    setSlots(DEFAULT_PAGES);
    setPointer(0);
    setRefIdx(0);
    setLog([]);
    setAnimatingSlot(null);
    setAnimType(null);
    setIsScanning(false);
    setScanPos(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Reference String Display */}
      <div className="flex flex-wrap gap-1 items-center justify-center">
        <span className="text-[9px] uppercase tracking-[2px] text-[var(--win-text-secondary)] font-semibold mr-2">
          Ref String:
        </span>
        {refString.map((p, i) => (
          <span
            key={i}
            className={`text-[11px] font-mono px-1.5 py-0.5 rounded transition-all duration-300 ${
              i < refIdx
                ? 'bg-white/[0.03] text-white/30 line-through'
                : i === refIdx
                ? 'bg-[var(--win-accent)]/20 text-[var(--win-accent)] font-bold ring-1 ring-[var(--win-accent)]/40'
                : 'bg-white/[0.05] text-white/60'
            }`}
          >
            {p}
          </span>
        ))}
      </div>

      {/* SVG Clock */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={radius + 25} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={radius - 25} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

        {/* Connection lines */}
        {slots.map((_, i) => {
          const pos = getSlotPos(i);
          return (
            <line
              key={`line-${i}`}
              x1={cx} y1={cy} x2={pos.x} y2={pos.y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          );
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="4" fill="rgba(255,255,255,0.15)" />

        {/* Clock pointer */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={getSlotPos(isScanning ? scanPos : pointer).x}
          y2={getSlotPos(isScanning ? scanPos : pointer).y}
          stroke="var(--win-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{
            x2: getSlotPos(isScanning ? scanPos : pointer).x,
            y2: getSlotPos(isScanning ? scanPos : pointer).y,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(96,205,255,0.5))' }}
        />

        {/* Pointer tip glow */}
        <motion.circle
          r="5"
          fill="var(--win-accent)"
          animate={{
            cx: getSlotPos(isScanning ? scanPos : pointer).x,
            cy: getSlotPos(isScanning ? scanPos : pointer).y,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(96,205,255,0.6))' }}
        />

        {/* Page slots */}
        {slots.map((slot, i) => {
          const pos = getSlotPos(i);
          const isAnimating = animatingSlot === i;
          const currentPointerPos = isScanning ? scanPos : pointer;
          const isPointer = currentPointerPos === i;
          let fillColor = 'rgba(40,40,40,0.8)';
          let strokeColor = 'rgba(255,255,255,0.1)';

          if (isAnimating && animType === 'hit') {
            fillColor = 'rgba(108,203,95,0.25)';
            strokeColor = 'rgba(108,203,95,0.6)';
          } else if (isAnimating && animType === 'evict') {
            fillColor = 'rgba(255,107,107,0.25)';
            strokeColor = 'rgba(255,107,107,0.6)';
          } else if (isPointer) {
            strokeColor = 'rgba(96,205,255,0.4)';
          }

          return (
            <g key={`slot-${i}`}>
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={compact ? 22 : 28}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="1.5"
                animate={{
                  scale: isAnimating ? [1, 1.15, 1] : 1,
                  fill: fillColor,
                  stroke: strokeColor,
                }}
                transition={{ duration: 0.4 }}
              />
              {/* Page number */}
              <text
                x={pos.x}
                y={pos.y - 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={slot.page >= 0 ? '#e4e4e4' : '#555'}
                fontSize={compact ? '11' : '13'}
                fontWeight="600"
                fontFamily="'JetBrains Mono', monospace"
              >
                {slot.page >= 0 ? slot.page : '—'}
              </text>
              {/* Ref bit */}
              <text
                x={pos.x}
                y={pos.y + (compact ? 11 : 14)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={slot.refBit === 1 ? '#6ccb5f' : '#ff6b6b'}
                fontSize={compact ? '8' : '9'}
                fontWeight="700"
                fontFamily="'JetBrains Mono', monospace"
              >
                R={slot.refBit}
              </text>
              {/* Slot index label */}
              <text
                x={pos.x}
                y={pos.y - (compact ? 28 : 35)}
                textAnchor="middle"
                fill="rgba(255,255,255,0.25)"
                fontSize="8"
                fontFamily="Inter, sans-serif"
              >
                F{i}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setRunning(r => !r)}
          disabled={refIdx >= refString.length && !isScanning}
          className={`${s.fluentBtnPrimary} px-3 py-1.5 rounded-md text-[11px] font-semibold text-white cursor-pointer flex items-center gap-1.5 disabled:opacity-40`}
        >
          {running ? <Pause size={12} /> : <Play size={12} />}
          {running ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={doStep}
          disabled={running || (refIdx >= refString.length && !isScanning)}
          className={`${s.fluentBtn} px-3 py-1.5 rounded-md text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center gap-1.5 disabled:opacity-40`}
        >
          <SkipForward size={12} /> Step
        </button>
        <button
          onClick={handleReset}
          className={`${s.fluentBtn} px-3 py-1.5 rounded-md text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center gap-1.5 hover:!border-[var(--color-miss)] hover:!text-[var(--color-miss)]`}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className={`${s.terminalBody} w-full max-h-[120px] overflow-y-auto rounded-lg p-3`}>
          {log.map((l, i) => (
            <div key={i} className="text-[10px] font-mono leading-relaxed" style={{
              color: l.type === 'hit' ? '#6ccb5f' : l.type === 'fault' ? '#ff6b6b' : '#8b95a5'
            }}>
              {l.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
