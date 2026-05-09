import { motion } from 'framer-motion';
import { BookOpen, Brain, Gamepad2, Trophy, Star, Cpu, Layers, Sparkles, GraduationCap, Clock } from 'lucide-react';
import { ALGO_LIST } from '../../data/quizData.js';
import s from '../../styles/mica.module.css';

export default function LearningHome({ onNavigate, progress }) {
  const totalCompleted = Object.values(progress).filter(p => p.conceptDone && p.quizDone).length;
  const totalXP = Object.values(progress).reduce((sum, p) => sum + (p.xp || 0), 0);

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden flex justify-center">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col">

        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--win-accent)]/20 to-purple-500/20 border border-[var(--win-accent)]/20 flex items-center justify-center">
              <GraduationCap size={20} className="text-[var(--win-accent)]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Learn Page Replacement</h1>
          </div>
          <p className="text-[13px] text-[var(--win-text-secondary)] max-w-lg mx-auto leading-relaxed">
            Master memory management algorithms through interactive lessons, quizzes, and hands-on practice.
          </p>
        </motion.div>

        {/* Stats Dashboard Strip */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard icon={Trophy} iconColor="text-amber-400" bg="bg-amber-500/15" border="border-amber-500/20" label="Total XP" value={totalXP} valueColor="text-amber-400" />
          <StatCard icon={Layers} iconColor="text-[var(--win-accent)]" bg="bg-[var(--win-accent)]/15" border="border-[var(--win-accent)]/20" label="Mastered" value={`${totalCompleted}/${ALGO_LIST.length}`} valueColor="text-[var(--win-accent)]" />
          <StatCard icon={Sparkles} iconColor="text-green-400" bg="bg-green-500/15" border="border-green-500/20" label="Progress" value={`${Math.round((totalCompleted / ALGO_LIST.length) * 100)}%`} valueColor="text-green-400" />
          <button onClick={() => onNavigate('scoreboard')} className={`${s.panelGlass} rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-all group text-left`}>
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Trophy size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">Scoreboard</p>
              <p className="text-sm font-semibold text-purple-300">View →</p>
            </div>
          </button>
          <button onClick={() => onNavigate('history')} className={`${s.panelGlass} rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-all group text-left`}>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">Results</p>
              <p className="text-sm font-semibold text-cyan-300">History →</p>
            </div>
          </button>
        </motion.div>

        {/* Algorithm Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALGO_LIST.map((algo, idx) => {
            const ap = progress[algo.key] || {};
            const isStarted = ap.conceptDone || ap.quizDone || ap.practiceDone;
            const done = [ap.conceptDone, ap.quizDone, ap.practiceDone].filter(Boolean).length;

            return (
              <motion.div key={algo.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + idx * 0.08, duration: 0.4 }}
                className={`${s.panelGlass} rounded-xl p-5 flex flex-col gap-4 group cursor-default hover:border-white/20 transition-all duration-300 relative overflow-hidden`}
                style={{ '--card-glow': algo.glow }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${algo.glow} 0%, transparent 70%)` }} />

                {/* Header */}
                <div className="flex items-start justify-between relative z-[1]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${algo.color}18`, border: `1px solid ${algo.color}35` }}>
                      <Cpu size={20} style={{ color: algo.color }} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-white">{algo.name}</h3>
                      <p className="text-[10px] text-[var(--win-text-secondary)]">{algo.fullName}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${algo.difficulty === 'Easy' ? 'text-green-300 bg-green-500/10 border-green-500/20' : algo.difficulty === 'Medium' ? 'text-amber-300 bg-amber-500/10 border-amber-500/20' : 'text-red-300 bg-red-500/10 border-red-500/20'}`}>
                    {algo.difficulty}
                  </span>
                </div>

                <p className="text-[12px] text-[var(--win-text-secondary)] leading-relaxed relative z-[1]">{algo.description}</p>

                {/* Efficiency + Progress */}
                <div className="flex items-center justify-between relative z-[1]">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">Efficiency</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => <Star key={n} size={12} className={n <= algo.efficiency ? 'text-amber-400' : 'text-white/10'} fill={n <= algo.efficiency ? '#fbbf24' : 'transparent'} />)}
                    </div>
                  </div>
                  {isStarted && <span className="text-[10px] font-mono text-[var(--win-text-secondary)]">{done}/3</span>}
                </div>

                {isStarted && (
                  <div className="relative z-[1]">
                    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                      <motion.div className="h-full rounded-full" style={{ background: algo.color }} initial={{ width: 0 }} animate={{ width: `${(done/3)*100}%` }} transition={{ duration: 0.8 }} />
                    </div>
                    <div className="flex gap-2">
                      {[['Learned', ap.conceptDone], ['Quiz', ap.quizDone], ['Practice', ap.practiceDone]].map(([l, d]) => (
                        <span key={l} className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${d ? 'bg-green-500/15 text-green-300' : 'bg-white/5 text-white/30'}`}>✓ {l}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 relative z-[1] mt-auto pt-1">
                  <button onClick={() => onNavigate('learn', algo.key)} className={`${s.fluentBtnPrimary} flex-1 min-w-[80px] px-3 py-2.5 rounded-lg text-[11px] font-semibold text-white cursor-pointer flex items-center justify-center gap-1.5`} style={{ background: algo.color, borderColor: `${algo.color}80` }}>
                    <BookOpen size={12} /> Learn
                  </button>
                  <button onClick={() => onNavigate('quiz', algo.key)} className={`${s.fluentBtn} flex-1 min-w-[80px] px-3 py-2.5 rounded-lg text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center justify-center gap-1.5`}>
                    <Brain size={12} /> Quiz
                  </button>
                  <button onClick={() => onNavigate('practice', algo.key)} className={`${s.fluentBtn} flex-1 min-w-[80px] px-3 py-2.5 rounded-lg text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center justify-center gap-1.5`}>
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

function StatCard({ icon: Icon, iconColor, bg, border, label, value, valueColor }) {
  return (
    <div className={`${s.panelGlass} rounded-xl p-4 flex items-center gap-3`}>
      <div className={`w-9 h-9 rounded-lg ${bg} ${border} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={iconColor} />
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-wider text-[var(--win-text-secondary)]">{label}</p>
        <p className={`text-xl font-bold font-mono ${valueColor} leading-tight`}>{value}</p>
      </div>
    </div>
  );
}
