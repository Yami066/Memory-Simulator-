import { motion } from 'framer-motion';
import { Trophy, Star, Target, Brain, Zap, CheckCircle, BarChart3 } from 'lucide-react';
import { ALGO_LIST } from '../../data/quizData.js';
import s from '../../styles/mica.module.css';

export default function Scoreboard({ progress, onNavigate }) {
  const totalXP = Object.values(progress).reduce((sum, p) => sum + (p.xp || 0), 0);
  const level = Math.floor(totalXP / 100) + 1;
  const levelProgress = totalXP % 100;

  const allAlgos = ALGO_LIST;

  // Calculate overall stats
  const totalQuizzes = Object.values(progress).filter(p => p.quizDone).length;
  const totalPractice = Object.values(progress).filter(p => p.practiceDone).length;
  const totalConcepts = Object.values(progress).filter(p => p.conceptDone).length;
  const avgQuizScore = (() => {
    const scores = Object.values(progress).filter(p => p.quizScore != null).map(p => p.quizScore);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();

  return (
    <div className="w-full h-full overflow-y-auto px-4 pb-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => onNavigate('home')}
            className={`${s.fluentBtn} px-2 py-1 rounded text-[11px] font-medium text-[var(--win-text)] cursor-pointer`}
          >
            ← Back
          </button>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy size={18} className="text-amber-400" />
              Scoreboard
            </h2>
            <p className="text-[10px] text-[var(--win-text-secondary)]">Track your learning progress</p>
          </div>
        </div>

        {/* Level & XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${s.panelGlass} rounded-xl p-6 mb-5 relative overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(251,191,36,0.3) 0%, transparent 60%)' }} />

          <div className="relative z-[1] flex flex-wrap items-center gap-6">
            {/* Level Circle */}
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="#fbbf24"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - levelProgress / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-amber-400">{level}</span>
                <span className="text-[8px] text-[var(--win-text-secondary)] uppercase">Level</span>
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <p className="text-sm text-[var(--win-text-secondary)] mb-1">Total Experience</p>
              <p className="text-3xl font-bold font-mono text-amber-400 mb-2">{totalXP} XP</p>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-[var(--win-text-secondary)] mt-1">
                {100 - levelProgress} XP to level {level + 1}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Concepts Read', value: totalConcepts, icon: CheckCircle, color: '#6ccb5f' },
            { label: 'Quizzes Passed', value: totalQuizzes, icon: Brain, color: '#60cdff' },
            { label: 'Practices Done', value: totalPractice, icon: Target, color: '#a855f7' },
            { label: 'Avg Quiz Score', value: `${avgQuizScore}%`, icon: BarChart3, color: '#f59e0b' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`${s.panelGlass} rounded-xl p-4 flex flex-col gap-2`}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
              <p className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">{stat.label}</p>
              <p className="text-xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Per-Algorithm Progress */}
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Zap size={14} className="text-[var(--win-accent)]" />
          Algorithm Progress
        </h3>
        <div className="flex flex-col gap-3">
          {allAlgos.map((algo, i) => {
            const p = progress[algo.key] || {};
            const steps = [
              { label: 'Learn', done: p.conceptDone },
              { label: 'Quiz', done: p.quizDone },
              { label: 'Practice', done: p.practiceDone },
            ];
            const completedSteps = steps.filter(st => st.done).length;
            const pct = Math.round((completedSteps / 3) * 100);

            return (
              <motion.div
                key={algo.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className={`${s.panelGlass} rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3`}
              >
                {/* Algo icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${algo.color}20`, border: `1px solid ${algo.color}40` }}
                >
                  <span className="text-lg font-bold" style={{ color: algo.color }}>
                    {algo.name[0]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{algo.name}</span>
                    {pct === 100 && (
                      <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-300 border border-green-500/20 font-bold">
                        ✓ Mastered
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: algo.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                    />
                  </div>

                  {/* Step badges */}
                  <div className="flex gap-2">
                    {steps.map(st => (
                      <span
                        key={st.label}
                        className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          st.done ? 'bg-green-500/10 text-green-300' : 'bg-white/[0.03] text-white/25'
                        }`}
                      >
                        {st.done ? '✓' : '○'} {st.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* XP for this algo */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold font-mono" style={{ color: algo.color }}>{p.xp || 0}</p>
                  <p className="text-[8px] uppercase tracking-wider text-[var(--win-text-secondary)]">XP</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
