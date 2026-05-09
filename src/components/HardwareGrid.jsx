import { motion } from 'framer-motion';
import { getApp } from '../utils/algorithms.js';

export default function HardwareGrid({ state }) {
  const { refString, stepIndex, frames, faults } = state;

  const currentReq = stepIndex < refString.length ? refString[stepIndex] : null;
  const currentApp = currentReq ? getApp(currentReq) : null;

  return (
    <div className="flex flex-col gap-2.5">

      {/* ── CPU / RAM / DISK row ── */}
      <div className="grid grid-cols-3 gap-2.5">

        {/* CPU */}
        <div className="rounded-2xl border border-white/10 bg-cyan-500/10 p-3 flex flex-col min-h-[110px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/80">CPU</p>
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="mt-auto rounded-xl border border-white/10 bg-slate-950/70 p-2.5 text-[12px] text-slate-200"
          >
            {currentReq !== null
              ? <span>Requests <span className="text-cyan-300 font-bold">{currentApp ? currentApp.name : `page ${currentReq}`}</span></span>
              : <span className="text-slate-500 italic">Idle</span>
            }
          </motion.div>
        </div>

        {/* RAM */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">RAM</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {frames.map((appId, index) => {
              const app = appId !== -1 ? getApp(appId) : null;
              const isActive = currentReq !== null && appId === currentReq;
              return (
                <motion.div
                  key={`${appId}-${index}`}
                  animate={{ scale: isActive ? [1, 1.06, 1] : 1 }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.1 }}
                  className={`flex h-10 items-center justify-center rounded-lg border text-sm font-semibold gap-1
                    ${appId === -1
                      ? 'border-dashed border-white/10 text-slate-500'
                      : 'border-cyan-300/30 bg-cyan-500/10 text-white'
                    }`}
                >
                  {appId === -1 ? (
                    <span>·</span>
                  ) : app ? (
                    <>
                      <app.Icon size={11} style={{ color: app.color }} />
                      <span className="text-[9px] truncate max-w-[36px]">{app.name}</span>
                    </>
                  ) : (
                    <span className="text-[10px]">{appId}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* DISK */}
        <div className="rounded-2xl border border-white/10 bg-violet-500/10 p-3 flex flex-col min-h-[110px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-violet-100/80">Disk</p>
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="mt-auto rounded-xl border border-white/10 bg-slate-950/70 p-2.5 text-[12px] text-slate-200"
          >
            {faults > 0
              ? <span><span className="text-violet-300 font-bold">{faults}</span> swap{faults !== 1 ? 's' : ''} done</span>
              : <span className="text-slate-500 italic">Standby</span>
            }
          </motion.div>
        </div>
      </div>

      {/* ── Live page path ── */}
      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between gap-2 text-[12px] text-slate-300">
          <span>Live page path</span>
          <span className="text-[10px] text-slate-500">CPU → TLB → PT → RAM → Disk</span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[9px] uppercase tracking-[0.25em] text-slate-200">
          {['Demand paging', 'Working set', 'Belady', 'Thrashing'].map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1">{item}</span>
          ))}
        </div>
      </div>

    </div>
  );
}
