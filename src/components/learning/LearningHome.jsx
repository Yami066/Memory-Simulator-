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
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--win-accent)]/20 to-purple-500/20 border border-[var(--win-accent)]/20 flex items-center justify-center shadow-lg">
              <GraduationCap size={24} className="text-[var(--win-accent)] drop-shadow-md" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#ffffff] tracking-tight">Learn Page Replacement</h1>
          </div>
          <p className="text-base text-[#8899aa] max-w-2xl mx-auto leading-relaxed font-medium">
            Master memory management algorithms through interactive lessons, quizzes, and hands-on practice.
          </p>
        </motion.div>

        {/* Stats Dashboard Strip */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
          <div className={`bg-[#141c2e] border border-[#2a3a50] shadow-[0_2px_12px_rgba(0,0,0,0.35)] rounded-[2rem] flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#2a3a50]`}>
            <StatItem icon={Trophy} iconColor="text-[#00e5ff]" bg="bg-cyan-500/10" label="Total XP" value={totalXP} valueColor="text-[#ffffff]" />
            <StatItem icon={Layers} iconColor="text-[#00d4e8]" bg="bg-cyan-500/10" label="Mastered" value={`${totalCompleted}/${ALGO_LIST.length}`} valueColor="text-[#ffffff]" />
            <StatItem icon={Sparkles} iconColor="text-[#8c6cff]" bg="bg-purple-500/15" label="Progress" value={`${Math.round((totalCompleted / ALGO_LIST.length) * 100)}%`} valueColor="text-[#ffffff]" />
            
            <button onClick={() => onNavigate('scoreboard')} className="flex-1 p-5 flex items-center justify-center gap-4 cursor-pointer hover:bg-[#1e2d3d] transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-[#2d1f4e] border border-[#3a2660] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Trophy size={20} className="text-[#8c6cff]" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-[#8899aa] font-bold mb-0.5">Scoreboard</p>
                <p className="text-lg font-bold text-[#ffffff] group-hover:text-[#00e5ff] transition-colors">View Ranking</p>
              </div>
            </button>
            
            <button onClick={() => onNavigate('history')} className="flex-1 p-5 flex items-center justify-center gap-4 cursor-pointer hover:bg-[#1e2d3d] transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Clock size={20} className="text-[#00d4e8]" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-[#8899aa] font-bold mb-0.5">Results</p>
                <p className="text-lg font-bold text-[#ffffff] group-hover:text-[#00e5ff] transition-colors">Past Quizzes</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Algorithm Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALGO_LIST.map((algo, idx) => {
            const ap = progress[algo.key] || {};
            const isStarted = ap.conceptDone || ap.quizDone || ap.practiceDone;
            const done = [ap.conceptDone, ap.quizDone, ap.practiceDone].filter(Boolean).length;

            return (
              <motion.div key={algo.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + idx * 0.08, duration: 0.4 }}
                className={`bg-[#141c2e] border border-[#2a3a50] shadow-[0_2px_12px_rgba(0,0,0,0.35)] rounded-[2rem] p-8 flex flex-col gap-6 group cursor-default hover:border-[#00e5ff] transition-all duration-300 relative overflow-hidden`}
                style={{ '--card-glow': algo.glow }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${algo.glow} 0%, transparent 70%)` }} />

                {/* Header */}
                <div className="flex items-start justify-between relative z-[1]">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0" style={{ background: `${algo.color}15`, border: `1px solid ${algo.color}30` }}>
                      <Cpu size={32} style={{ color: algo.color }} className="drop-shadow-md" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-[#ffffff] tracking-tight">{algo.name}</h3>
                      <p className="text-[11px] text-[#8899aa] font-bold uppercase tracking-widest mt-1">{algo.fullName}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full border shadow-sm ${algo.difficulty === 'Easy' ? 'text-green-700 bg-green-500/10 border-green-500/20' : algo.difficulty === 'Medium' ? 'text-amber-700 bg-amber-500/10 border-amber-500/20' : 'text-red-700 bg-red-500/10 border-red-500/20'}`}>
                    {algo.difficulty}
                  </span>
                </div>

                <p className="text-base text-[#8899aa] leading-relaxed relative z-[1] font-medium min-h-[48px]">{algo.description}</p>

                {/* Efficiency + Progress Container */}
                <div className="relative z-[1] bg-[#1a2236] rounded-2xl p-5 border border-[#2a3a50]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-widest text-[#8899aa] font-bold">Efficiency</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(n => <Star key={n} size={14} className={n <= algo.efficiency ? 'text-amber-500' : 'text-black/5'} fill={n <= algo.efficiency ? '#f59e0b' : 'transparent'} />)}
                      </div>
                    </div>
                    {isStarted && <span className="text-[11px] font-bold tracking-widest uppercase text-[#8899aa]">{done}/3 Modules</span>}
                  </div>

                  {isStarted && (
                    <div>
                      <div className="w-full h-1.5 bg-[#2a3a50] rounded-full overflow-hidden mb-3">
                        <motion.div className="h-full rounded-full" style={{ background: algo.color }} initial={{ width: 0 }} animate={{ width: `${(done/3)*100}%` }} transition={{ duration: 0.8 }} />
                      </div>
                      <div className="flex gap-4">
                        {[['Theory', ap.conceptDone], ['Quiz', ap.quizDone], ['Practice', ap.practiceDone]].map(([l, d]) => (
                          <div key={l} className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${d ? 'bg-[#00e5ff] shadow-sm' : 'bg-[#2a3a50]'}`} />
                            <span className={`text-[11px] font-bold tracking-wide ${d ? 'text-[#ffffff]' : 'text-[#8899aa]'}`}>{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-4 relative z-[1] mt-auto pt-2">
                  <button onClick={() => onNavigate('learn', algo.key)} className={`px-4 py-3.5 rounded-xl text-sm font-bold text-white cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-sm border`} style={{ background: algo.color, borderColor: `${algo.color}80` }}>
                    <BookOpen size={18} /> Learn
                  </button>
                  <button onClick={() => onNavigate('quiz', algo.key)} className={`bg-[#1e2d3d] text-[#ffffff] border border-[#2a3a50] px-4 py-3.5 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-sm`}>
                    <Brain size={18} /> Quiz
                  </button>
                  <button onClick={() => onNavigate('practice', algo.key)} className={`bg-[#1e2d3d] text-[#ffffff] border border-[#2a3a50] px-4 py-3.5 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-sm`}>
                    <Gamepad2 size={18} /> Practice
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

function StatItem({ icon: Icon, iconColor, bg, label, value, valueColor }) {
  return (
    <div className="flex-1 p-5 flex items-center justify-center gap-4 border-[#2a3a50]">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-widest text-[#8899aa] font-bold mb-0.5">{label}</p>
        <p className={`text-2xl font-bold font-mono ${valueColor} leading-tight drop-shadow-sm`}>{value}</p>
      </div>
    </div>
  );
}
