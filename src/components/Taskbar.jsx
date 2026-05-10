import { useState, useEffect } from 'react';
import { APPS } from '../utils/algorithms.js';
import { LayoutGrid, Wifi, BatteryFull, BookOpen, Monitor } from 'lucide-react';
import s from '../styles/mica.module.css';

export default function Taskbar({ onAppClick, disabled, currentView, setCurrentView }) {
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
      style={{ background: '#F9F7F4', borderTop: '1px solid #E2DDD6', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Center group */}
      <div className="flex items-center gap-2">

        {/* Start button */}
        <button
          className="w-14 h-10 flex items-center justify-center rounded-xl bg-transparent cursor-pointer border-none transition-colors hover:bg-black/[0.05] active:bg-black/[0.08]"
        >
          <LayoutGrid size={22} style={{ color: '#2D6A4F' }} />
        </button>

        {/* Separator */}
        <div className="w-px h-7 mx-3" style={{ background: '#E2DDD6' }} />

        {/* View Toggle */}
        <button
          onClick={() => setCurrentView(currentView === 'simulator' ? 'learning' : 'simulator')}
          className="flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl border transition-all cursor-pointer min-w-[80px]"
          style={{
            background: currentView === 'learning' ? '#EAF4EE' : 'transparent',
            borderColor: currentView === 'learning' ? '#A8D5BA' : 'transparent',
          }}
        >
          {currentView === 'learning' ? (
            <Monitor size={24} style={{ color: '#2D6A4F' }} />
          ) : (
            <BookOpen size={24} style={{ color: '#2D6A4F' }} />
          )}
          <span className="text-[10px] font-bold tracking-wide" style={{ color: '#6B6560' }}>
            {currentView === 'learning' ? 'Simulator' : 'Learning'}
          </span>
        </button>

        {/* Separator */}
        <div className="w-px h-7 mx-3" style={{ background: '#E2DDD6' }} />

        {/* App icons */}
        {APPS.map(app => {
          const Icon = app.Icon;
          return (
            <button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              disabled={disabled}
              className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl border border-transparent bg-transparent cursor-pointer transition-all min-w-[70px]
                hover:bg-black/[0.05] hover:border-[#E2DDD6] active:scale-95
                disabled:opacity-30 disabled:pointer-events-none"
            >
              <div className="relative">
                <Icon size={26} style={{ color: app.color }} />
                <span
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shadow-sm"
                  style={{ background: '#1A1A1A', color: '#FFFFFF', border: '1px solid #D6D1CB' }}
                >
                  {app.id}
                </span>
              </div>
              <span className="text-[10px] font-semibold tracking-wide" style={{ color: '#6B6560' }}>
                {app.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* System tray */}
      <div className="absolute right-6 flex items-center gap-4">
        <Wifi size={17} style={{ color: '#6B6560' }} />
        <BatteryFull size={17} style={{ color: '#6B6560' }} />
        <span className="text-sm font-medium min-w-[60px] text-center" style={{ color: '#1A1A1A' }}>
          {time}
        </span>
      </div>
    </div>
  );
}
