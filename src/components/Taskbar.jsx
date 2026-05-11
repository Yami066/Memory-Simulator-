import { useState, useEffect } from 'react';
import { APPS } from '../utils/algorithms.js';
import { LayoutGrid, Wifi, BatteryFull, BookOpen, Monitor } from 'lucide-react';
import s from '../styles/mica.module.css';

export default function Taskbar({ onAppClick, disabled, currentView, setCurrentView, appClickCounts = {} }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-[var(--taskbar-h)] flex items-center justify-center z-[100] px-6"
      style={{ background: 'var(--win-surface)', borderTop: '1px solid var(--win-border)', boxShadow: '0 -8px 24px rgba(0,0,0,0.35)' }}
    >
      {/* Center group */}
      <div className="flex items-center gap-2">

        {/* Start button */}
        <button
          className="w-14 h-10 flex items-center justify-center rounded-xl bg-transparent cursor-pointer border-none transition-colors hover:bg-black/[0.05] active:bg-black/[0.08]"
        >
          <LayoutGrid size={22} style={{ color: 'var(--win-accent)' }} />
        </button>

        {/* Separator */}
        <div className="w-px h-7 mx-3" style={{ background: 'var(--win-border)' }} />

        {/* View Toggle */}
        <button
          onClick={() => setCurrentView(currentView === 'simulator' ? 'learning' : 'simulator')}
          className="flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl border transition-all cursor-pointer min-w-[80px]"
          style={{
            background: currentView === 'learning' ? 'var(--win-nav-active)' : 'transparent',
            borderColor: currentView === 'learning' ? 'var(--win-border)' : 'transparent',
          }}
        >
          {currentView === 'learning' ? (
            <Monitor size={24} style={{ color: 'var(--win-accent)' }} />
          ) : (
            <BookOpen size={24} style={{ color: 'var(--win-accent)' }} />
          )}
          <span className="text-[10px] font-bold tracking-wide" style={{ color: 'var(--win-text-secondary)' }}>
            {currentView === 'learning' ? 'Simulator' : 'Learning'}
          </span>
        </button>

        {/* Separator */}
        <div className="w-px h-7 mx-3" style={{ background: 'var(--win-border)' }} />

        {/* App icons */}
        {APPS.map(app => {
          const Icon = app.Icon;
          const clickCount = appClickCounts[app.id] || 0;
          return (
            <button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              disabled={disabled}
              className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl border border-transparent bg-transparent cursor-pointer transition-all min-w-[70px]
                hover:bg-white/[0.04] hover:border-[var(--win-border)] active:scale-95
                disabled:opacity-30 disabled:pointer-events-none"
            >
              <div className="relative">
                <Icon size={18} style={{ color: app.color }} />
                {clickCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shadow-sm"
                    style={{ background: 'var(--win-nav-active)', color: 'var(--win-text)', border: '1px solid var(--win-border)' }}
                  >
                    {clickCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-wide" style={{ color: 'var(--win-text-secondary)' }}>
                {app.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* System tray */}
      <div className="absolute right-6 flex items-center gap-4">
        <Wifi size={12} style={{ color: 'var(--win-text-secondary)' }} />
        <BatteryFull size={12} style={{ color: 'var(--win-text-secondary)' }} />
        <span className="text-sm font-medium min-w-[60px] text-center" style={{ color: 'var(--win-text)' }}>
          {time}
        </span>
      </div>
    </div>
  );
}
