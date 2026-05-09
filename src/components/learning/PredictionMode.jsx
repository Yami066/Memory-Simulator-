import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Zap, RotateCcw, ArrowRight, Trophy, Target, CheckCircle, XCircle } from 'lucide-react';
import { runAlgoStep, APPS } from '../../utils/algorithms.js';
import { ALGO_LIST } from '../../data/quizData.js';
import s from '../../styles/mica.module.css';

/* Generate a random reference string using app IDs 1-7 */
function generateRefString(len = 10) {
  return Array.from({ length: len }, () => 1 + Math.floor(Math.random() * 7));
}

/* Map algorithm key to the one the simulator uses */
function mapAlgoKey(key) {
  if (key === 'SecondChance') return 'FIFO'; // fallback for practice
  if (key === 'OPT') return 'OPT';
  return key;
}

export default function PredictionMode({ algorithm, onNavigate, onComplete }) {
  const algoMeta = ALGO_LIST.find(a => a.key === algorithm);
  const simAlgo = mapAlgoKey(algorithm);
  const frameCount = 3;

  const [refString, setRefString] = useState(() => generateRefString(10));
  const [stepIndex, setStepIndex] = useState(0);
  const [frames, setFrames] = useState(Array(frameCount).fill(-1));
  const [fifoQ, setFifoQ] = useState([]);
  const [lruOrd, setLruOrd] = useState([]);
  const [mruOrd, setMruOrd] = useState([]);
  const [loadOrd, setLoadOrd] = useState(Array(frameCount).fill(0));
  const [loadCtr, setLoadCtr] = useState(0);

  const [phase, setPhase] = useState('predict'); // 'predict' | 'evict' | 'feedback' | 'done'
  const [prediction, setPrediction] = useState(null); // 'hit' | 'fault'
  const [evictChoice, setEvictChoice] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null); // { correct, msg, actualResult }

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [correctPredictions, setCorrectPredictions] = useState(0);
  const [history, setHistory] = useState([]);
  const [shakeTrigger, setShakeTrigger] = useState(false);
  const [confetti, setConfetti] = useState([]);

  const currentPage = stepIndex < refString.length ? refString[stepIndex] : null;
  const currentApp = currentPage ? APPS.find(a => a.id === currentPage) : null;
  const isMemoryFull = frames.every(f => f > 0);

  const spawnConfetti = useCallback(() => {
    const particles = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      x: 40 + Math.random() * 20,
      y: 20 + Math.random() * 10,
      color: ['#6ccb5f', '#60cdff', '#fbbf24', '#a855f7'][Math.floor(Math.random() * 4)],
      size: 4 + Math.random() * 5,
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 1200);
  }, []);

  const processStep = useCallback((userPrediction, userEvictFrame) => {
    const framesClone = [...frames];
    const fifoClone = [...fifoQ];
    const lruClone = [...lruOrd];
    const mruClone = [...mruOrd];
    const loadClone = [...loadOrd];
    let lc = loadCtr;

    const result = runAlgoStep(
      currentPage, stepIndex, framesClone, frameCount,
      simAlgo, fifoClone, lruClone, refString, loadClone, lc, mruClone
    );
    if (result.loadCtr !== undefined) lc = result.loadCtr;

    const actualIsHit = result.hit;
    const predictionCorrect = (userPrediction === 'hit') === actualIsHit;

    let evictionCorrect = true;
    if (!actualIsHit && isMemoryFull && userEvictFrame !== null) {
      evictionCorrect = userEvictFrame === result.frameIdx;
    }

    const totalCorrect = predictionCorrect && (actualIsHit || !isMemoryFull || evictionCorrect);

    setTotalPredictions(prev => prev + 1);
    if (totalCorrect) {
      setCorrectPredictions(prev => prev + 1);
      setScore(prev => prev + 15);
      setStreak(prev => {
        const n = prev + 1;
        setMaxStreak(ms => Math.max(ms, n));
        if (n >= 5) spawnConfetti();
        return n;
      });
    } else {
      setStreak(0);
      setShakeTrigger(true);
      setTimeout(() => setShakeTrigger(false), 500);
    }

    const appName = currentApp?.name || `Page ${currentPage}`;
    let msg = '';
    if (actualIsHit) {
      msg = `${appName} was a HIT — found in Frame ${result.frameIdx}.`;
    } else {
      const victimApp = result.victim > 0 ? APPS.find(a => a.id === result.victim) : null;
      const vName = victimApp ? victimApp.name : (result.victim > 0 ? `Page ${result.victim}` : 'empty slot');
      msg = `${appName} was a FAULT — loaded into Frame ${result.frameIdx}` +
        (result.victim > 0 ? ` (evicted ${vName})` : '') + '.';
    }

    setFeedbackData({
      correct: totalCorrect,
      predictionCorrect,
      evictionCorrect: actualIsHit || !isMemoryFull || evictionCorrect,
      msg,
      actualResult: actualIsHit ? 'hit' : 'fault',
      frameIdx: result.frameIdx,
    });

    setFrames(framesClone);
    setFifoQ(fifoClone);
    setLruOrd(lruClone);
    setMruOrd(mruClone);
    setLoadOrd(loadClone);
    setLoadCtr(lc);

    setHistory(prev => [...prev, {
      page: currentPage,
      predicted: userPrediction,
      actual: actualIsHit ? 'hit' : 'fault',
      correct: totalCorrect,
      frames: [...framesClone],
    }]);

    setPhase('feedback');
  }, [frames, fifoQ, lruOrd, mruOrd, loadOrd, loadCtr, currentPage, stepIndex, frameCount, simAlgo, refString, isMemoryFull, currentApp, spawnConfetti]);

  const handlePredict = (pred) => {
    setPrediction(pred);
    if (pred === 'fault' && isMemoryFull) {
      setPhase('evict');
    } else {
      processStep(pred, null);
    }
  };

  const handleEvict = (frameIdx) => {
    setEvictChoice(frameIdx);
    processStep(prediction, frameIdx);
  };

  const handleNext = () => {
    if (stepIndex + 1 >= refString.length) {
      setPhase('done');
      onComplete?.(algorithm, score);
      return;
    }
    setStepIndex(prev => prev + 1);
    setPrediction(null);
    setEvictChoice(null);
    setFeedbackData(null);
    setPhase('predict');
  };

  const handleRestart = () => {
    setRefString(generateRefString(10));
    setStepIndex(0);
    setFrames(Array(frameCount).fill(-1));
    setFifoQ([]);
    setLruOrd([]);
    setMruOrd([]);
    setLoadOrd(Array(frameCount).fill(0));
    setLoadCtr(0);
    setPhase('predict');
    setPrediction(null);
    setEvictChoice(null);
    setFeedbackData(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalPredictions(0);
    setCorrectPredictions(0);
    setHistory([]);
  };

  // ═══ GAME OVER SCREEN ═══
  if (phase === 'done') {
    const accuracy = totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0;
    return (
      <div className="w-full h-full overflow-y-auto px-4 pb-6">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${s.panelGlass} rounded-xl p-8 text-center flex flex-col items-center gap-5`}
          >
            <Target size={48} className="text-[var(--win-accent)]" />
            <h2 className="text-xl font-bold text-white">Prediction Complete!</h2>
            <p className="text-sm text-[var(--win-text-secondary)]">{algoMeta?.name} — {accuracy}% accuracy</p>

            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="bg-white/[0.04] rounded-lg p-3">
                <p className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">Score</p>
                <p className="text-lg font-bold font-mono text-[var(--win-accent)]">{score}</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-3">
                <p className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">Accuracy</p>
                <p className="text-lg font-bold font-mono text-[var(--color-hit)]">{accuracy}%</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-3">
                <p className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">Streak</p>
                <p className="text-lg font-bold font-mono text-amber-400">{maxStreak}🔥</p>
              </div>
            </div>

            {/* History */}
            <div className="w-full bg-white/[0.02] rounded-lg p-3 max-h-[150px] overflow-y-auto">
              <p className="text-[9px] uppercase tracking-[2px] text-[var(--win-text-secondary)] font-semibold mb-2">Round History</p>
              {history.map((h, i) => {
                const app = APPS.find(a => a.id === h.page);
                return (
                  <div key={i} className="flex items-center justify-between text-[10px] py-1 border-b border-white/[0.04] last:border-0">
                    <span className="text-white/60">{i + 1}. {app?.name || `P${h.page}`}</span>
                    <div className="flex items-center gap-2">
                      <span className={h.actual === 'hit' ? 'text-[var(--color-hit)]' : 'text-[var(--color-miss)]'}>
                        {h.actual.toUpperCase()}
                      </span>
                      {h.correct
                        ? <CheckCircle size={10} className="text-green-400" />
                        : <XCircle size={10} className="text-red-400" />
                      }
                    </div>
                  </div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2"
            >
              <Zap size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">+{score} XP earned!</span>
            </motion.div>

            <div className="flex gap-3">
              <button onClick={handleRestart} className={`${s.fluentBtn} px-4 py-2 rounded-lg text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center gap-1.5`}>
                <RotateCcw size={12} /> Play Again
              </button>
              <button onClick={() => onNavigate('home')} className={`${s.fluentBtnPrimary} px-4 py-2 rounded-lg text-[11px] font-semibold text-white cursor-pointer`}>
                Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══ GAME SCREEN ═══
  return (
    <div className="w-full h-full overflow-y-auto px-4 pb-6">
      {/* Confetti */}
      <AnimatePresence>
        {confetti.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: `${p.x}%`, y: `${p.y}%`, scale: 1 }}
            animate={{ opacity: 0, x: `${p.x + (Math.random() - 0.5) * 25}%`, y: `${p.y - 25}%`, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed pointer-events-none z-50"
            style={{ width: p.size, height: p.size, borderRadius: '50%', background: p.color }}
          />
        ))}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => onNavigate('home')} className={`${s.fluentBtn} px-2 py-1 rounded text-[11px] font-medium text-[var(--win-text)] cursor-pointer`}>
            ← Back
          </button>
          <div className="flex-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Gamepad2 size={16} style={{ color: algoMeta?.color }} />
              {algoMeta?.name} — Predict Mode
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {streak >= 3 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[11px] font-bold text-amber-400">
                🔥{streak}
              </motion.span>
            )}
            <span className="text-[11px] font-mono text-[var(--win-accent)]">{score} XP</span>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: algoMeta?.color || 'var(--win-accent)' }}
            animate={{ width: `${((stepIndex + 1) / refString.length) * 100}%` }}
          />
        </div>

        {/* Reference String */}
        <div className="flex flex-wrap gap-1 items-center justify-center mb-4">
          <span className="text-[9px] uppercase tracking-[2px] text-[var(--win-text-secondary)] font-semibold mr-2">Queue:</span>
          {refString.map((p, i) => {
            const app = APPS.find(a => a.id === p);
            return (
              <span
                key={i}
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded transition-all ${
                  i < stepIndex ? 'bg-white/[0.02] text-white/20 line-through'
                  : i === stepIndex ? 'ring-1 font-bold' : 'bg-white/[0.04] text-white/50'
                }`}
                style={i === stepIndex ? { color: app?.color, borderColor: app?.color + '60', background: app?.color + '15' } : {}}
              >
                {app?.name?.[0] || p}
              </span>
            );
          })}
        </div>

        {/* Memory Frames */}
        <div className="flex justify-center gap-3 mb-5">
          {frames.map((fId, i) => {
            const app = fId > 0 ? APPS.find(a => a.id === fId) : null;
            const isTarget = feedbackData && feedbackData.frameIdx === i;
            return (
              <motion.div
                key={i}
                animate={{
                  scale: isTarget ? [1, 1.1, 1] : 1,
                  borderColor: phase === 'evict' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                }}
                className={`${s.ramSlot} w-20 h-24 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  phase === 'evict' && fId > 0 ? 'cursor-pointer hover:!border-[var(--color-miss)] hover:!bg-red-500/10' : ''
                }`}
                onClick={() => phase === 'evict' && fId > 0 ? handleEvict(i) : null}
              >
                <span className="text-[8px] uppercase tracking-wider text-[var(--win-text-secondary)]">F{i}</span>
                {app ? (
                  <>
                    <app.Icon size={20} style={{ color: app.color }} />
                    <span className="text-[9px] text-white/60 font-medium">{app.name}</span>
                  </>
                ) : (
                  <span className="text-[11px] text-white/20">Empty</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Current Page Info */}
        {currentPage && (
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, ...(shakeTrigger ? { x: [-6, 6, -6, 6, 0] } : {}) }}
            className={`${s.panelGlass} rounded-xl p-5 flex flex-col gap-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentApp && <currentApp.Icon size={24} style={{ color: currentApp.color }} />}
                <div>
                  <p className="text-sm font-bold text-white">
                    {currentApp?.name || `Page ${currentPage}`} wants to load
                  </p>
                  <p className="text-[10px] text-[var(--win-text-secondary)]">
                    Step {stepIndex + 1} of {refString.length} • {algorithm}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[var(--win-text-secondary)]">
                {correctPredictions}/{totalPredictions} correct
              </span>
            </div>

            {/* PREDICT PHASE */}
            {phase === 'predict' && (
              <div className="flex flex-col gap-3">
                <p className="text-[12px] text-[var(--win-text-secondary)] text-center font-medium">
                  Will this be a HIT or a FAULT?
                </p>
                <div className="flex gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePredict('hit')}
                    className="flex-1 max-w-[160px] py-3 rounded-xl border-2 border-green-500/30 bg-green-500/[0.06] text-green-300 font-bold text-sm cursor-pointer hover:bg-green-500/[0.12] hover:border-green-500/50 transition-all"
                  >
                    ✓ HIT
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePredict('fault')}
                    className="flex-1 max-w-[160px] py-3 rounded-xl border-2 border-red-500/30 bg-red-500/[0.06] text-red-300 font-bold text-sm cursor-pointer hover:bg-red-500/[0.12] hover:border-red-500/50 transition-all"
                  >
                    ✗ FAULT
                  </motion.button>
                </div>
              </div>
            )}

            {/* EVICT PHASE */}
            {phase === 'evict' && (
              <div className="flex flex-col gap-2">
                <p className="text-[12px] text-[var(--win-text-secondary)] text-center font-medium">
                  Which frame will {algorithm} evict? Click a frame above.
                </p>
              </div>
            )}

            {/* FEEDBACK PHASE */}
            {phase === 'feedback' && feedbackData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                <div className={`p-3 rounded-lg border text-[12px] leading-relaxed flex items-start gap-2 ${
                  feedbackData.correct
                    ? 'bg-green-500/[0.06] border-green-500/20 text-green-200'
                    : 'bg-red-500/[0.06] border-red-500/20 text-red-200'
                }`}>
                  {feedbackData.correct
                    ? <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="font-semibold mb-0.5">
                      {feedbackData.correct ? 'Correct!' : 'Not quite!'}
                    </p>
                    <p className="text-[11px] opacity-80">{feedbackData.msg}</p>
                    {!feedbackData.predictionCorrect && (
                      <p className="text-[10px] opacity-60 mt-1">
                        You predicted {prediction?.toUpperCase()} but it was {feedbackData.actualResult.toUpperCase()}.
                      </p>
                    )}
                    {feedbackData.predictionCorrect && !feedbackData.evictionCorrect && (
                      <p className="text-[10px] opacity-60 mt-1">
                        Correct prediction, but wrong eviction frame.
                      </p>
                    )}
                  </div>
                </div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleNext}
                  className={`${s.fluentBtnPrimary} self-end px-4 py-2 rounded-lg text-[11px] font-semibold text-white cursor-pointer flex items-center gap-1.5`}
                >
                  {stepIndex + 1 >= refString.length ? 'See Results' : 'Next'} <ArrowRight size={12} />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
