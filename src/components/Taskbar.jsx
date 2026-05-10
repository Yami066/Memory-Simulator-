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
    <div className={`${s.taskbar} fixed bottom-0 left-0 right-0 h-[var(--taskbar-h)] flex items-center justify-center z-[100] px-3`}>
      {/* Center group */}
      <div className="flex items-center gap-0.5">
        {/* Start button */}
        <button className="w-10 h-9 flex items-center justify-center rounded-md bg-transparent hover:bg-white/[0.08] active:bg-white/[0.04] transition-colors cursor-pointer border-none">
          <LayoutGrid size={18} className="text-white" />
        </button>
        {/* Separator */}
        <div className="w-px h-5 bg-white/10 mx-1.5" />
        
        {/* View Toggle */}
        <button
          onClick={() => setCurrentView(currentView === 'simulator' ? 'learning' : 'simulator')}
          className={`flex flex-col items-center gap-px py-1 px-3 rounded-md border transition-all cursor-pointer min-w-[60px]
            ${currentView === 'learning' 
              ? 'bg-white/10 border-white/20' 
              : 'bg-transparent border-transparent hover:bg-white/[0.07] hover:border-white/[0.05] active:scale-95'}`}
        >
          {currentView === 'learning' ? (
            <Monitor size={20} className="text-cyan-400" />
          ) : (
            <BookOpen size={20} className="text-amber-400" />
          )}
          <span className="text-[8px] text-[var(--win-text-secondary)] font-medium tracking-wide">
            {currentView === 'learning' ? 'Simulator' : 'Learning'}
          </span>
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-white/10 mx-1.5" />

        {/* App icons */}
        {APPS.map(app => {
          const Icon = app.Icon;
          return (
            <button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              disabled={disabled}
              className={`flex flex-col items-center gap-px py-1 px-2 rounded-md border border-transparent bg-transparent cursor-pointer transition-all min-w-[50px]
                hover:bg-white/[0.07] hover:border-white/[0.05] active:scale-95
                disabled:opacity-30 disabled:pointer-events-none`}
            >
              <div className="relative">
                <Icon size={20} style={{ color: app.color }} />
                <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-[8px] text-white font-bold font-mono shadow-sm">
                  {app.id}
                </span>
              </div>
              <span className="text-[8px] text-[var(--win-text-secondary)] font-medium tracking-wide">{app.name}</span>
            </button>
          );
        })}
      </div>

      {/* System tray */}
      <div className="absolute right-3 flex items-center gap-2.5">
        <Wifi size={14} className="text-[#b0b8c4]" />
        <BatteryFull size={14} className="text-[#b0b8c4]" />
        <span className="text-[11px] text-[#b0b8c4] font-normal min-w-[44px] text-center">{time}</span>
      </div>
    </div>
  );
}
