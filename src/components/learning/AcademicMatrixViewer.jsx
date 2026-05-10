import { useState } from 'react';
import { TableProperties, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import s from '../../styles/mica.module.css';

export default function AcademicMatrixViewer({ defaultAlgorithm = 'FIFO' }) {
  const [refStringInput, setRefStringInput] = useState('7 0 1 2 0 3 0 4 2 3 0 3 2');
  const [framesInput, setFramesInput] = useState(3);
  const [algoInput, setAlgoInput] = useState(defaultAlgorithm);
  
  const [matrixData, setMatrixData] = useState(null);
  
  const generateMatrixData = (refStrRaw, numFrames, algorithm) => {
    const refStr = refStrRaw.trim().split(/[\s,]+/).filter(Boolean).map(n => parseInt(n, 10));
    if (refStr.length === 0 || refStr.some(isNaN)) return null;
    
    const frames = Array(numFrames).fill(-1);
    const history = [];
    
    let faults = 0;
    let hits = 0;
    
    // Algorithm-specific state
    const fifoQ = [];
    const lruOrd = [];
    // For Optimal, we need the refStr
    // For Second Chance
    const refBits = Array(numFrames).fill(0);
    let pointer = 0;

    for (let i = 0; i < refStr.length; i++) {
      const page = refStr[i];
      const fi = frames.indexOf(page);
      
      let hit = false;
      let targetFrame = -1;
      
      if (fi !== -1) {
        // HIT
        hit = true;
        hits++;
        targetFrame = fi;
        
        if (algorithm === 'LRU') {
          lruOrd.splice(lruOrd.indexOf(page), 1);
          lruOrd.push(page);
        } else if (algorithm === 'Second Chance') {
          refBits[fi] = 1;
        }
      } else {
        // FAULT
        hit = false;
        faults++;
        
        let frameIdx = frames.indexOf(-1);
        
        if (frameIdx === -1) {
          // Need replacement
          if (algorithm === 'FIFO') {
            const victim = fifoQ.shift();
            frameIdx = frames.indexOf(victim);
          } else if (algorithm === 'LRU') {
            const victim = lruOrd.shift();
            frameIdx = frames.indexOf(victim);
          } else if (algorithm === 'Optimal') {
            let maxDist = -1;
            let candIdx = -1;
            for (let f = 0; f < numFrames; f++) {
              const nx = refStr.slice(i + 1).indexOf(frames[f]);
              if (nx === -1) {
                candIdx = f;
                break;
              }
              if (nx > maxDist) {
                maxDist = nx;
                candIdx = f;
              }
            }
            frameIdx = candIdx;
          } else if (algorithm === 'Second Chance') {
            while (true) {
              if (refBits[pointer] === 0) {
                frameIdx = pointer;
                pointer = (pointer + 1) % numFrames;
                break;
              } else {
                refBits[pointer] = 0;
                pointer = (pointer + 1) % numFrames;
              }
            }
          }
        }
        
        // Load page
        frames[frameIdx] = page;
        targetFrame = frameIdx;
        
        if (algorithm === 'FIFO') {
          fifoQ.push(page);
        } else if (algorithm === 'LRU') {
          lruOrd.push(page);
        } else if (algorithm === 'Second Chance') {
          refBits[frameIdx] = 1;
          if (frames.indexOf(-1) !== -1 && pointer === frameIdx) {
             pointer = (pointer + 1) % numFrames;
          }
        }
      }
      
      history.push({
        step: i,
        page,
        hit,
        frames: [...frames],
        targetFrame: !hit ? targetFrame : -1 // Only highlight on fault
      });
    }
    
    return {
      refStr,
      numFrames,
      algorithm,
      history,
      faults,
      hits,
      total: refStr.length
    };
  };

  const handleGenerate = () => {
    const data = generateMatrixData(refStringInput, parseInt(framesInput, 10), algoInput);
    if (data) setMatrixData(data);
  };

  return (
    <div className={`${s.panelGlass} rounded-xl p-6 flex flex-col gap-5 mt-6 w-full max-w-full overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <TableProperties size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">📝 Academic 2D Matrix (Exam Mode)</h2>
          <p className="text-[12px] text-slate-400">Verify your manual calculations with the classic textbook table visualization.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 bg-black/20 p-4 rounded-lg border border-white/[0.03]">
        <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold pl-1">Reference String</label>
          <input 
            type="text" 
            value={refStringInput}
            onChange={(e) => setRefStringInput(e.target.value)}
            className={`${s.fluentSelect} w-full rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600`}
            placeholder="e.g., 7 0 1 2 0 3 0 4 2 3"
          />
        </div>
        <div className="w-[100px] flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold pl-1">Frames</label>
          <input 
            type="number" 
            min={1} max={7}
            value={framesInput}
            onChange={(e) => setFramesInput(e.target.value)}
            className={`${s.fluentSelect} w-full rounded-lg px-3 py-2 text-sm text-white font-mono text-center`}
          />
        </div>
        <div className="w-[160px] flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold pl-1">Algorithm</label>
          <select 
            value={algoInput}
            onChange={(e) => setAlgoInput(e.target.value)}
            className={`${s.fluentSelect} w-full rounded-lg px-3 py-2 text-sm text-white cursor-pointer`}
          >
            <option value="FIFO">FIFO</option>
            <option value="LRU">LRU</option>
            <option value="Optimal">Optimal</option>
            <option value="Second Chance">Second Chance</option>
          </select>
        </div>
        <button 
          onClick={handleGenerate}
          className={`${s.fluentBtnPrimary} px-5 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer h-[38px] flex items-center gap-2`}
        >
          <Play size={16} fill="currentColor" /> Generate Matrix
        </button>
      </div>

      {/* Visualization */}
      <AnimatePresence mode="wait">
        {matrixData && (
          <motion.div 
            key={`${matrixData.algorithm}-${matrixData.total}-${matrixData.faults}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="w-full overflow-x-auto custom-scrollbar pb-4">
              <div className="inline-flex flex-col gap-1 p-4 bg-black/30 rounded-xl border border-white/[0.05]">
                
                {/* Reference String Row */}
                <div className="flex gap-1 mb-2">
                  <div className="w-[80px] shrink-0 text-right pr-4 text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-end">
                    Ref String
                  </div>
                  {matrixData.history.map((step, idx) => (
                    <div key={`ref-${idx}`} className={`${s.matrixCell} ${s.matrixHeaderCell} rounded-t-md`}>
                      {step.page}
                    </div>
                  ))}
                </div>

                {/* Frames Rows */}
                {Array.from({ length: matrixData.numFrames }).map((_, fIdx) => (
                  <div key={`frame-${fIdx}`} className="flex gap-1">
                    <div className="w-[80px] shrink-0 text-right pr-4 text-[12px] text-slate-300 font-medium flex items-center justify-end">
                      Frame {fIdx}
                    </div>
                    {matrixData.history.map((step, idx) => {
                      const val = step.frames[fIdx];
                      const isTarget = step.targetFrame === fIdx;
                      return (
                        <div 
                          key={`f${fIdx}-s${idx}`} 
                          className={`${s.matrixCell} ${isTarget ? s.matrixCellFaultTarget : 'bg-white/[0.02]'}`}
                        >
                          {val === -1 ? '' : val}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Result Row */}
                <div className="flex gap-1 mt-2">
                  <div className="w-[80px] shrink-0 text-right pr-4 text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-end">
                    Result
                  </div>
                  {matrixData.history.map((step, idx) => (
                    <div key={`res-${idx}`} className={`${s.matrixCell} ${s.matrixResultCell} rounded-b-md ${step.hit ? 'text-green-400' : 'text-red-400'}`}>
                      {step.hit ? 'H' : 'F'}
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05] flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Total Accesses</span>
                <span className="text-xl font-mono font-bold text-white">{matrixData.total}</span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05] flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Page Faults</span>
                <span className="text-xl font-mono font-bold text-red-400">{matrixData.faults}</span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05] flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Page Hits</span>
                <span className="text-xl font-mono font-bold text-green-400">{matrixData.hits}</span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05] flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Fault Rate</span>
                <span className="text-xl font-mono font-bold text-cyan-400">
                  {((matrixData.faults / matrixData.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
