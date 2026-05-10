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
        ticks: { color: '#64748b', stepSize: 1, precision: 0 },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      x: {
        ticks: { color: '#e2e8f0', font: { family: 'Inter' } },
        grid: { color: 'rgba(255,255,255,0.04)' },
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
      ctx.fillStyle = '#e2e8f0';
      meta.data.forEach((bar, i) => {
        ctx.fillText(chart.data.datasets[0].data[i], bar.x, bar.y - 8);
      });
      ctx.restore();
    },
  }];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`${s.benchWindow} absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2
          w-[min(1200px,96vw)] h-[min(800px,calc(100vh-var(--taskbar-h)-32px))]
          rounded-xl flex flex-col overflow-hidden z-30`}
      >
        {/* Title Bar */}
        <div className="h-10 min-h-10 flex items-center justify-between pl-4 pr-2 bg-black/40 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-yellow-500" />
            <span className="text-[12px] text-white/80 font-medium tracking-wide">Performance Benchmark</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer border-none bg-transparent">
            <X size={16} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="py-4 flex flex-col items-center justify-center border-b border-white/[0.04] shrink-0 gap-2">
           <button
             onClick={startBenchmark}
             disabled={running || refString.length === 0}
             className={`${s.fluentBtnPrimary} px-6 py-2 rounded-md flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer ${running ? s.runningPulse : ''}`}
           >
             <Play size={16} fill="currentColor" />
             {running ? 'BENCHMARKING...' : 'RUN BENCHMARK'}
           </button>
           <div className="text-[11px] text-white/50 font-mono">
             Step: {stepIndex} / {refString.length}
           </div>
        </div>

        {/* 4 Columns */}
        <div className="flex-1 grid grid-cols-4 gap-4 p-4 min-h-0">
          {ALGORITHMS.map((algo) => {
            const st = benchState[algo];
            const isWinner = winners.includes(algo);
            return (
              <div key={algo} className={`${s.benchColumn} rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden ${isWinner ? s.benchWinner : ''}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ALGO_COLORS[algo] }} />
                    <span className="font-bold text-white tracking-wide">{algo}</span>
                  </div>
                  {isWinner && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-green-500/30">
                      <Trophy size={10} /> Winner
                    </motion.div>
                  )}
                </div>

                {/* Counters */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/[0.03] rounded-lg p-2 flex flex-col items-center justify-center border border-white/[0.05]">
                    <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Faults</span>
                    <div className="h-8 overflow-hidden relative w-full flex justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={st.faults}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xl font-mono font-bold text-[var(--color-miss)] absolute"
                        >
                          {st.faults}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-2 flex flex-col items-center justify-center border border-white/[0.05]">
                    <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Hits</span>
                    <div className="h-8 overflow-hidden relative w-full flex justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={st.hits}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xl font-mono font-bold text-[var(--color-hit)] absolute"
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
                        className={`${s.benchMiniSlot} h-14 rounded-md flex items-center px-3 relative overflow-hidden`}
                        style={{
                          backgroundColor: app ? app.bg : undefined,
                          borderColor: anim === 'hit' ? 'var(--color-hit)' : anim === 'fault' ? 'var(--color-miss)' : (app ? app.border : undefined),
                          boxShadow: anim === 'hit' ? 'inset 0 0 10px rgba(108,203,95,0.2)' : anim === 'fault' ? 'inset 0 0 10px rgba(255,107,107,0.2)' : undefined
                        }}
                      >
                        <span className="absolute top-1 left-1.5 text-[8px] text-white/30 font-mono">F{fIdx}</span>
                        {app ? (
                           <div className="flex items-center gap-3 w-full ml-2">
                             <app.Icon size={20} style={{ color: app.color }} />
                             <span className="text-[11px] font-semibold truncate" style={{ color: app.color }}>{app.name}</span>
                           </div>
                        ) : (
                           <span className="text-white/10 text-sm ml-2">Empty</span>
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
        <div className="h-[220px] shrink-0 p-4 pt-0 border-t border-white/[0.04] bg-black/20 flex flex-col">
          <h3 className="text-[10px] text-white/50 uppercase tracking-[2px] mb-2 mt-3 pl-2">Live Fault Tracking</h3>
          <div className="flex-1 w-full min-h-0">
             <Bar data={chartData} options={chartOptions} plugins={plugins} />
          </div>
        </div>

      </motion.div>
      )}
    </AnimatePresence>
  );
}
