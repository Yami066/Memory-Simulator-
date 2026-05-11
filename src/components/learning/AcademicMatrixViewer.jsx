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
    <div className="w-full max-w-6xl mx-auto pt-12 flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[#2a3a50] pb-6 px-2">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 shadow-sm">
          <TableProperties size={28} className="drop-shadow-sm" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#ffffff] tracking-tight">📝 Academic 2D Matrix (Exam Mode)</h2>
          <p className="text-base text-[#8899aa] mt-1 font-medium">Verify your manual calculations with the classic textbook table visualization.</p>
        </div>
      </div>

      {/* Controls */}
      <div className={`bg-[#141c2e] border border-[#2a3a50] shadow-[0_2px_12px_rgba(0,0,0,0.35)] flex flex-wrap items-end gap-6 p-8 rounded-[2rem]`}>
        <div className="flex-1 min-w-[240px] flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-[#8899aa] font-bold pl-1">Reference String</label>
          <input 
            type="text" 
            value={refStringInput}
            onChange={(e) => setRefStringInput(e.target.value)}
            className={`bg-[#1a2236] border border-[#2a3a50] text-[#ffffff] w-full rounded-xl px-4 h-12 text-lg font-mono placeholder:text-[#8899aa] font-semibold outline-none focus:border-[#00e5ff] transition-colors`}
            placeholder="e.g., 7 0 1 2 0 3 0 4 2 3"
          />
        </div>
        <div className="w-[120px] flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-[#8899aa] font-bold pl-1">Frames</label>
          <input 
            type="number" 
            min={1} max={7}
            value={framesInput}
            onChange={(e) => setFramesInput(e.target.value)}
            className={`bg-[#1a2236] border border-[#2a3a50] text-[#ffffff] w-full rounded-xl px-4 h-12 text-lg font-mono text-center font-semibold outline-none focus:border-[#00e5ff] transition-colors`}
          />
        </div>
        <div className="w-[200px] flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-[#8899aa] font-bold pl-1">Algorithm</label>
          <select 
            value={algoInput}
            onChange={(e) => setAlgoInput(e.target.value)}
            className={`bg-[#1a2236] border border-[#2a3a50] text-[#ffffff] w-full rounded-xl px-4 h-12 text-lg cursor-pointer font-semibold outline-none focus:border-[#00e5ff] transition-colors`}
          >
            <option value="FIFO">FIFO</option>
            <option value="LRU">LRU</option>
            <option value="Optimal">Optimal</option>
            <option value="Second Chance">Second Chance</option>
          </select>
        </div>
        <button 
          onClick={handleGenerate}
          className={`bg-[#00e5ff] text-[#0a0f1a] px-8 h-12 rounded-xl text-lg font-bold cursor-pointer flex items-center gap-3 shadow-md hover:scale-[1.02] transition-transform border-none`}
        >
          <Play size={20} fill="currentColor" /> Generate Matrix
        </button>
      </div>

      {/* Visualization */}
      <AnimatePresence mode="wait">
        {matrixData && (
          <motion.div 
            key={`${matrixData.algorithm}-${matrixData.total}-${matrixData.faults}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#141c2e] border border-[#2a3a50] shadow-[0_2px_12px_rgba(0,0,0,0.35)] rounded-[2rem] p-8 flex flex-col gap-8`}
          >
            <div className="w-full overflow-x-auto custom-scrollbar pb-6">
              <div className="inline-flex flex-col gap-2 p-6 bg-[#1a2236] rounded-2xl border border-[#2a3a50] shadow-inner">
                
                {/* Reference String Row */}
                <div className="flex gap-2 mb-4">
                  <div className="w-[100px] shrink-0 text-right pr-6 text-sm uppercase tracking-widest text-[#8899aa] font-bold flex items-center justify-end">
                    Ref String
                  </div>
                  {matrixData.history.map((step, idx) => (
                    <div key={`ref-${idx}`} className={`${s.matrixCell} ${s.matrixHeaderCell} text-[#ffffff] bg-[#1e2d3d] border border-[#2a3a50] rounded-t-xl shadow-sm`}>
                      {step.page}
                    </div>
                  ))}
                </div>

                {/* Frames Rows */}
                {Array.from({ length: matrixData.numFrames }).map((_, fIdx) => (
                  <div key={`frame-${fIdx}`} className="flex gap-2">
                    <div className="w-[100px] shrink-0 text-right pr-6 text-base text-[#ffffff] font-bold flex items-center justify-end">
                      Frame {fIdx}
                    </div>
                    {matrixData.history.map((step, idx) => {
                      const val = step.frames[fIdx];
                      const isTarget = step.targetFrame === fIdx;
                      return (
                        <div 
                          key={`f${fIdx}-s${idx}`} 
                          className={`${s.matrixCell} ${isTarget ? s.matrixCellFaultTarget : 'bg-[#1a2236]'} text-[#ffffff] border border-[#2a3a50] font-bold shadow-sm`}
                        >
                          {val === -1 ? '' : val}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Result Row */}
                <div className="flex gap-2 mt-4">
                  <div className="w-[100px] shrink-0 text-right pr-6 text-sm uppercase tracking-widest text-[#8899aa] font-bold flex items-center justify-end">
                    Result
                  </div>
                  {matrixData.history.map((step, idx) => (
                    <div key={`res-${idx}`} className={`${s.matrixCell} ${s.matrixResultCell} bg-[#1a2236] border border-[#2a3a50] rounded-b-xl shadow-sm ${step.hit ? 'text-[#00e5ff]' : 'text-red-400'}`}>
                      {step.hit ? 'H' : 'F'}
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="bg-[#141c2e] border border-[#2a3a50] shadow-sm rounded-2xl p-6 flex flex-col items-center">
                <span className="text-xs text-[#8899aa] uppercase tracking-widest font-bold mb-2">Total Accesses</span>
                <span className="text-3xl font-mono font-bold text-[#ffffff]">{matrixData.total}</span>
              </div>
              <div className="bg-[#1a2236] border border-[#2a3a50] shadow-sm rounded-2xl p-6 flex flex-col items-center">
                <span className="text-xs text-[#8899aa] uppercase tracking-widest font-bold mb-2">Page Faults</span>
                <span className="text-3xl font-mono font-bold text-red-400">{matrixData.faults}</span>
              </div>
              <div className="bg-[#1a2236] border border-[#2a3a50] shadow-sm rounded-2xl p-6 flex flex-col items-center">
                <span className="text-xs text-[#8899aa] uppercase tracking-widest font-bold mb-2">Page Hits</span>
                <span className="text-3xl font-mono font-bold text-[#00e5ff]">{matrixData.hits}</span>
              </div>
              <div className="bg-[#1a2236] border border-[#2a3a50] shadow-sm rounded-2xl p-6 flex flex-col items-center">
                <span className="text-xs text-[#8899aa] uppercase tracking-widest font-bold mb-2">Fault Rate</span>
                <span className="text-3xl font-mono font-bold text-[#00d4e8]">
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
