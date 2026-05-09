import { motion } from 'framer-motion';
import { BookOpen, Brain, Gamepad2, Trophy, Star, ChevronRight, Cpu, Layers } from 'lucide-react';
import { ALGO_LIST } from '../../data/quizData.js';
import s from '../../styles/mica.module.css';

export default function LearningHome({ onNavigate, progress }) {
  const totalCompleted = Object.values(progress).filter(p => p.conceptDone && p.quizDone).length;
  const totalXP = Object.values(progress).reduce((sum, p) => sum + (p.xp || 0), 0);

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-6 py-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-5"
        >
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
            Learn Page Replacement
          </h1>
          <p className="text-[12px] text-[var(--win-text-secondary)]">
            Pick an algorithm below. Read how it works, take the quiz, or jump into practice.
          </p>
        </motion.div>

        {/* Progress Summary Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`${s.panelGlass} rounded-xl p-3 mb-5 flex flex-wrap items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">Total XP</p>
                <p className="text-lg font-bold font-mono text-amber-400">{totalXP}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[var(--win-accent)]" />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">Mastered</p>
                <p className="text-lg font-bold font-mono text-[var(--win-accent)]">{totalCompleted}/{ALGO_LIST.length}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('scoreboard')}
            className={`${s.fluentBtn} px-3 py-1.5 rounded-md text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center gap-1.5`}
          >
            <Trophy size={12} /> View Scoreboard
          </button>
        </motion.div>

        {/* Algorithm Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALGO_LIST.map((algo, idx) => {
            const algoProgress = progress[algo.key] || {};
            const isStarted = algoProgress.conceptDone || algoProgress.quizDone || algoProgress.practiceDone;

            return (
              <motion.div
                key={algo.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.4 }}
                className={`${s.panelGlass} rounded-xl p-5 flex flex-col gap-4 group cursor-default
                  hover:border-white/20 transition-all duration-300 relative overflow-hidden`}
                style={{
                  '--card-glow': algo.glow,
                }}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${algo.glow} 0%, transparent 70%)`,
                  }}
                />

                {/* Header Row */}
                <div className="flex items-start justify-between relative z-[1]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${algo.color}20`, border: `1px solid ${algo.color}40` }}
                    >
                      <Cpu size={18} style={{ color: algo.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{algo.name}</h3>
                      <p className="text-[10px] text-[var(--win-text-secondary)]">{algo.fullName}</p>
                    </div>
                  </div>
                  {/* Difficulty badge */}
                  <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                    algo.difficulty === 'Easy'
                      ? 'text-green-300 bg-green-500/10 border-green-500/20'
                      : algo.difficulty === 'Medium'
                      ? 'text-amber-300 bg-amber-500/10 border-amber-500/20'
                      : 'text-red-300 bg-red-500/10 border-red-500/20'
                  }`}>
                    {algo.difficulty}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[12px] text-[var(--win-text-secondary)] leading-relaxed relative z-[1]">
                  {algo.description}
                </p>

                {/* Efficiency Rating */}
                <div className="flex items-center gap-2 relative z-[1]">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">Efficiency</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= algo.efficiency ? 'text-amber-400' : 'text-white/10'}
                        fill={star <= algo.efficiency ? '#fbbf24' : 'transparent'}
                      />
                    ))}
                  </div>
                </div>

                {/* Progress indicator */}
                {isStarted && (
                  <div className="flex gap-2 relative z-[1]">
                    <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      algoProgress.conceptDone ? 'bg-green-500/15 text-green-300' : 'bg-white/5 text-white/30'
                    }`}>
                      ✓ Learned
                    </span>
                    <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      algoProgress.quizDone ? 'bg-green-500/15 text-green-300' : 'bg-white/5 text-white/30'
                    }`}>
                      ✓ Quiz
                    </span>
                    <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      algoProgress.practiceDone ? 'bg-green-500/15 text-green-300' : 'bg-white/5 text-white/30'
                    }`}>
                      ✓ Practice
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 relative z-[1] mt-auto pt-1">
                  <button
                    onClick={() => onNavigate('learn', algo.key)}
                    className={`${s.fluentBtnPrimary} flex-1 min-w-[80px] px-3 py-2 rounded-lg text-[11px] font-semibold text-white cursor-pointer flex items-center justify-center gap-1.5`}
                    style={{ background: algo.color, borderColor: `${algo.color}80` }}
                  >
                    <BookOpen size={12} /> Learn
                  </button>
                  <button
                    onClick={() => onNavigate('quiz', algo.key)}
                    className={`${s.fluentBtn} flex-1 min-w-[80px] px-3 py-2 rounded-lg text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center justify-center gap-1.5`}
                  >
                    <Brain size={12} /> Quiz
                  </button>
                  <button
                    onClick={() => onNavigate('practice', algo.key)}
                    className={`${s.fluentBtn} flex-1 min-w-[80px] px-3 py-2 rounded-lg text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center justify-center gap-1.5`}
                  >
                    <Gamepad2 size={12} /> Practice
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
