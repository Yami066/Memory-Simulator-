import { useState } from 'react';
import { getApp } from '../utils/algorithms.js';
import { Minus, Square, X, Cpu, FileText, Play, Pause, SkipForward, RotateCcw, Shuffle, BarChart2, AlertTriangle, MemoryStick } from 'lucide-react';
import ActiveRamSlot from './ActiveRamSlot.jsx';
import EventLogTerminal from './EventLogTerminal.jsx';
import PageTable from './PageTable.jsx';
import HardwareGrid from './HardwareGrid.jsx';
import SystemDiagnosticModal from './SystemDiagnosticModal.jsx';
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

  const [showDiagnostic, setShowDiagnostic] = useState(false);

  const accesses = faults + hits;
  const faultRate = accesses ? (faults / accesses * 100).toFixed(1) + '%' : '0%';
  const hasStarted = stepIndex > 0;

  // Run icon/label
  const runIcon = running && !paused ? <Pause size={15} /> : <Play size={15} />;
  const runText = running && !paused ? 'PAUSE' : running && paused ? 'RESUME' : 'RUN';

  const stats = [
    { label: 'Accesses', value: accesses,   accent: '#2D6A4F' },
    { label: 'Faults',   value: faults,     accent: '#C0392B' },
    { label: 'Hits',     value: hits,       accent: '#2D6A4F' },
    { label: 'Fault Rate', value: faultRate, accent: '#C0392B' },
    { label: 'Step',     value: `${stepIndex}/${refString.length}`, accent: '#6B6560' },
  ];

  /* ─── shared button class fragments ─── */
  const btnBase = 'flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 ease hover:brightness-[0.93] active:scale-[0.98]';
  const inputCls = 'rounded-[6px] border border-[#2a3a50] bg-[#1a2236] px-3 py-2 text-sm font-medium text-[#ffffff] outline-none focus:border-[#00e5ff] transition-colors';

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-[calc(50%-32px)] -translate-y-1/2
        w-[min(1440px,96vw)] h-[min(880px,calc(100vh-var(--taskbar-h)-24px))]
        rounded-2xl flex flex-col overflow-hidden z-10"
      style={{
        background: 'var(--win-surface)',
        border: '1px solid var(--win-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset',
      }}
    >

      {/* ── Title Bar ── */}
      <div
        className="h-14 min-h-[56px] flex items-center justify-between pl-7 pr-0 shrink-0"
        style={{ background: 'var(--win-surface2)', borderBottom: '1px solid var(--win-border)' }}
      >
        {/* Left: logo + title */}
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" fill="#00e5ff" />
            <rect x="9" y="1" width="6" height="6" rx="1" fill="#00d4e8" />
            <rect x="1" y="9" width="6" height="6" rx="1" fill="#00d4e8" />
            <rect x="9" y="9" width="6" height="6" rx="1" fill="#00e5ff" />
          </svg>
          <span className="text-base font-bold text-[#ffffff] tracking-tight">
            Virtual Memory Manager
          </span>
          <span
            className="ml-3 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: 'var(--win-nav-active)', color: 'var(--win-accent)', border: '1px solid var(--win-border)' }}
          >
            {algo}
          </span>
        </div>

        {/* Center: stat pills */}
        <div className="hidden md:flex items-center gap-2.5 mx-auto">
          {stats.map(st => (
            <div
              key={st.label}
              className="flex items-center gap-2 rounded-lg px-3.5 py-2"
              style={{ background: 'var(--win-surface2)', border: '1px solid var(--win-border)' }}
            >
              <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--win-text-secondary)' }}>
                {st.label}
              </span>
              <span className="text-base font-bold font-mono leading-none" style={{ color: st.accent === '#2D6A4F' ? 'var(--win-accent)' : st.accent === '#C0392B' ? '#ff6b6b' : 'var(--win-text)' }}>
                {st.value}
              </span>
            </div>
          ))}
        </div>

        {/* Window controls */}
        <div className="flex h-full">
          <button className="w-[46px] h-full bg-transparent border-none cursor-pointer hover:bg-white/[0.05] transition-colors flex items-center justify-center text-[#8899aa]">
            <Minus size={12} />
          </button>
          <button className="w-[46px] h-full bg-transparent border-none cursor-pointer hover:bg-white/[0.05] transition-colors flex items-center justify-center text-[#8899aa]">
            <Square size={10} />
          </button>
          <button className="w-[46px] h-full bg-transparent border-none cursor-pointer hover:bg-[#C0392B] hover:text-white transition-colors flex items-center justify-center text-[#8899aa] rounded-tr-2xl">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden min-h-0" style={{ background: '#D9D3CA' }}>

        {/* ════ LEFT COLUMN ════ */}
        <div
          className="flex flex-col flex-1 min-w-0 overflow-hidden"
          style={{ background: 'var(--win-surface)', borderRight: '1px solid var(--win-border)' }}
        >

          {/* Activity Queue */}
          <div className="shrink-0 px-10 pt-9 pb-6 flex flex-col items-center" style={{ borderBottom: '1px solid var(--win-border)' }}>
            <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: 'var(--win-text)' }}>
              Activity Queue
            </h2>
            <div className="flex gap-2 flex-wrap justify-center">
              {refString.length === 0 && (
                <span className="text-sm italic" style={{ color: 'var(--win-text-secondary)' }}>
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
                    className={`w-[38px] h-[34px] rounded-lg flex items-center justify-center relative transition-all duration-300
                      ${isDone ? 'opacity-30 scale-[0.82]' : ''}`}
                    style={{
                      background: isActive ? 'var(--win-nav-active)' : 'var(--win-surface2)',
                      border: `1px solid ${isActive ? 'var(--win-accent)' : 'var(--win-border)'}`,
                      boxShadow: isActive ? '0 0 0 2px rgba(0,229,255,0.14)' : '0 1px 3px rgba(0,0,0,0.35)',
                    }}
                  >
                    {app && <app.Icon size={16} style={{ color: app.color }} />}
                    {app && (
                      <span
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-mono shadow-sm"
                        style={{ background: 'var(--win-surface2)', color: 'var(--win-text)', border: '1px solid var(--win-border)' }}
                      >
                        {app.id}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active RAM cards */}
          <div className="flex-1 flex flex-col items-center justify-center gap-10 px-10 py-10 overflow-y-auto" style={{ background: 'var(--win-surface2)' }}>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--win-text)' }}>
              Active RAM
            </h2>
            <div className="flex gap-8 flex-wrap justify-center">
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

          {/* ── Controls bar ── */}
          <div
            className={`${s.controlBar} shrink-0`}
            style={{ background: 'var(--win-surface2)', borderTop: '1px solid var(--win-border)', padding: '10px 16px', gap: '8px', alignItems: 'center' }}
          >
            {/* Config group */}
            <div className={`${s.controlGroup} gap-3`}>
              <label className="text-sm font-semibold whitespace-nowrap tracking-wide" style={{ color: 'var(--win-text-secondary)' }}>
                Frames
              </label>
              <input
                type="number"
                value={frameCount}
                min={1} max={6}
                onChange={e => setFrameCount(e.target.value)}
                className={`${inputCls} w-[60px] text-center font-mono font-bold`}
              />
              <select
                value={algo}
                onChange={e => setAlgo(e.target.value)}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="FIFO">FIFO</option>
                <option value="LRU">LRU</option>
                <option value="MRU">MRU</option>
                <option value="OPT">Optimal</option>
              </select>
              <select
                value={speed}
                onChange={e => setSpeed(e.target.value)}
                className={`${inputCls} cursor-pointer`}
              >
                <option value={1500}>Slow</option>
                <option value={900}>Normal</option>
                <option value={400}>Fast</option>
              </select>
            </div>

            {/* Hairline divider */}
            <div className={s.controlDivider} style={{ background: 'var(--win-border)' }} />

            {/* Playback group */}
            <div className={`${s.controlGroup} gap-2.5`}>
              {/* RUN/PAUSE — primary green */}
              <button
                onClick={runSimulation}
                className={`${btnBase} ${running && !paused ? s.runningPulse : ''}`}
                style={{ background: 'var(--win-accent)', color: '#0a0f1a', border: 'none', borderRadius: '8px', padding: '6px 14px', fontWeight: '700', boxShadow: '0 2px 10px rgba(0,229,255,0.25)' }}
              >
                {runIcon} {runText}
              </button>
              {/* STEP */}
              <button
                onClick={() => { if (running) return; stepOnce(); }}
                className={btnBase}
                style={{ background: 'var(--win-nav-active)', color: 'var(--win-text)', border: '1px solid var(--win-border)', borderRadius: '8px', padding: '6px 14px', fontWeight: '600', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}
              >
                <SkipForward size={15} /> STEP
              </button>
              {/* RESET — neutral */}
              <button
                onClick={reset}
                className={btnBase}
                style={{ background: 'var(--win-surface)', color: 'var(--win-text)', border: '1px solid var(--win-border)', borderRadius: '8px', padding: '6px 14px', fontWeight: '500' }}
              >
                <RotateCcw size={15} /> RESET
              </button>
              {/* RANDOM */}
              <button
                onClick={generateRandom}
                className={btnBase}
                style={{ background: 'var(--win-purple)', color: 'var(--win-text)', border: '1px solid var(--win-purple-2)', borderRadius: '8px', padding: '6px 14px', fontWeight: '600', boxShadow: '0 2px 10px rgba(45,31,78,0.35)' }}
              >
                <Shuffle size={15} /> RANDOM
              </button>
            </div>

            <div className={s.controlDivider} style={{ background: 'var(--win-border)' }} />

            {/* Analysis group */}
            <div className={`${s.controlGroup} gap-2.5`}>
              <button
                onClick={() => setShowChart(true)}
                className={btnBase}
                style={{ background: 'var(--win-surface)', color: 'var(--win-text)', border: '1px solid var(--win-border)', borderRadius: '8px', padding: '6px 14px', fontWeight: '500' }}
              >
                <BarChart2 size={15} /> COMPARE
              </button>
              <button
                onClick={() => setShowBelady(prev => prev + 1)}
                className={btnBase}
                style={{ background: 'var(--win-purple-2)', color: 'var(--win-text)', border: '1px solid var(--win-border)', borderRadius: '8px', padding: '6px 14px', fontWeight: '600' }}
              >
                <AlertTriangle size={15} /> BELADY'S
              </button>
              <button
                onClick={() => setShowDiagnostic(true)}
                className={btnBase}
                style={{ background: 'var(--win-surface)', color: 'var(--win-text)', border: '1px solid var(--win-border)', borderRadius: '8px', padding: '6px 14px', fontWeight: '500' }}
              >
                <FileText size={15} /> EXPORT LOG
              </button>
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN — Hardware View ════ */}
        <div
          className={`${s.rightCol} flex flex-col w-full xl:w-[520px] xl:min-w-[440px] xl:max-w-[40%] overflow-y-auto overflow-x-hidden`}
          style={{ background: 'var(--win-bg)' }}
        >
          <div className="flex flex-col gap-12 p-10 pr-5">

            {hasStarted ? (
              <>
                {/* Hardware Architecture */}
                <div>
                  <h2
                    className="text-xl font-bold tracking-tight mb-5 pb-3"
                    style={{ color: 'var(--win-text)', borderBottom: '1px solid var(--win-border)' }}
                  >
                    Hardware Architecture
                  </h2>
                  <HardwareGrid state={state} />
                </div>

                {/* Page Table */}
                <div>
                  <h2
                    className="text-xl font-bold tracking-tight mb-5 pb-3"
                    style={{ color: 'var(--win-text)', borderBottom: '1px solid var(--win-border)' }}
                  >
                    Page Table
                  </h2>
                  <PageTable frames={frames} pageTable={pageTable} />
                </div>

                {/* Event Log — stays dark */}
                <div>
                  <h2
                    className="text-xl font-bold tracking-tight mb-5 pb-3"
                    style={{ color: 'var(--win-text)', borderBottom: '1px solid var(--win-border)' }}
                  >
                    Event Log
                  </h2>
                  <EventLogTerminal eventLog={eventLog} />
                </div>
              </>
            ) : (
              /* ── Placeholder ── */
              <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div
                  className="rounded-3xl p-14 text-center max-w-[420px]"
                  style={{
                    background: 'var(--win-surface)',
                    border: '2px dashed var(--win-border)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
                  }}
                >
                  <Cpu size={40} className="mx-auto mb-8" style={{ color: 'var(--win-accent)' }} />
                  <p className="text-xl font-bold mb-4 tracking-tight" style={{ color: 'var(--win-text)' }}>
                    Awaiting Activity Queue…
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: 'var(--win-text-secondary)' }}>
                    Click apps on the taskbar below to build a reference string, then press{' '}
                    <span className="font-bold" style={{ color: 'var(--win-accent)' }}>RUN</span>
                    {' '}or{' '}
                    <span className="font-bold" style={{ color: 'var(--win-accent)' }}>STEP</span>
                    {' '}to initialize the hardware architecture view.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      <SystemDiagnosticModal
        show={showDiagnostic}
        state={state}
        onClose={() => setShowDiagnostic(false)}
      />
    </div>
  );
}
