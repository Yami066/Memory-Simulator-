import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, BookOpen, Brain, AlertTriangle, Lightbulb,
  ArrowRight, ArrowDownToLine, Package, ListOrdered, Scale, Clock,
  BarChart3, Wrench, Eye, Zap, TrendingUp, Timer, CheckCircle, XCircle,
  RefreshCw, ThumbsUp, ThumbsDown
} from 'lucide-react';
import ClockVisualization from './ClockVisualization.jsx';
import s from '../../styles/mica.module.css';

/* Icon map for concept cards */
const ICON_MAP = {
  'how-works': ArrowDownToLine,
  'queue': Package,
  'steps': ListOrdered,
  'anomaly': AlertTriangle,
  'pros-cons': Scale,
  'clock': Clock,
  'recency': BarChart3,
  'implement': Wrench,
  'impossible': Zap,
  'benchmark': TrendingUp,
  'demo': Timer,
  'ref-bit': Eye,
  'refresh': RefreshCw,
};

/* ═══ CONCEPT DATA PER ALGORITHM ═══ */
const CONCEPTS = {
  FIFO: {
    title: 'First In, First Out (FIFO)',
    color: '#3b82f6',
    cards: [
      {
        title: 'How FIFO Works',
        iconKey: 'how-works',
        content: 'FIFO replaces the **oldest** page in memory — the one that was loaded first. Think of it like a queue at a store: the first person in line is the first to leave.',
        visual: 'queue',
        keyPoints: ['Simple queue-based eviction', 'No recency tracking', 'Easy to implement'],
      },
      {
        title: 'Queue Behavior',
        iconKey: 'queue',
        content: 'Pages enter the queue from the **back** and are evicted from the **front**. When memory is full and a new page arrives, the front page is removed regardless of how often it was used.',
        visual: 'queue-anim',
        keyPoints: ['New pages → back of queue', 'Evictions → front of queue', 'Order is strictly by arrival time'],
      },
      {
        title: 'Step-by-Step Example',
        iconKey: 'steps',
        content: 'Reference string: **1, 2, 3, 4, 1, 2** with **3 frames**',
        steps: [
          { ref: 1, frames: [1, '-', '-'], result: 'FAULT', note: 'Page 1 loaded into empty frame' },
          { ref: 2, frames: [1, 2, '-'], result: 'FAULT', note: 'Page 2 loaded into empty frame' },
          { ref: 3, frames: [1, 2, 3], result: 'FAULT', note: 'Page 3 loaded — memory now full' },
          { ref: 4, frames: [4, 2, 3], result: 'FAULT', note: 'Page 4 replaces Page 1 (oldest)' },
          { ref: 1, frames: [4, 1, 3], result: 'FAULT', note: 'Page 1 replaces Page 2 (now oldest)' },
          { ref: 2, frames: [4, 1, 2], result: 'FAULT', note: 'Page 2 replaces Page 3 → 6 total faults' },
        ],
      },
      {
        title: "Belady's Anomaly",
        iconKey: 'anomaly',
        content: "**Belady's Anomaly** is a surprising phenomenon unique to FIFO: sometimes, adding MORE frames leads to MORE page faults! This is counter-intuitive because you'd expect more memory to always help.",
        keyPoints: [
          'Only affects FIFO (not LRU or OPT)',
          'More frames ≠ always fewer faults',
          'Discovered by László Bélády in 1969',
          'This is why FIFO is considered unreliable'
        ],
        highlight: true,
      },
      {
        title: 'Pros & Cons',
        iconKey: 'pros-cons',
        pros: ['Very simple to implement', 'Low overhead — just a queue pointer', 'Predictable behavior'],
        cons: ["Suffers from Belady's Anomaly", 'Ignores page usage patterns', 'May evict frequently-used pages', 'Generally more faults than LRU'],
      },
    ],
  },

  LRU: {
    title: 'Least Recently Used (LRU)',
    color: '#06b6d4',
    cards: [
      {
        title: 'How LRU Works',
        iconKey: 'how-works',
        content: 'LRU evicts the page that **has not been used for the longest time**. It assumes that pages used recently will be used again soon — this is called **temporal locality**.',
        keyPoints: ['Evicts least recently accessed page', 'Exploits temporal locality', 'Better than FIFO in most cases'],
      },
      {
        title: 'Recency Tracking',
        iconKey: 'recency',
        content: 'Every time a page is accessed (hit or load), it moves to the **most recently used** position. The page at the "bottom" of the recency stack is the LRU victim.',
        visual: 'recency',
        keyPoints: ['Every access updates recency', 'Most recent → safe from eviction', 'Least recent → next eviction candidate'],
      },
      {
        title: 'Step-by-Step Example',
        iconKey: 'steps',
        content: 'Reference string: **1, 2, 3, 2, 1, 4** with **3 frames**',
        steps: [
          { ref: 1, frames: [1, '-', '-'], result: 'FAULT', note: 'Page 1 loaded' },
          { ref: 2, frames: [1, 2, '-'], result: 'FAULT', note: 'Page 2 loaded' },
          { ref: 3, frames: [1, 2, 3], result: 'FAULT', note: 'Page 3 loaded — memory full' },
          { ref: 2, frames: [1, 2, 3], result: 'HIT', note: 'Page 2 found! LRU order: 1,3,2' },
          { ref: 1, frames: [1, 2, 3], result: 'HIT', note: 'Page 1 found! LRU order: 3,2,1' },
          { ref: 4, frames: [4, 2, 1], result: 'FAULT', note: 'Page 4 replaces Page 3 (least recent) → 4 faults' },
        ],
      },
      {
        title: 'Implementation Methods',
        iconKey: 'implement',
        content: 'LRU can be implemented using: **counters** (timestamp each access), **stack** (move accessed page to top), or **hash map + doubly linked list** (O(1) operations).',
        keyPoints: [
          'Counter method: store last-access time for each page',
          'Stack method: move to top on access, evict bottom',
          'HashMap+DLL: O(1) access and reorder — most efficient',
          'Hardware support: expensive but ideal'
        ],
      },
      {
        title: 'Pros & Cons',
        iconKey: 'pros-cons',
        pros: ['No Belady\'s Anomaly (stack algorithm)', 'Good performance with locality', 'Closely approximates optimal', 'Widely used in practice (approximations)'],
        cons: ['Expensive to implement perfectly', 'Requires tracking every access', 'Hardware implementation is costly', 'Overhead with many pages'],
      },
    ],
  },

  OPT: {
    title: 'Optimal (MIN) Algorithm',
    color: '#a855f7',
    cards: [
      {
        title: 'How Optimal Works',
        iconKey: 'how-works',
        content: 'The Optimal algorithm replaces the page that will **not be used for the longest time in the future**. It guarantees the minimum possible page faults.',
        keyPoints: ['Looks into the FUTURE', 'Evicts farthest-future page', 'Theoretical best — minimum faults possible'],
      },
      {
        title: 'Why It\'s Impossible',
        iconKey: 'impossible',
        content: 'OPT requires knowing the **complete future reference string** before execution. In real operating systems, we cannot predict which pages will be needed next — making OPT purely theoretical.',
        keyPoints: [
          'Requires future knowledge',
          'Cannot be implemented at runtime',
          'Used only as a benchmark',
          'Proves how close other algorithms get to "perfect"'
        ],
        highlight: true,
      },
      {
        title: 'Step-by-Step Example',
        iconKey: 'steps',
        content: 'Reference string: **1, 2, 3, 4, 1, 2** with **3 frames**',
        steps: [
          { ref: 1, frames: [1, '-', '-'], result: 'FAULT', note: 'Page 1 loaded' },
          { ref: 2, frames: [1, 2, '-'], result: 'FAULT', note: 'Page 2 loaded' },
          { ref: 3, frames: [1, 2, 3], result: 'FAULT', note: 'Page 3 loaded — memory full' },
          { ref: 4, frames: [1, 2, 4], result: 'FAULT', note: 'Page 4 replaces Page 3 (3 never used again!)' },
          { ref: 1, frames: [1, 2, 4], result: 'HIT', note: 'Page 1 found in memory' },
          { ref: 2, frames: [1, 2, 4], result: 'HIT', note: 'Page 2 found → only 4 faults total!' },
        ],
      },
      {
        title: 'Benchmarking Value',
        iconKey: 'benchmark',
        content: 'OPT is invaluable as a **yardstick**. When developing a new page replacement algorithm, you compare its fault count against OPT to measure how close to "perfect" it is.',
        keyPoints: [
          'FIFO typically 20-40% worse than OPT',
          'LRU is usually within 10-20% of OPT',
          'Helps justify algorithm choices',
          'Proves whether improvements are possible'
        ],
      },
      {
        title: 'Pros & Cons',
        iconKey: 'pros-cons',
        pros: ['Guaranteed minimum faults', 'No Belady\'s Anomaly', 'Perfect benchmark', 'Elegant theoretical model'],
        cons: ['Impossible to implement in practice', 'Requires full future knowledge', 'Only useful for analysis', 'Cannot be used in real OS kernels'],
      },
    ],
  },

  SecondChance: {
    title: 'Second Chance (Clock)',
    color: '#f59e0b',
    cards: [
      {
        title: 'How Second Chance Works',
        iconKey: 'refresh',
        content: 'Second Chance enhances FIFO by adding a **reference bit** to each page. Before evicting the oldest page, it checks: was this page recently used? If yes, give it a "second chance" by clearing its bit and moving on.',
        keyPoints: ['Enhancement of FIFO', 'Uses reference bit (0 or 1)', 'Gives recently-used pages a second chance'],
      },
      {
        title: 'The Clock Mechanism',
        iconKey: 'clock',
        content: 'Pages are arranged in a **circular buffer** (like a clock face). A pointer rotates around the circle. When a page fault occurs, the pointer scans until it finds a page with reference bit = 0.',
        visual: 'clock',
        keyPoints: [
          'Circular buffer → "clock" analogy',
          'Pointer scans clockwise',
          'Bit=1 → reset to 0, skip (second chance)',
          'Bit=0 → evict this page'
        ],
      },
      {
        title: 'Reference Bit Behavior',
        iconKey: 'ref-bit',
        content: 'The reference bit is **set to 1** whenever a page is accessed. When the clock pointer reaches a page: if bit=1, reset to 0 and advance; if bit=0, evict the page.',
        steps: [
          { ref: 'Access', frames: ['bit → 1'], result: 'SET', note: 'Any access sets the reference bit to 1' },
          { ref: 'Scan', frames: ['bit=1 → 0'], result: 'SKIP', note: 'Pointer finds bit=1: reset to 0, advance pointer' },
          { ref: 'Scan', frames: ['bit=0'], result: 'EVICT', note: 'Pointer finds bit=0: evict this page, load new one' },
        ],
      },
      {
        title: 'Interactive Clock Demo',
        iconKey: 'demo',
        content: 'Watch the clock algorithm in action! The pointer scans the circular buffer, checking reference bits and making replacement decisions.',
        visual: 'clock-interactive',
      },
      {
        title: 'Pros & Cons',
        iconKey: 'pros-cons',
        pros: ['Better than pure FIFO', 'Low overhead with hardware support', 'Approximates LRU behavior', 'Used in real operating systems (Linux)'],
        cons: ['Not as good as true LRU', 'Can degenerate to FIFO (all bits=0)', 'Additional bit storage needed', 'Needs hardware reference bit support'],
      },
    ],
  },
};

