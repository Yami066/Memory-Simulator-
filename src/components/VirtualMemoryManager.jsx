import { getApp } from '../utils/algorithms.js';
import { Minus, Square, X, Cpu } from 'lucide-react';
import ActiveRamSlot from './ActiveRamSlot.jsx';
import EventLogTerminal from './EventLogTerminal.jsx';
import PageTable from './PageTable.jsx';
import HardwareGrid from './HardwareGrid.jsx';
import s from '../styles/mica.module.css';

export default function VirtualMemoryManager({
  state, setAlgo, setSpeed, setFrameCount,
  runSimulation, stepOnce, reset, generateRandom,
  showChart, setShowChart, showBelady, setShowBelady,
  clearAnims
}) {
  const {
    refString, frames, frameCount, algo, speed,
    faults, hits, stepIndex, running, paused,
    eventLog, pageTable, slotAnims
  } = state;

  const accesses = faults + hits;
  const faultRate = accesses ? (faults / accesses * 100).toFixed(1) + '%' : '0%';
  const hasStarted = stepIndex > 0;

  let runLabel = '▶ RUN';
  if (running && !paused) runLabel = '⏸ PAUSE';
  else if (running && paused) runLabel = '▶ RESUME';

  const stats = [
    { label: 'Accesses', value: accesses, color: 'var(--win-accent)' },
    { label: 'Faults', value: faults, color: 'var(--color-miss)' },
    { label: 'Hits', value: hits, color: 'var(--color-hit)' },
    { label: 'Fault Rate', value: faultRate, color: 'var(--win-accent)' },
    { label: 'Step', value: `${stepIndex}/${refString.length}`, color: 'var(--win-accent)' },
  ];

  return (
    <div
      className={`${s.appWindow} absolute left-1/2 -translate-x-1/2 top-[calc(50%-24px)] -translate-y-1/2
        w-[min(1300px,96vw)] h-[min(720px,calc(100vh-var(--taskbar-h)-16px))]
        rounded-xl flex flex-col overflow-hidden z-10`}
    >

      {/* ── Title Bar ── */}
      <div className={`${s.titleBar} h-9 min-h-9 flex items-center justify-between pl-4 pr-0 shrink-0`}>
        <div className="flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" fill="#0078D4" />
            <rect x="9" y="1" width="6" height="6" rx="1" fill="#00B4D8" />
            <rect x="1" y="9" width="6" height="6" rx="1" fill="#00B4D8" />
            <rect x="9" y="9" width="6" height="6" rx="1" fill="#0078D4" />
          </svg>
          <span className="text-[11px] text-[var(--win-text-secondary)] tracking-widest font-medium">
            Virtual Memory Manager
          </span>
          <span className="ml-2 text-[9px] uppercase tracking-[2px] text-[var(--win-accent)] bg-[var(--win-accent)]/10 border border-[var(--win-accent)]/20 px-2 py-0.5 rounded-full">
            {algo}
          </span>
        </div>
        {/* Stats pills */}
        <div className="hidden md:flex items-center gap-1 mx-auto">
          {stats.map(st => (
            <div key={st.label} className="flex items-center gap-1 rounded px-2 py-0.5 bg-white/[0.04] border border-white/[0.06]">
              <span className="text-[8px] uppercase tracking-wider text-[var(--win-text-secondary)]">{st.label}</span>
              <span className="text-[11px] font-bold font-mono" style={{ color: st.color }}>{st.value}</span>
            </div>
          ))}
        </div>
        {/* Window controls */}
        <div className="flex h-full">
          <button className="w-[46px] h-full bg-transparent border-none text-[var(--win-text-secondary)] cursor-pointer hover:bg-white/[0.08] transition-colors flex items-center justify-center"><Minus size={12} /></button>
          <button className="w-[46px] h-full bg-transparent border-none text-[var(--win-text-secondary)] cursor-pointer hover:bg-white/[0.08] transition-colors flex items-center justify-center"><Square size={10} /></button>
          <button className="w-[46px] h-full bg-transparent border-none text-[var(--win-text-secondary)] cursor-pointer hover:bg-[#c42b1c] hover:text-white transition-colors flex items-center justify-center"><X size={12} /></button>
        </div>
      </div>

      {/* ── Two-column body (responsive) ── */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden min-h-0">

        {/* ════ LEFT COLUMN — OS View ════ */}
        <div className="flex flex-col flex-1 min-w-0 xl:border-r border-white/[0.07] overflow-hidden">

          {/* Activity Queue */}
          <div className="shrink-0 px-5 pt-4 pb-3 border-b border-white/[0.06]">
            <p className="text-[9px] uppercase tracking-[2px] text-[var(--win-text-secondary)] font-semibold mb-2">
              Activity Queue
            </p>
            <div className="flex gap-1 flex-wrap">
              {refString.length === 0 && (
                <span className="text-[10px] text-[var(--win-text-secondary)] italic">
                  Click apps on the taskbar to queue them…
                </span>
              )}
              {refString.map((id, i) => {
                const app = getApp(id);
                const isDone = i < stepIndex;
                const isActive = i === stepIndex;
                return (
                  <div
                    key={i}
                    title={app?.name || 'Page ' + id}
                    className={`w-[32px] h-[28px] rounded-md flex items-center justify-center ${s.qChip}
                      ${isDone ? 'opacity-25 scale-[0.82]' : ''}
                      ${isActive ? s.qActive : ''}`}
                    style={app ? { borderColor: app.border } : {}}
                  >
                    {app && <app.Icon size={13} style={{ color: app.color }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active RAM cards */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5 py-4 overflow-y-auto">
            <p className="text-[9px] uppercase tracking-[2px] text-[var(--win-text-secondary)] font-semibold self-start">
              Active RAM
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              {frames.map((appId, i) => (
                <ActiveRamSlot
                  key={i}
                  frameIdx={i}
                  appId={appId}
                  animType={slotAnims[i] || null}
                  onAnimEnd={clearAnims}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className={`${s.controlBar} shrink-0 border-t border-white/[0.07] bg-black/10 px-3 py-2.5`}>
            {/* ─ Config group ─ */}
            <div className={s.controlGroup}>
              <label className="text-[10px] text-[#8b95a5] whitespace-nowrap">Frames</label>
              <input
                type="number"
                value={frameCount}
                min={1} max={6}
                onChange={e => setFrameCount(e.target.value)}
                className={`${s.fluentSelect} rounded-md px-1.5 py-1.5 w-[42px] font-mono text-[11px] text-center text-[var(--win-text)]`}
              />
              <select value={algo} onChange={e => setAlgo(e.target.value)} className={`${s.fluentSelect} rounded-md px-2 py-1.5 text-[11px] text-[var(--win-text)] cursor-pointer`}>
                <option value="FIFO">FIFO</option>
                <option value="LRU">LRU</option>
                <option value="MRU">MRU</option>
                <option value="OPT">Optimal</option>
              </select>
              <select value={speed} onChange={e => setSpeed(e.target.value)} className={`${s.fluentSelect} rounded-md px-2 py-1.5 text-[11px] text-[var(--win-text)] cursor-pointer`}>
                <option value={1500}>Slow</option>
                <option value={900}>Normal</option>
                <option value={400}>Fast</option>
              </select>
            </div>

            <div className={s.controlDivider} />

            {/* ─ Playback group ─ */}
            <div className={s.controlGroup}>
              <button onClick={runSimulation} className={`${s.fluentBtnPrimary} px-3 py-1.5 rounded-md text-[11px] font-semibold text-white cursor-pointer ${running && !paused ? s.runningPulse : ''}`}>
                {runLabel}
              </button>
              <button onClick={() => { if (running) return; stepOnce(); }} className={`${s.fluentBtn} px-3 py-1.5 rounded-md text-[11px] font-medium text-[var(--win-text)] cursor-pointer`}>⏭ STEP</button>
              <button onClick={reset} className={`${s.fluentBtn} px-3 py-1.5 rounded-md text-[11px] font-medium text-[var(--win-text)] cursor-pointer hover:!border-[var(--color-miss)] hover:!text-[var(--color-miss)]`}>⟲ RESET</button>
              <button onClick={generateRandom} className={`${s.fluentBtn} px-3 py-1.5 rounded-md text-[11px] font-medium text-[var(--win-text)] cursor-pointer`}>🎲 RANDOM</button>
            </div>

            <div className={s.controlDivider} />

            {/* ─ Analysis group ─ */}
            <div className={s.controlGroup}>
              <button onClick={() => setShowChart(true)} className={`${s.fluentBtn} px-3 py-1.5 rounded-md text-[11px] font-medium text-[var(--win-text)] cursor-pointer`}>📊 COMPARE</button>
              <button onClick={() => setShowBelady(prev => prev + 1)} className={`${s.fluentBtn} px-3 py-1.5 rounded-md text-[11px] font-medium text-[var(--win-text)] cursor-pointer`}>⚠ BELADY'S</button>
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN — Hardware View (scrollable) ════ */}
        <div className={`${s.rightCol} flex flex-col w-full xl:w-[420px] xl:min-w-[340px] xl:max-w-[44%] overflow-y-auto overflow-x-hidden`}>
          <div className="flex flex-col gap-6 p-4 pr-2">

            {hasStarted ? (
              <>
                {/* Hardware Architecture grid */}
                <div>
                  <p className="text-[9px] uppercase tracking-[2px] text-[var(--win-text-secondary)] font-semibold mb-3">
                    Hardware Architecture
                  </p>
                  <HardwareGrid state={state} />
                </div>

                {/* Page Table */}
                <div>
                  <p className="text-[9px] uppercase tracking-[2px] text-[var(--win-text-secondary)] font-semibold mb-2">
                    Page Table
                  </p>
                  <PageTable frames={frames} pageTable={pageTable} />
                </div>

                {/* Event Log */}
                <div>
                  <p className="text-[9px] uppercase tracking-[2px] text-[var(--win-text-secondary)] font-semibold mb-2">
                    Event Log
                  </p>
                  <EventLogTerminal eventLog={eventLog} />
                </div>
              </>
            ) : (
              /* ── Placeholder state ── */
              <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <div className="rounded-2xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] p-10 text-center max-w-[320px]">
                  <Cpu size={36} className="mx-auto mb-4 text-[var(--win-text-secondary)] opacity-30" />
                  <p className="text-[13px] text-[var(--win-text-secondary)] font-medium mb-1.5">
                    Awaiting Activity Queue…
                  </p>
                  <p className="text-[10px] text-[var(--win-text-secondary)] opacity-60 leading-relaxed">
                    Click apps on the taskbar below to build a reference string, then press
                    <span className="text-[var(--win-accent)] font-semibold"> RUN </span>
                    or
                    <span className="text-[var(--win-accent)] font-semibold"> STEP </span>
                    to initialize the hardware architecture view.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
