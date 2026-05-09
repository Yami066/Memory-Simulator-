/* ========== APP DEFINITIONS ========== */
import {
  Globe, Code, Headphones, Gamepad2, Terminal,
  Mail, Settings
} from 'lucide-react';

export const APPS = [
  { id: 1, name: 'Chrome',   Icon: Globe,       color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)' },
  { id: 2, name: 'VS Code',  Icon: Code,        color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)' },
  { id: 3, name: 'Spotify',  Icon: Headphones,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)' },
  { id: 4, name: 'Discord',  Icon: Gamepad2,    color: '#818cf8', bg: 'rgba(129,140,248,0.12)', border: 'rgba(129,140,248,0.3)' },
  { id: 5, name: 'Terminal', Icon: Terminal,     color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.25)' },
  { id: 6, name: 'Mail',     Icon: Mail,        color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' },
  { id: 7, name: 'Settings', Icon: Settings,    color: '#64748b', bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.25)' },
];

export function getApp(id) {
  return APPS.find(a => a.id === id);
}

/* ========== ALGORITHM CORE (preserved exactly) ========== */
export function runAlgoStep(page, index, frames, frameCount, algo, fifoQ, lruOrd, refStr, loadOrd, loadCtr, mruOrd) {
  const fi = frames.indexOf(page);
  if (fi !== -1) {
    if (algo === 'LRU') { lruOrd.splice(lruOrd.indexOf(page), 1); lruOrd.push(page); }
    if (algo === 'MRU') { mruOrd.splice(mruOrd.indexOf(page), 1); mruOrd.push(page); }
    return { hit: true, frameIdx: fi, victim: -1, loadCtr };
  }
  let victim = -1, frameIdx = frames.indexOf(-1);
  if (frameIdx === -1) {
    if (algo === 'FIFO') { victim = fifoQ.shift(); frameIdx = frames.indexOf(victim); }
    else if (algo === 'LRU') { victim = lruOrd.shift(); frameIdx = frames.indexOf(victim); }
    else if (algo === 'MRU') { victim = mruOrd.pop(); frameIdx = frames.indexOf(victim); }
    else {
      let distances = [];
      for (let f = 0; f < frameCount; f++) { let nx = refStr.slice(index + 1).indexOf(frames[f]); distances.push(nx === -1 ? Infinity : nx); }
      let maxD = Math.max(...distances);
      let cands = [];
      for (let f = 0; f < frameCount; f++) { if (distances[f] === maxD) cands.push(f); }
      if (cands.length === 1) frameIdx = cands[0];
      else frameIdx = cands.reduce((best, f) => (loadOrd[f] < loadOrd[best]) ? f : best, cands[0]);
      victim = frames[frameIdx];
    }
  }
  frames[frameIdx] = page;
  fifoQ.push(page);
  if (algo === 'LRU') lruOrd.push(page);
  if (algo === 'MRU') mruOrd.push(page);
  if (loadOrd) loadOrd[frameIdx] = loadCtr;
  return { hit: false, frameIdx, victim, loadCtr: loadCtr + 1 };
}

export function silentRun(refStr, frameCount, algo) {
  const frames = Array(frameCount).fill(-1);
  const fifoQ = [], lruOrd = [], mruOrd = [];
  const loadOrd = Array(frameCount).fill(0);
  let loadCtr = 0, faults = 0;
  refStr.forEach((page, idx) => {
    const r = runAlgoStep(page, idx, frames, frameCount, algo, fifoQ, lruOrd, refStr, loadOrd, loadCtr, mruOrd);
    loadCtr = r.loadCtr !== undefined ? r.loadCtr : loadCtr;
    if (!r.hit) faults++;
  });
  return faults;
}

/* ========== MINI WINDOW POSITIONS ========== */
export const MINI_POSITIONS = [
  { top: '6%', left: '2%' },
  { top: '15%', left: '10%' },
  { top: '4%', left: '64%' },
  { top: '14%', left: '72%' },
  { top: '42%', left: '1%' },
  { top: '44%', left: '72%' },
];
