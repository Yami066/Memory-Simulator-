import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download } from 'lucide-react';
import s from '../styles/mica.module.css';

export default function SystemDiagnosticModal({ show, state, onClose }) {
  const reportText = useMemo(() => {
    if (!state) return '';
    
    const { algo, frameCount, hits, faults, refString, stepHistory } = state;
    const accesses = hits + faults;
    const faultRate = accesses ? ((faults / accesses) * 100).toFixed(1) : '0.0';

    let logLines = [];
    let prevFrames = Array(frameCount).fill(-1);

    stepHistory.forEach(historyItem => {
      const { step, page, frames, hit } = historyItem;
      const status = hit ? 'HIT  ' : 'FAULT';
      
      const formatFrame = (f) => f === -1 ? '-' : f;
      const ramStateStr = `[${frames.map(formatFrame).join(', ')}]`;
      
      let evictionStr = '';
      if (!hit) {
        // Find if something was evicted by checking what was in prevFrames but isn't in current frames
        // (ignoring -1)
        const evicted = prevFrames.find(f => f !== -1 && !frames.includes(f));
        if (evicted !== undefined) {
          evictionStr = ` (Evicted ${evicted})`;
        }
      }

      logLines.push(`Step ${step}: Request Page ${page} -> ${status} | RAM State: ${ramStateStr}${evictionStr}`);
      prevFrames = [...frames];
    });

    return `=========================================
VIRTUAL MEMORY DIAGNOSTIC REPORT
=========================================
Algorithm: ${algo}
Frames Allocated: ${frameCount}
Total Accesses: ${accesses}
Total Hits: ${hits}
Total Faults: ${faults}
Fault Rate: ${faultRate}%
=========================================
REFERENCE STRING (Numeric IDs):
[${refString.join(', ')}]

EXECUTION LOG:
${logLines.length > 0 ? logLines.join('\n') : 'No steps executed yet.'}
=========================================
END OF REPORT`;

  }, [state, show]); // Re-generate when state or visibility changes

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reportText);
  };

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
          />
          
          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`${s.appWindow} fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(800px,90vw)] h-[min(600px,80vh)] rounded-xl flex flex-col overflow-hidden z-[210] shadow-2xl border border-white/10`}
          >
            {/* Title bar */}
            <div className={`${s.terminalTitlebar} h-10 shrink-0 flex items-center justify-between px-4 bg-slate-900`}>
              <div className="flex items-center gap-2 text-slate-300">
                <FileText size={14} />
                <span className="text-xs font-medium tracking-wide">system_report.log - Notepad</span>
              </div>
              <button 
                onClick={onClose}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:bg-red-500/80 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Toolbar */}
            <div className="h-10 shrink-0 bg-slate-800/80 border-b border-white/5 flex items-center px-4">
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors cursor-pointer border border-white/5"
              >
                <Download size={12} />
                Copy to Clipboard
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-slate-950/80 p-4 overflow-hidden flex flex-col">
              <textarea 
                readOnly
                value={reportText}
                className="flex-1 w-full bg-transparent border-none outline-none resize-none text-slate-300 font-mono text-[13px] leading-relaxed custom-scrollbar selection:bg-blue-500/30"
                spellCheck="false"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
