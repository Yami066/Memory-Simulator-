import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSimulator } from '../hooks/useSimulator.js';
import Taskbar from './Taskbar.jsx';
import VirtualMemoryManager from './VirtualMemoryManager.jsx';
import LearningModule from './LearningModule.jsx';
import MiniAppWindow from './MiniAppWindow.jsx';
import ComparativeBenchmarkWindow from './ComparativeBenchmarkWindow.jsx';
import BeladyBanner from './BeladyBanner.jsx';
import s from '../styles/mica.module.css';

export default function DesktopEnvironment() {
  const {
    state, addToQueue, setAlgo, setSpeed, setFrameCount,
    runSimulation, stepOnce, reset, generateRandom, clearAnims
  } = useSimulator();

  const [showChart, setShowChart] = useState(false);
  const [beladyTrigger, setBeladyTrigger] = useState(0);
  const [currentView, setCurrentView] = useState('simulator'); // 'simulator' | 'learning'

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setShowChart(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className={`${s.bloom} h-screen w-screen overflow-hidden`}>

      {/* Desktop mini-windows (Only show in simulator mode, hidden on small screens) */}
      <div className="fixed inset-0 bottom-[var(--taskbar-h)] z-[20] pointer-events-none overflow-hidden hidden lg:block">
        <AnimatePresence>
          {currentView === 'simulator' && state.frames.map((appId, frameIdx) =>
            appId > 0 && (
              <MiniAppWindow key={appId} appId={appId} frameIdx={frameIdx} />
            )
          )}
        </AnimatePresence>
      </div>

      {/* Main Window or Learning Module */}
      {currentView === 'simulator' ? (
        <VirtualMemoryManager
          state={state}
          setAlgo={setAlgo}
          setSpeed={setSpeed}
          setFrameCount={setFrameCount}
          runSimulation={runSimulation}
          stepOnce={stepOnce}
          reset={reset}
          generateRandom={generateRandom}
          showChart={showChart}
          setShowChart={setShowChart}
          showBelady={beladyTrigger}
          setShowBelady={setBeladyTrigger}
          clearAnims={clearAnims}
        />
      ) : (
        <div className="absolute inset-0 bottom-[var(--taskbar-h)] z-10 overflow-hidden">
          <LearningModule />
        </div>
      )}

      {/* Taskbar */}
      <Taskbar 
        onAppClick={addToQueue} 
        disabled={state.running || currentView !== 'simulator'} 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Overlays */}
      <ComparativeBenchmarkWindow
        show={showChart}
        refString={state.refString}
        frameCount={state.frameCount}
        onClose={() => setShowChart(false)}
      />
      <BeladyBanner
        refString={state.refString}
        frameCount={state.frameCount}
        trigger={beladyTrigger}
      />
    </div>
  );
}
