import { motion } from 'framer-motion';
import { ChevronLeft, Brain } from 'lucide-react';
import QuizMode from './QuizMode.jsx';
import { ALGO_LIST } from '../../data/quizData.js';
import s from '../../styles/mica.module.css';

export default function LearningActivityWindow({ activityType, algorithm, onNavigate, onComplete }) {
  const algoMeta = ALGO_LIST.find(a => a.key === algorithm);
  const title = `Knowledge Checkpoint: ${algoMeta?.name}`;
  const Icon = Brain;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-black/40">
      {/* Title Bar */}
      <div className={`${s.terminalTitlebar} h-12 shrink-0 flex items-center justify-between px-4 bg-slate-900 border-b border-white/[0.05]`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2 text-white">
            <Icon size={16} style={{ color: algoMeta?.color || 'var(--win-accent)' }} />
            <span className="text-[13px] font-semibold tracking-wide">{title}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center">
        <div className="w-full max-w-2xl px-4 py-8 flex flex-col gap-12">
          
          {/* Quiz Activity */}
          <section className="w-full flex flex-col">
            <QuizMode
              algorithm={algorithm}
              onNavigate={onNavigate}
              onComplete={onComplete}
              isEmbedded={true}
            />
          </section>
          
        </div>
      </div>
    </div>
  );
}
