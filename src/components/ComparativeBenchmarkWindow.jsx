import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Trophy } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { runAlgoStep, getApp } from '../utils/algorithms.js';
import s from '../styles/mica.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const ALGORITHMS = ['FIFO', 'LRU', 'MRU', 'OPT'];
const ALGO_COLORS = {
  FIFO: '#3b82f6',
  LRU: '#818cf8',
  MRU: '#f97316',
  OPT: '#22c55e'
};

export default function ComparativeBenchmarkWindow({ show, refString, frameCount, onClose }) {
  // Setup initial state for all 4 algorithms
  const createInitialAlgoState = () => ({
    frames: Array(frameCount).fill(-1),
    faults: 0,
    hits: 0,
    fifoQ: [],
    lruOrd: [],
    mruOrd: [],
    loadOrd: Array(frameCount).fill(0),
    loadCtr: 0,
    anims: {} // { frameIdx: 'hit' | 'fault' }
  });

  const [benchState, setBenchState] = useState(() => {
    const st = {};
    ALGORITHMS.forEach(algo => { st[algo] = createInitialAlgoState(); });
    return st;
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const runningRef = useRef(false);

  // Compute winners
  const winners = useMemo(() => {
    if (!done) return [];
    let minFaults = Infinity;
    ALGORITHMS.forEach(algo => {
      if (benchState[algo].faults < minFaults) minFaults = benchState[algo].faults;
    });
    return ALGORITHMS.filter(algo => benchState[algo].faults === minFaults);
  }, [done, benchState]);

  // Run Benchmark Loop
  const startBenchmark = async () => {
    if (refString.length === 0 || running) return;
    
    // Reset state
    const st = {};
    ALGORITHMS.forEach(algo => { st[algo] = createInitialAlgoState(); });
    setBenchState(st);
    setStepIndex(0);
    setDone(false);
    setRunning(true);
    runningRef.current = true;

    // Use a local mutable copy to avoid react state closure issues in loop
    const stateRef = { ...st };

    for (let i = 0; i < refString.length; i++) {
      if (!runningRef.current) break;

      const page = refString[i];
      
      ALGORITHMS.forEach(algo => {
        const current = stateRef[algo];
        const frames = [...current.frames];
        const fifoQ = [...current.fifoQ];
        const lruOrd = [...current.lruOrd];
        const mruOrd = [...current.mruOrd];
        const loadOrd = [...current.loadOrd];
        let loadCtr = current.loadCtr;

        const result = runAlgoStep(
          page, i, frames, frameCount, algo,
          fifoQ, lruOrd, refString, loadOrd, loadCtr, mruOrd
        );
        
        loadCtr = result.loadCtr !== undefined ? result.loadCtr : loadCtr;
        const anims = { [result.frameIdx]: result.hit ? 'hit' : 'fault' };

        stateRef[algo] = {
          frames,
          faults: current.faults + (result.hit ? 0 : 1),
          hits: current.hits + (result.hit ? 1 : 0),
          fifoQ,
          lruOrd,
          mruOrd,
          loadOrd,
          loadCtr,
          anims
        };
      });

      // Update react state to trigger re-render
      setBenchState({ ...stateRef });
      setStepIndex(i + 1);

      // Delay for "racing" effect
      await new Promise(r => setTimeout(r, 400));
      
      // Clear anims after a short delay
      if (!runningRef.current) break;
      ALGORITHMS.forEach(algo => { stateRef[algo].anims = {}; });
      setBenchState({ ...stateRef });
    }

    if (runningRef.current) {
      setRunning(false);
      setDone(true);
    }
  };

  useEffect(() => {
    return () => { runningRef.current = false; };
  }, []);

  // Chart Data
  const chartData = {
    labels: ALGORITHMS,
    datasets: [{
      label: 'Page Faults',
      data: ALGORITHMS.map(algo => benchState[algo].faults),
      backgroundColor: ALGORITHMS.map(algo => ALGO_COLORS[algo]),
      borderWidth: 0,
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: refString.length > 0 ? refString.length + 1 : 10,
        ticks: { color: '#6B6560', stepSize: 1, precision: 0 },
        grid: { color: '#E8E4DE' },
      },
      x: {
        ticks: { color: '#6B6560', font: { family: 'Inter', weight: 'bold' } },
        grid: { color: '#E8E4DE' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: c => 'Faults: ' + c.raw } },
    },
    animation: {
      duration: 300 // smooth growing
    }
  };

  const plugins = [{
    id: 'datalabels',
    afterDatasetsDraw(chart) {
      const meta = chart.getDatasetMeta(0);
      const ctx = chart.ctx;
      ctx.save();
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#6B6560';
      meta.data.forEach((bar, i) => {
        ctx.fillText(chart.data.datasets[0].data[i], bar.x, bar.y - 8);
      });
      ctx.restore();
    },
  }];

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(10,15,26,0.72)' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2
              w-[min(1200px,96vw)] h-[min(800px,calc(100vh-var(--taskbar-h)-32px))]
              flex flex-col overflow-hidden z-50`}
            style={{ background: 'var(--win-surface)', border: '1px solid var(--win-border)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.55)' }}
          >
            {/* Title Bar */}
            <div 
              className="h-10 min-h-10 flex items-center justify-between pl-4 pr-2 shrink-0"
              style={{ background: 'var(--win-surface2)', borderBottom: '1px solid var(--win-border)' }}
            >
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-yellow-500" />
                <span className="text-[12px] font-bold tracking-wide" style={{ color: 'var(--win-text)' }}>Performance Benchmark</span>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent hover:bg-white/5 text-[var(--win-text-secondary)] hover:text-[var(--win-text)]">
                <X size={16} />
              </button>
            </div>

        {/* Action Bar */}
        <div className="py-4 flex flex-col items-center justify-center shrink-0 gap-2">
           <button
             onClick={startBenchmark}
             disabled={running || refString.length === 0}
             className={`flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 ease cursor-pointer hover:brightness-[0.93] active:scale-[0.98] ${running ? s.runningPulse : ''}`}
             style={{ background: 'var(--win-accent)', color: '#0a0f1a', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: '700', boxShadow: '0 2px 10px rgba(0,229,255,0.25)' }}
           >
             <Play size={16} fill="currentColor" />
             {running ? 'BENCHMARKING...' : 'RUN BENCHMARK'}
           </button>
           <div className="text-[11px] font-bold font-mono" style={{ color: 'var(--win-text-secondary)' }}>
             Step: {stepIndex} / {refString.length}
           </div>
        </div>

        {/* 4 Columns */}
        <div className="flex-1 grid grid-cols-4 gap-4 p-4 min-h-0">
          {ALGORITHMS.map((algo) => {
            const st = benchState[algo];
            const isWinner = winners.includes(algo);
            return (
              <div key={algo} className={`p-4 flex flex-col gap-4 relative overflow-hidden ${isWinner ? s.benchWinner : ''}`} style={{ background: 'var(--win-surface2)', border: '1px solid var(--win-border)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ALGO_COLORS[algo] }} />
                    <span className="font-bold tracking-wide" style={{ color: 'var(--win-text)' }}>{algo}</span>
                  </div>
                  {isWinner && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 bg-[var(--win-nav-active)] text-[var(--win-accent)] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[var(--win-border)]">
                      <Trophy size={10} /> Winner
                    </motion.div>
                  )}
                </div>

                {/* Counters */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg p-2 flex flex-col items-center justify-center" style={{ background: 'var(--win-nav-active)' }}>
                    <span className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: 'var(--win-text-secondary)' }}>Faults</span>
                    <div className="h-8 overflow-hidden relative w-full flex justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={st.faults}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xl font-mono absolute"
                          style={{ color: '#ff6b6b', fontWeight: 700 }}
                        >
                          {st.faults}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="rounded-lg p-2 flex flex-col items-center justify-center" style={{ background: 'var(--win-nav-active)' }}>
                    <span className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: 'var(--win-text-secondary)' }}>Hits</span>
                    <div className="h-8 overflow-hidden relative w-full flex justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={st.hits}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xl font-mono absolute"
                          style={{ color: 'var(--win-accent)', fontWeight: 700 }}
                        >
                          {st.hits}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Mini RAM Frames */}
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
                  {st.frames.map((appId, fIdx) => {
                    const app = appId > 0 ? getApp(appId) : null;
                    const anim = st.anims[fIdx];
                    return (
                      <motion.div
                        key={fIdx}
                        layout
                        initial={false}
                        animate={anim === 'fault' ? { x: [-2, 2, -2, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        className={`h-14 flex items-center px-3 relative overflow-hidden`}
                        style={{
                          borderRadius: '6px',
                          backgroundColor: app ? 'var(--win-surface)' : 'var(--win-nav-active)',
                          border: anim === 'hit' ? '1px solid var(--win-accent)' : anim === 'fault' ? '1px solid #C0392B' : `1px solid ${app ? (app.border || 'var(--win-border)') : 'transparent'}`,
                          boxShadow: anim === 'hit' ? 'inset 0 0 10px rgba(0,229,255,0.1)' : anim === 'fault' ? 'inset 0 0 10px rgba(192,57,43,0.1)' : undefined
                        }}
                      >
                        <span className="absolute top-1 left-1.5 text-[8px] font-mono font-bold" style={{ color: 'var(--win-text-secondary)' }}>F{fIdx}</span>
                        {app ? (
                           <div className="flex items-center gap-3 w-full ml-2">
                             <app.Icon size={20} style={{ color: app.color }} />
                             <span className="text-[11px] font-bold truncate" style={{ color: app.color }}>{app.name}</span>
                           </div>
                        ) : (
                           <span className="text-sm font-bold ml-2" style={{ color: 'var(--win-text-secondary)' }}>Empty</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

        {/* Live Chart Footer */}
        <div className="shrink-0 p-4 m-4 mt-0 flex flex-col" style={{ background: 'var(--win-surface2)', border: '1px solid var(--win-border)', borderRadius: '12px', height: '220px' }}>
          <h3 className="text-[10px] uppercase font-bold tracking-[2px] mb-2 pl-2" style={{ color: 'var(--win-text-secondary)' }}>Live Fault Tracking</h3>
          <div className="flex-1 w-full min-h-0">
             <Bar data={chartData} options={chartOptions} plugins={plugins} />
          </div>
        </div>

      </motion.div>
      </>
      )}
    </AnimatePresence>
  );
}
