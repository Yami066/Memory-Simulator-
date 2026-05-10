import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Trophy, Zap, RotateCcw, CheckCircle, XCircle, ChevronLeft, Flame } from 'lucide-react';
import { getQuizQuestions, ALGO_LIST } from '../../data/quizData.js';
import s from '../../styles/mica.module.css';

export default function QuizMode({ algorithm, onNavigate, onComplete, isEmbedded }) {
  const algoMeta = ALGO_LIST.find(a => a.key === algorithm);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState([]);

  useEffect(() => {
    setQuestions(getQuizQuestions(algorithm, 10));
  }, [algorithm]);

  const spawnConfetti = useCallback(() => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: 40 + Math.random() * 20,
      y: 30 + Math.random() * 10,
      color: ['#6ccb5f', '#60cdff', '#fbbf24', '#a855f7', '#f472b6'][Math.floor(Math.random() * 5)],
      angle: Math.random() * 360,
      speed: 2 + Math.random() * 4,
      size: 4 + Math.random() * 6,
    }));
    setConfettiParticles(particles);
    setTimeout(() => setConfettiParticles([]), 1500);
  }, []);

  const handleSelect = (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);

    const q = questions[currentQ];
    const isCorrect = option === q.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 10);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(ms => Math.max(ms, newStreak));
        if (newStreak >= 3) spawnConfetti();
        return newStreak;
      });
    } else {
      setStreak(0);
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
    }
  };

  const handleNext = () => {
    if (currentQ >= questions.length - 1) {
      setShowResult(true);
      const finalScore = score + (selected === questions[currentQ]?.correctAnswer ? 10 : 0);
      const total = questions.length * 10;
      const correctCount = finalScore / 10;
      const pct = Math.round((finalScore / total) * 100);
      const grade = pct >= 90 ? 'S' : pct >= 70 ? 'A' : pct >= 50 ? 'B' : pct >= 30 ? 'C' : 'F';
      onComplete?.(algorithm, {
        score: finalScore,
        total,
        correct: correctCount,
        totalQuestions: questions.length,
        maxStreak: Math.max(maxStreak, streak + (selected === questions[currentQ]?.correctAnswer ? 1 : 0)),
        grade,
      });
      return;
    }
    setCurrentQ(prev => prev + 1);
    setSelected(null);
    setAnswered(false);
  };

  const handleRetry = () => {
    setQuestions(getQuizQuestions(algorithm, 10));
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setShowResult(false);
  };

  if (questions.length === 0) return null;

  // ═══ RESULT SCREEN ═══
  if (showResult) {
    const finalScore = score;
    const total = questions.length * 10;
    const pct = Math.round((finalScore / total) * 100);
    const grade = pct >= 90 ? 'S' : pct >= 70 ? 'A' : pct >= 50 ? 'B' : pct >= 30 ? 'C' : 'F';
    const gradeColor = pct >= 90 ? '#fbbf24' : pct >= 70 ? '#6ccb5f' : pct >= 50 ? '#60cdff' : pct >= 30 ? '#f59e0b' : '#ff6b6b';

    return (
      <div className={`w-full ${!isEmbedded ? 'h-full overflow-y-auto' : ''} flex justify-center`}>
        <div className={`w-full max-w-2xl px-5 ${!isEmbedded ? 'py-6' : 'py-2'} flex flex-col items-center justify-center ${!isEmbedded ? 'min-h-full' : ''}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${s.panelGlass} rounded-xl p-8 text-center flex flex-col items-center gap-5`}
          >
            <Trophy size={48} style={{ color: gradeColor }} />
            <h2 className="text-xl font-bold text-white">Quiz Complete!</h2>

            {/* Grade Circle */}
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={gradeColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pct / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black" style={{ color: gradeColor }}>{grade}</span>
                <span className="text-[10px] text-[var(--win-text-secondary)]">{pct}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="bg-white/[0.04] rounded-xl p-4 text-center border border-white/[0.06]">
                <div className="flex items-center justify-center gap-1 mb-1.5">
                  <Zap size={12} className="text-[var(--win-accent)]" />
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--win-text-secondary)] font-semibold">Score</p>
                </div>
                <p className="text-xl font-bold font-mono text-[var(--win-accent)]">{finalScore}<span className="text-sm text-white/30">/{total}</span></p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-4 text-center border border-white/[0.06]">
                <div className="flex items-center justify-center gap-1 mb-1.5">
                  <CheckCircle size={12} className="text-[var(--color-hit)]" />
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--win-text-secondary)] font-semibold">Correct</p>
                </div>
                <p className="text-xl font-bold font-mono text-[var(--color-hit)]">{finalScore / 10}<span className="text-sm text-white/30">/{questions.length}</span></p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-4 text-center border border-white/[0.06]">
                <div className="flex items-center justify-center gap-1 mb-1.5">
                  <Flame size={12} className="text-amber-400" />
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--win-text-secondary)] font-semibold">Streak</p>
                </div>
                <p className="text-xl font-bold font-mono text-amber-400">{maxStreak}</p>
              </div>
            </div>

            {/* XP Earned */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2"
            >
              <Zap size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">+{finalScore} XP earned!</span>
            </motion.div>

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleRetry}
                className={`${s.fluentBtn} px-4 py-2 rounded-lg text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center gap-1.5`}
              >
                <RotateCcw size={12} /> Retry
              </button>
              <button
                onClick={() => onNavigate('practice', algorithm)}
                className={`${s.fluentBtnPrimary} px-4 py-2 rounded-lg text-[11px] font-semibold text-white cursor-pointer flex items-center gap-1.5`}
              >
                Practice Mode <ArrowRight size={12} />
              </button>
            </div>

            <button
              onClick={() => onNavigate('home')}
              className="text-[11px] text-[var(--win-text-secondary)] hover:text-white transition-colors cursor-pointer mt-1"
            >
              ← Back to Learning Home
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══ QUIZ SCREEN ═══
  const q = questions[currentQ];

  return (
    <div className={`w-full ${!isEmbedded ? 'h-full overflow-y-auto' : ''} flex justify-center`}>
      <div className={`w-full max-w-2xl px-5 ${!isEmbedded ? 'py-8' : 'py-2'} flex flex-col justify-center ${!isEmbedded ? 'min-h-full' : ''}`}>
        {/* Confetti Layer */}
        <AnimatePresence>
          {confettiParticles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, x: `${p.x}%`, y: `${p.y}%`, scale: 1, rotate: 0 }}
              animate={{
                opacity: 0,
                x: `${p.x + (Math.random() - 0.5) * 30}%`,
                y: `${p.y - 20 - Math.random() * 30}%`,
                scale: 0,
                rotate: p.angle,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="fixed pointer-events-none z-50"
              style={{
                width: p.size,
                height: p.size,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                background: p.color,
              }}
            />
          ))}
        </AnimatePresence>

        {/* Header */}
        {!isEmbedded && (
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => onNavigate('home')}
              className={`${s.fluentBtn} px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center gap-1`}
            >
              <ChevronLeft size={14} /> Back
            </button>
            <div className="flex-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Brain size={16} style={{ color: algoMeta?.color }} />
                {algoMeta?.name} Quiz
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {streak >= 3 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[11px] font-bold text-amber-400"
                >
                  <Flame size={13} className="inline" /> {streak} streak!
                </motion.span>
              )}
              <span className="text-[11px] font-semibold font-mono text-[var(--win-accent)] bg-[var(--win-accent)]/10 px-2 py-0.5 rounded-md border border-[var(--win-accent)]/20">
                {score} XP
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full mb-5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: algoMeta?.color || 'var(--win-accent)' }}
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0, ...(shakeWrong ? { x: [-8, 8, -8, 8, 0] } : {}) }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className={`${s.panelGlass} rounded-xl p-6 flex flex-col gap-5`}
          >
            {/* Question Number & Difficulty */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[2px] text-[var(--win-text-secondary)] font-semibold">
                Question {currentQ + 1} of {questions.length}
              </span>
              <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                q.difficulty === 'Easy'
                  ? 'text-green-300 bg-green-500/10 border-green-500/20'
                  : q.difficulty === 'Medium'
                  ? 'text-amber-300 bg-amber-500/10 border-amber-500/20'
                  : 'text-red-300 bg-red-500/10 border-red-500/20'
              }`}>
                {q.difficulty}
              </span>
            </div>

            {/* Question Text */}
            <p className="text-[15px] font-semibold text-white leading-relaxed">
              {q.question}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {q.options.map((opt, i) => {
                const isSelected = selected === opt;
                const isCorrect = opt === q.correctAnswer;
                let optClass = 'border-white/10 hover:bg-white/[0.06] hover:border-white/20 bg-white/[0.02] text-slate-300 cursor-pointer';

                if (answered) {
                  if (isCorrect) {
                    optClass = 'border-green-500/50 bg-green-500/10 text-green-200';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'border-red-500/50 bg-red-500/10 text-red-200';
                  } else {
                    optClass = 'border-white/5 bg-white/[0.01] text-slate-500 opacity-50';
                  }
                }

                return (
                  <motion.button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    disabled={answered}
                    whileHover={!answered ? { scale: 1.01 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    className={`flex items-center justify-between text-left px-4 py-3 rounded-xl border transition-all duration-200 ${optClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40 shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-[13px] leading-relaxed">{opt}</span>
                    </div>
                    {answered && isCorrect && <CheckCircle size={16} className="text-green-400 shrink-0" />}
                    {answered && isSelected && !isCorrect && <XCircle size={16} className="text-red-400 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl border text-[13px] leading-relaxed ${
                    selected === q.correctAnswer
                      ? 'bg-green-500/[0.06] border-green-500/20 text-green-200'
                      : 'bg-amber-500/[0.06] border-amber-500/20 text-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {selected === q.correctAnswer
                      ? <CheckCircle size={15} className="text-green-400 mt-0.5 shrink-0" />
                      : <XCircle size={15} className="text-amber-400 mt-0.5 shrink-0" />
                    }
                    <div>
                      <span className="font-bold">
                        {selected === q.correctAnswer ? 'Correct! ' : 'Incorrect. '}
                      </span>
                      {q.explanation}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next Button */}
            {answered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className={`${s.fluentBtnPrimary} self-end px-4 py-2 rounded-lg text-[11px] font-semibold text-white cursor-pointer flex items-center gap-1.5`}
              >
                {currentQ >= questions.length - 1 ? 'See Results' : 'Next Question'} <ArrowRight size={12} />
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
