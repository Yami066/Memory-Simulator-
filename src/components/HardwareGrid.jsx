import { motion } from 'framer-motion';
import { getApp } from '../utils/algorithms.js';

export default function HardwareGrid({ state }) {
  const { refString, stepIndex, frames, faults } = state;

  const currentReq = stepIndex < refString.length ? refString[stepIndex] : null;
  const currentApp = currentReq ? getApp(currentReq) : null;

  return (
    <div className="flex flex-col gap-5">

      {/* ── CPU / RAM / DISK row ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* CPU */}
        <div
          className="rounded-xl p-4 flex flex-col min-h-[130px]"
          style={{ background: '#EAF4EE', border: '1px solid #A8D5BA' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#2D6A4F' }}>CPU</p>
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="mt-auto rounded-lg p-3 text-sm font-medium"
            style={{ background: '#FFFFFF', border: '1px solid #D6D1CB', color: '#1A1A1A' }}
          >
            {currentReq !== null
              ? <span>Requests <span className="font-bold" style={{ color: '#2D6A4F' }}>{currentApp ? currentApp.name : `page ${currentReq}`}</span></span>
              : <span className="italic" style={{ color: '#6B6560' }}>Idle</span>
            }
          </motion.div>
        </div>

        {/* RAM */}
        <div
          className="rounded-xl p-4"
          style={{ background: '#F4F1EC', border: '1px solid #E2DDD6' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#6B6560' }}>RAM</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {frames.map((appId, index) => {
              const app = appId !== -1 ? getApp(appId) : null;
              const isActive = currentReq !== null && appId === currentReq;
              return (
                <motion.div
                  key={`${appId}-${index}`}
                  animate={{ scale: isActive ? [1, 1.06, 1] : 1 }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.1 }}
                  className="flex h-12 items-center justify-center rounded-lg text-sm font-bold gap-1.5"
                  style={{
                    background: isActive ? '#EAF4EE' : '#FFFFFF',
                    border: `1px solid ${isActive ? '#2D6A4F' : '#D6D1CB'}`,
                    color: '#1A1A1A',
                  }}
                >
                  {appId === -1 ? (
                    <span style={{ color: '#D6D1CB' }}>·</span>
                  ) : app ? (
                    <>
                      <app.Icon size={15} style={{ color: app.color }} />
                      <span className="text-xs truncate max-w-[44px]" style={{ color: '#1A1A1A' }}>{app.name}</span>
                    </>
                  ) : (
                    <span className="text-sm">{appId}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* DISK */}
        <div
          className="rounded-xl p-4 flex flex-col min-h-[130px]"
          style={{ background: '#F4F1EC', border: '1px solid #E2DDD6' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#6B6560' }}>Disk</p>
          <motion.div
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="mt-auto rounded-lg p-3 text-sm font-medium"
            style={{ background: '#FFFFFF', border: '1px solid #D6D1CB', color: '#1A1A1A' }}
          >
            {faults > 0
              ? <span><span className="font-bold text-lg" style={{ color: '#C0392B' }}>{faults}</span> swap{faults !== 1 ? 's' : ''} done</span>
              : <span className="italic" style={{ color: '#6B6560' }}>Standby</span>
            }
          </motion.div>
        </div>
      </div>

      {/* ── Live page path ── */}
      <div
        className="flex flex-col gap-3 rounded-xl p-4"
        style={{ background: '#F4F1EC', border: '1px solid #E2DDD6' }}
      >
        <div className="flex items-center justify-between gap-4 text-sm font-bold" style={{ color: '#1A1A1A' }}>
          <span>Live page path</span>
          <span className="text-xs font-mono" style={{ color: '#6B6560' }}>CPU → TLB → PT → RAM → Disk</span>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] font-bold">
          {['Demand paging', 'Working set', 'Belady', 'Thrashing'].map((item) => (
            <span
              key={item}
              className="rounded-full px-3 py-1.5"
              style={{ background: '#FFFFFF', border: '1px solid #D6D1CB', color: '#6B6560' }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
