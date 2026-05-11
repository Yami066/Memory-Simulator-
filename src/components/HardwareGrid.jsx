import { getApp } from '../utils/algorithms.js';

export default function HardwareGrid({ state }) {
  const { refString, stepIndex, frames, faults } = state;

  const currentReq = stepIndex < refString.length ? refString[stepIndex] : null;
  const currentApp = currentReq ? getApp(currentReq) : null;

  return (
    <div className="flex flex-col gap-8">

      {/* ── CPU / RAM / DISK row ── */}
      <div className="grid grid-cols-3 gap-6">

        {/* CPU */}
        <div
          className="rounded-none p-5 flex flex-col min-h-[150px]"
          style={{
            background: 'linear-gradient(180deg, rgba(26,34,54,0.98) 0%, rgba(15,21,36,0.98) 100%)',
            border: '1px solid rgba(42,58,80,0.95)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: 'var(--win-accent)' }}>CPU</p>
            <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: 'var(--win-text-secondary)' }}>Active</span>
          </div>
          <div
            className="mt-auto rounded-none p-4 text-sm font-medium min-h-[72px] flex items-center"
            style={{
              background: 'linear-gradient(180deg, rgba(30,45,61,0.95), rgba(20,28,46,0.98))',
              border: '1px solid var(--win-border)',
              color: 'var(--win-text)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {currentReq !== null
              ? <span>Requests <span className="font-bold" style={{ color: 'var(--win-accent)' }}>{currentApp ? currentApp.name : `page ${currentReq}`}</span></span>
              : <span className="italic" style={{ color: 'var(--win-text-secondary)' }}>Idle</span>
            }
          </div>
        </div>

        {/* RAM */}
        <div
          className="rounded-none p-5"
          style={{
            background: 'linear-gradient(180deg, rgba(26,34,54,0.95) 0%, rgba(20,28,46,0.98) 100%)',
            border: '1px solid rgba(42,58,80,0.95)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: 'var(--win-text-secondary)' }}>RAM</p>
            <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: 'var(--win-text-secondary)' }}>{frames.length} slots</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {frames.map((appId, index) => {
              const app = appId !== -1 ? getApp(appId) : null;
              const isActive = currentReq !== null && appId === currentReq;
              return (
                <div
                  key={`${appId}-${index}`}
                  className="flex h-16 items-center justify-center rounded-none text-sm font-bold gap-2 px-3 text-center"
                  style={{
                    background: isActive
                      ? 'linear-gradient(180deg, rgba(30,45,61,0.98), rgba(20,28,46,0.98))'
                      : 'rgba(20,28,46,0.88)',
                    border: `1px solid ${isActive ? 'var(--win-accent)' : 'var(--win-border)'}`,
                    color: 'var(--win-text)',
                    boxShadow: isActive ? '0 0 0 1px rgba(0,229,255,0.12), inset 0 1px 0 rgba(255,255,255,0.04)' : 'inset 0 1px 0 rgba(255,255,255,0.02)',
                  }}
                >
                  {appId === -1 ? (
                    <span style={{ color: 'var(--win-text-secondary)' }}>·</span>
                  ) : app ? (
                    <>
                      <app.Icon size={14} style={{ color: app.color }} />
                      <span className="text-xs truncate max-w-[58px] leading-tight" style={{ color: 'var(--win-text)' }}>{app.name}</span>
                    </>
                  ) : (
                    <span className="text-sm">{appId}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DISK */}
        <div
          className="rounded-none p-5 flex flex-col min-h-[150px]"
          style={{
            background: 'linear-gradient(180deg, rgba(58,38,96,0.98) 0%, rgba(45,31,78,0.98) 100%)',
            border: '1px solid var(--win-purple-2)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: 'var(--win-text-secondary)' }}>Disk</p>
            <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: 'var(--win-text-secondary)' }}>Storage</span>
          </div>
          <div
            className="mt-auto rounded-none p-4 text-sm font-medium min-h-[72px] flex items-center"
            style={{
              background: 'linear-gradient(180deg, rgba(30,45,61,0.95), rgba(20,28,46,0.98))',
              border: '1px solid var(--win-border)',
              color: 'var(--win-text)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {faults > 0
              ? <span><span className="font-bold text-lg" style={{ color: '#ff6b6b' }}>{faults}</span> swap{faults !== 1 ? 's' : ''} done</span>
              : <span className="italic" style={{ color: 'var(--win-text-secondary)' }}>Standby</span>
            }
          </div>
        </div>
      </div>

    </div>
  );
}