/* ═══ QUEUE ANIMATION SUB-COMPONENT ═══ */
function QueueAnimation({ color }) {
  const [queue, setQueue] = useState([1, 2, 3]);
  const [nextPage, setNextPage] = useState(4);

  const handleEnqueue = () => {
    setQueue(prev => {
      const newQ = [...prev.slice(1), nextPage];
      return newQ;
    });
    setNextPage(prev => prev + 1);
  };

  return (
    <div className="flex flex-col items-center gap-3 py-3">
      <div className="flex items-center gap-2">
        <span className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">EVICT ←</span>
        <div className="flex gap-1.5">
          <AnimatePresence mode="popLayout">
            {queue.map((p) => (
              <motion.div
                key={p}
                layout
                initial={{ scale: 0, opacity: 0, x: 30 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0, opacity: 0, x: -30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono border"
                style={{
                  background: `${color}15`,
                  borderColor: `${color}40`,
                  color: color,
                }}
              >
                {p}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">← NEW</span>
      </div>
      <button
        onClick={handleEnqueue}
        className={`${s.fluentBtn} px-3 py-1 rounded text-[10px] font-medium text-[var(--win-text)] cursor-pointer`}
      >
        Load Page {nextPage} →
      </button>
    </div>
  );
}

/* ═══ RECENCY BAR SUB-COMPONENT ═══ */
function RecencyBar() {
  const [pages, setPages] = useState([
    { id: 3, recency: 0.2 },
    { id: 1, recency: 0.5 },
    { id: 5, recency: 0.9 },
  ]);

  const handleAccess = (id) => {
    setPages(prev => {
      const updated = prev.map(p =>
        p.id === id ? { ...p, recency: 1.0 } : { ...p, recency: Math.max(0.05, p.recency - 0.15) }
      );
      return updated.sort((a, b) => a.recency - b.recency);
    });
  };

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">
        <span>← Least Recent (evict first)</span>
        <span className="ml-auto">Most Recent (safe) →</span>
      </div>
      <div className="flex gap-2">
        {pages.map((p) => (
          <motion.button
            key={p.id}
            layout
            onClick={() => handleAccess(p.id)}
            className="flex-1 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono cursor-pointer border transition-all"
            style={{
              background: `rgba(6,182,212,${p.recency * 0.3})`,
              borderColor: `rgba(6,182,212,${p.recency * 0.6})`,
              color: `rgba(255,255,255,${0.4 + p.recency * 0.6})`,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            P{p.id}
          </motion.button>
        ))}
      </div>
      <p className="text-[10px] text-center text-[var(--win-text-secondary)]">Click a page to "access" it and see its recency change</p>
    </div>
  );
}

/* ═══ STEP TABLE SUB-COMPONENT ═══ */
function StepTable({ steps }) {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="flex flex-col gap-1.5 py-2">
      {/* Header */}
      <div className="grid grid-cols-[48px_1fr_72px] gap-2 text-[9px] uppercase tracking-[0.15em] text-[var(--win-text-secondary)] font-semibold px-3 pb-1 border-b border-white/[0.06]">
        <span>Ref</span>
        <span>Frames</span>
        <span className="text-right">Result</span>
      </div>
      {/* Rows */}
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: i <= currentStep ? 1 : 0.25, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`grid grid-cols-[48px_1fr_72px] gap-2 items-center px-3 py-2 rounded-lg transition-all ${
            i === currentStep ? 'bg-white/[0.06] border border-white/[0.1] shadow-sm' : 'border border-transparent'
          }`}
        >
          <span className="text-[13px] font-bold font-mono text-white">{step.ref}</span>
          <div className="flex gap-1.5">
            {(Array.isArray(step.frames) ? step.frames : [step.frames]).map((f, fi) => (
              <span key={fi} className="text-[12px] font-mono px-2 py-1 rounded-md bg-white/[0.06] border border-white/[0.06] text-white/80 min-w-[32px] text-center">
                {f}
              </span>
            ))}
          </div>
          <span className={`text-[11px] font-bold text-right flex items-center justify-end gap-1 ${
            step.result === 'HIT' ? 'text-[var(--color-hit)]'
            : step.result === 'FAULT' ? 'text-[var(--color-miss)]'
            : step.result === 'SET' ? 'text-[var(--win-accent)]'
            : step.result === 'SKIP' ? 'text-amber-400'
            : step.result === 'EVICT' ? 'text-[var(--color-miss)]'
            : 'text-white/40'
          }`}>
            {step.result === 'HIT' && <CheckCircle size={11} />}
            {step.result === 'FAULT' && <XCircle size={11} />}
            {step.result}
          </span>
        </motion.div>
      ))}
      {/* Note */}
      {steps[currentStep]?.note && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-[var(--win-text-secondary)] text-center mt-1 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.04]"
        >
          <Lightbulb size={10} className="inline text-amber-400 mr-1.5 -mt-0.5" />
          {steps[currentStep].note}
        </motion.div>
      )}
      {/* Buttons */}
      <div className="flex justify-center gap-2 mt-1">
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
            className={`${s.fluentBtnPrimary} px-4 py-1.5 rounded-lg text-[11px] font-semibold text-white cursor-pointer flex items-center gap-1.5`}
          >
            Next Step <ChevronRight size={12} />
          </button>
        ) : (
          <button
            onClick={() => setCurrentStep(0)}
            className={`${s.fluentBtn} px-4 py-1.5 rounded-lg text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center gap-1.5`}
          >
            <RefreshCw size={11} /> Replay
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══ MAIN CONCEPT CARDS COMPONENT ═══ */
export default function ConceptCards({ algorithm, onNavigate, onComplete }) {
  const [cardIdx, setCardIdx] = useState(0);
  const data = CONCEPTS[algorithm];

  if (!data) return <div className="text-center text-white/50 p-8">Algorithm not found.</div>;

  const card = data.cards[cardIdx];
  const isLast = cardIdx === data.cards.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete?.(algorithm);
      onNavigate('quiz', algorithm);
    } else {
      setCardIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (cardIdx > 0) setCardIdx(prev => prev - 1);
  };

  return (
    <div className="w-full h-full overflow-y-auto flex justify-center">
      <div className="w-full max-w-3xl px-5 py-8 flex flex-col justify-center min-h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate('home')}
            className={`${s.fluentBtn} px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center gap-1`}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{data.title}</h2>
            <p className="text-[10px] text-[var(--win-text-secondary)] font-medium">
              Card {cardIdx + 1} of {data.cards.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/[0.06] rounded-full mb-5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: data.color }}
            animate={{ width: `${((cardIdx + 1) / data.cards.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>

        {/* Card Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={cardIdx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className={`${s.panelGlass} rounded-xl p-6 flex flex-col gap-4 ${
              card.highlight ? 'border-amber-500/20' : ''
            }`}
            style={card.highlight ? { boxShadow: '0 0 30px rgba(245,158,11,0.1)' } : {}}
          >
            {/* Card Title */}
            <div className="flex items-center gap-3">
              {(() => {
                const IconComp = ICON_MAP[card.iconKey];
                return IconComp ? (
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${data.color}18`, border: `1px solid ${data.color}30` }}>
                    <IconComp size={18} style={{ color: data.color }} />
                  </div>
                ) : null;
              })()}
              <h3 className="text-[16px] font-bold text-white leading-snug">{card.title}</h3>
            </div>

            {/* Main Content */}
            {card.content && (
              <p className="text-[13px] text-slate-300 leading-[1.7]"
                dangerouslySetInnerHTML={{
                  __html: card.content.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e4e4e4;font-weight:600">$1</strong>')
                }}
              />
            )}

            {/* Key Points */}
            {card.keyPoints && (
              <div className="flex flex-col gap-2 bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--win-text-secondary)] font-semibold mb-0.5">Key Takeaways</p>
                {card.keyPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb size={9} className="text-amber-400" />
                    </div>
                    <span className="text-[12px] text-slate-300 leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Step Table */}
            {card.steps && <StepTable steps={card.steps} />}

            {/* Queue Animation */}
            {card.visual === 'queue' && <QueueAnimation color={data.color} />}
            {card.visual === 'queue-anim' && <QueueAnimation color={data.color} />}

            {/* Recency Bar */}
            {card.visual === 'recency' && <RecencyBar />}

            {/* Clock Visualization */}
            {(card.visual === 'clock' || card.visual === 'clock-interactive') && (
              <ClockVisualization compact={card.visual === 'clock'} />
            )}

            {/* Pros & Cons */}
            {card.pros && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-green-500/[0.06] border border-green-500/[0.15] rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <ThumbsUp size={13} className="text-green-400" />
                    <p className="text-[10px] uppercase tracking-[0.15em] text-green-400 font-semibold">Advantages</p>
                  </div>
                  {card.pros.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1.5 last:mb-0">
                      <CheckCircle size={11} className="text-green-400/70 mt-0.5 shrink-0" />
                      <span className="text-[12px] text-green-200/80 leading-relaxed">{p}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-red-500/[0.06] border border-red-500/[0.15] rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <ThumbsDown size={13} className="text-red-400" />
                    <p className="text-[10px] uppercase tracking-[0.15em] text-red-400 font-semibold">Disadvantages</p>
                  </div>
                  {card.cons.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1.5 last:mb-0">
                      <XCircle size={11} className="text-red-400/70 mt-0.5 shrink-0" />
                      <span className="text-[12px] text-red-200/80 leading-relaxed">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handlePrev}
            disabled={cardIdx === 0}
            className={`${s.fluentBtn} px-3 py-2 rounded-lg text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-default`}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <div className="flex gap-1">
            {data.cards.map((_, i) => (
              <button
                key={i}
                onClick={() => setCardIdx(i)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  i === cardIdx ? 'bg-white/60 scale-125' : 'bg-white/15 hover:bg-white/25'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className={`${isLast ? s.fluentBtnPrimary : s.fluentBtn} px-3 py-2 rounded-lg text-[11px] font-medium ${
              isLast ? 'text-white font-semibold' : 'text-[var(--win-text)]'
            } cursor-pointer flex items-center gap-1.5`}
          >
            {isLast ? (
              <>Take Quiz <Brain size={14} /></>
            ) : (
              <>Next <ChevronRight size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
