import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Brain, Clock, Flame, Zap, Trophy,
  Filter, Calendar, TrendingUp, Award, CheckCircle, BarChart3
} from 'lucide-react';
import { ALGO_LIST } from '../../data/quizData.js';
import s from '../../styles/mica.module.css';

/* ═══ HELPERS ═══ */
function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getGradeColor(grade) {
  if (grade === 'S') return '#fbbf24';
  if (grade === 'A') return '#6ccb5f';
  if (grade === 'B') return '#60cdff';
  if (grade === 'C') return '#f59e0b';
  return '#ff6b6b';
}

function getAlgoMeta(key) {
  return ALGO_LIST.find(a => a.key === key) || { name: key, color: '#888' };
}

export default function ResultsHistory({ history = [], onNavigate }) {
  const [filter, setFilter] = useState('all'); // all | quiz
  const [algoFilter, setAlgoFilter] = useState('all');

  const quizOnly = history.filter(item => item.type === 'quiz');
  const filtered = quizOnly.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (algoFilter !== 'all' && item.algorithm !== algoFilter) return false;
    return true;
  });

  // Summary stats
  const quizAttempts = quizOnly;
  const totalAttempts = quizAttempts.length;
  const avgQuizScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum, h) => sum + (h.score / h.total) * 100, 0) / quizAttempts.length)
    : 0;
  const bestStreak = quizAttempts.reduce((max, h) => Math.max(max, h.maxStreak || 0), 0);
  const totalXPEarned = quizAttempts.reduce((sum, h) => sum + (h.xpEarned || 0), 0);

  const filterTabs = [
    { key: 'all', label: 'All', count: quizAttempts.length },
    { key: 'quiz', label: 'Quizzes', count: quizAttempts.length },
  ];

  // Get unique algorithms that have history
  const usedAlgos = [...new Set(history.map(h => h.algorithm))];

  return (
    <div className="w-full h-full overflow-y-auto flex justify-center">
      <div className="w-full max-w-4xl px-5 py-6 flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => onNavigate('home')}
            className={`${s.fluentBtn} px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[var(--win-text)] cursor-pointer flex items-center gap-1`}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-[var(--win-accent)]" />
              Results History
            </h2>
            <p className="text-[10px] text-[var(--win-text-secondary)] font-medium">
              Your complete learning journey
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"
        >
          <SummaryCard icon={BarChart3} color="#60cdff" label="Total Attempts" value={totalAttempts} />
          <SummaryCard icon={TrendingUp} color="#6ccb5f" label="Avg Quiz Score" value={`${avgQuizScore}%`} />
          <SummaryCard icon={Flame} color="#f59e0b" label="Best Streak" value={bestStreak} />
          <SummaryCard icon={Zap} color="#a855f7" label="Total XP" value={totalXPEarned} />
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Filter size={13} className="text-[var(--win-text-secondary)]" />
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-none text-[11px] font-medium transition-all cursor-pointer border ${
                filter === tab.key
                  ? 'bg-[var(--win-accent)]/15 border-[var(--win-accent)]/30 text-[var(--win-accent)]'
                  : 'bg-white/[0.03] border-white/[0.06] text-[var(--win-text-secondary)] hover:bg-white/[0.06]'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[9px] opacity-60">{tab.count}</span>
            </button>
          ))}

          {/* Algo filter */}
          {usedAlgos.length > 1 && (
            <>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <select
                value={algoFilter}
                onChange={e => setAlgoFilter(e.target.value)}
                className="px-2 py-1 rounded-none text-[11px] bg-white/[0.04] border border-white/[0.08] text-[var(--win-text-secondary)] cursor-pointer outline-none"
              >
                <option value="all">All Algorithms</option>
                {usedAlgos.map(key => (
                  <option key={key} value={key}>{getAlgoMeta(key).name}</option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${s.panelGlass} rounded-none p-10 flex flex-col items-center justify-center gap-3 text-center`}
          >
            <div className="w-14 h-14 rounded-none bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Clock size={24} className="text-white/20" />
            </div>
            <h3 className="text-[15px] font-semibold text-white/60">No Results Yet</h3>
            <p className="text-[12px] text-[var(--win-text-secondary)] max-w-xs">
              Complete a quiz to see your results here. Your progress is saved automatically.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className={`${s.fluentBtnPrimary} mt-2 px-4 py-2 rounded-none text-[11px] font-semibold text-white cursor-pointer`}
            >
              Start Learning
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <AnimatePresence>
              {filtered.map((item, idx) => (
                <HistoryCard key={item.id} item={item} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ SUMMARY CARD ═══ */
function SummaryCard({ icon: Icon, color, label, value }) {
  return (
    <div className={`${s.panelGlass} rounded-none p-4 flex items-center gap-3`}>
      <div
        className="w-9 h-9 rounded-none flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--win-text-secondary)] font-semibold">{label}</p>
        <p className="text-xl font-bold font-mono leading-tight" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

/* ═══ HISTORY CARD ═══ */
function HistoryCard({ item, index }) {
  const algo = getAlgoMeta(item.algorithm);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={`${s.panelGlass} rounded-none p-4 flex items-center gap-4 group hover:border-white/15 transition-all`}
    >
      {/* Type Icon */}
      <div
        className="w-10 h-10 rounded-none flex items-center justify-center shrink-0"
        style={{ background: `${algo.color}15`, border: `1px solid ${algo.color}30` }}
      >
        <Brain size={18} style={{ color: algo.color }} />
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-bold text-white">{algo.name}</span>
          <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-none border font-semibold text-blue-300 bg-blue-500/10 border-blue-500/20">
            Quiz
          </span>
        </div>

        {/* Details row */}
        <div className="flex items-center gap-3 text-[11px] text-[var(--win-text-secondary)]">
          <span className="flex items-center gap-1">
            <CheckCircle size={10} className="text-green-400" />
            {item.correct}/{item.totalQuestions} correct
          </span>
          {item.maxStreak > 0 && (
            <span className="flex items-center gap-1">
              <Flame size={10} className="text-amber-400" />
              {item.maxStreak} streak
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-white/30">
            <Calendar size={9} />
            {timeAgo(item.date)}
          </span>
        </div>
      </div>

      {/* Score / Grade */}
      <div className="flex items-center gap-3 shrink-0">
        {item.grade && (
          <div
            className="w-8 h-8 rounded-none flex items-center justify-center text-[14px] font-black"
            style={{
              background: `${getGradeColor(item.grade)}15`,
              border: `1px solid ${getGradeColor(item.grade)}30`,
              color: getGradeColor(item.grade),
            }}
          >
            {item.grade}
          </div>
        )}
        <div className="text-right">
          <p className="text-[14px] font-bold font-mono" style={{ color: algo.color }}>
            {Math.round((item.score / item.total) * 100)}%
          </p>
          <p className="text-[9px] text-amber-400 font-semibold flex items-center justify-end gap-0.5">
            <Zap size={8} /> +{item.xpEarned} XP
          </p>
        </div>
      </div>
    </motion.div>
  );
}
