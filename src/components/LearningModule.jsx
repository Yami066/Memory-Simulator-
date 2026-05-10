import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, TableProperties, ChevronLeft } from 'lucide-react';
import LearningHome from './learning/LearningHome.jsx';
import ConceptCards from './learning/ConceptCards.jsx';
import LearningActivityWindow from './learning/LearningActivityWindow.jsx';
import AcademicMatrixViewer from './learning/AcademicMatrixViewer.jsx';
import Scoreboard from './learning/Scoreboard.jsx';
import ResultsHistory from './learning/ResultsHistory.jsx';

const STORAGE_KEY = 'vmm-learning-progress';
const HISTORY_KEY = 'vmm-learning-history';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // silently fail
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // silently fail
  }
}

export default function LearningModule() {
  const [view, setView] = useState('hub'); // hub | theory | sandbox | quiz | practice | scoreboard | history
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [progress, setProgress] = useState(loadProgress);
  const [history, setHistory] = useState(loadHistory);

  // Persist progress
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Persist history
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Navigation handler
  const handleNavigate = useCallback((targetView, algo = null) => {
    setView(targetView === 'home' ? 'theory' : targetView);
    if (algo) setSelectedAlgo(algo);
  }, []);

  // Progress update handlers
  const handleConceptComplete = useCallback((algo) => {
    setProgress(prev => ({
      ...prev,
      [algo]: { ...(prev[algo] || {}), conceptDone: true },
    }));
  }, []);

  const handleQuizComplete = useCallback((algo, resultData) => {
    // resultData = { score, total, correct, totalQuestions, maxStreak, grade }
    const xpEarned = resultData.score;

    // Update progress (best score, XP, flags)
    setProgress(prev => {
      const existing = prev[algo] || {};
      const bestScore = Math.max(existing.quizScore || 0, resultData.score);
      const newXP = (existing.xp || 0) + xpEarned;
      return {
        ...prev,
        [algo]: {
          ...existing,
          quizDone: true,
          quizScore: bestScore,
          xp: newXP,
          lastQuizDate: new Date().toISOString(),
        },
      };
    });

    // Add to history
    setHistory(prev => [
      {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        type: 'quiz',
        algorithm: algo,
        score: resultData.score,
        total: resultData.total,
        correct: resultData.correct,
        totalQuestions: resultData.totalQuestions,
        grade: resultData.grade,
        maxStreak: resultData.maxStreak,
        xpEarned,
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const handlePracticeComplete = useCallback((algo, resultData) => {
    // resultData = { score, accuracy, correct, total, maxStreak }
    const xpEarned = resultData.score;

    // Update progress
    setProgress(prev => {
      const existing = prev[algo] || {};
      const newXP = (existing.xp || 0) + xpEarned;
      return {
        ...prev,
        [algo]: {
          ...existing,
          practiceDone: true,
          xp: newXP,
          lastPracticeDate: new Date().toISOString(),
        },
      };
    });

    // Add to history
    setHistory(prev => [
      {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        type: 'practice',
        algorithm: algo,
        score: resultData.score,
        accuracy: resultData.accuracy,
        correct: resultData.correct,
        total: resultData.total,
        maxStreak: resultData.maxStreak,
        xpEarned,
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const renderView = () => {
    switch (view) {
      case 'hub':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-black/40">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">System Architecture Study Tools</h1>
              <p className="text-slate-400 text-sm">Select a toolset to begin your learning session.</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl">
              {/* Button 1 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate('theory')}
                className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-8 flex flex-col items-center text-center transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <BookOpen size={32} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Theory & Quizzes</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Master the 4 algorithms through interactive MCQs and 3D visualizers.
                </p>
              </motion.button>

              {/* Button 2 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate('sandbox')}
                className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-8 flex flex-col items-center text-center transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <TableProperties size={32} className="text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">2D Exam Sandbox</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Input custom reference strings and generate textbook-style 2D matrices.
                </p>
              </motion.button>
            </div>
          </div>
        );

      case 'theory':
        return (
          <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-6xl mx-auto px-4 pt-6">
              <button
                onClick={() => handleNavigate('hub')}
                className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-fit border border-white/5"
              >
                <ChevronLeft size={14} /> Back to Hub
              </button>
            </div>
            <div className="flex-1">
              <LearningHome
                onNavigate={handleNavigate}
                progress={progress}
              />
            </div>
          </div>
        );

      case 'sandbox':
        return (
          <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-[1400px] mx-auto px-4 pt-6">
              <button
                onClick={() => handleNavigate('hub')}
                className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-fit border border-white/5"
              >
                <ChevronLeft size={14} /> Back to Hub
              </button>
              <AcademicMatrixViewer />
            </div>
          </div>
        );

      case 'learn':
        return (
          <ConceptCards
            algorithm={selectedAlgo}
            onNavigate={handleNavigate}
            onComplete={handleConceptComplete}
          />
        );

      case 'quiz':
        return (
          <LearningActivityWindow
            activityType="quiz"
            algorithm={selectedAlgo}
            onNavigate={handleNavigate}
            onComplete={handleQuizComplete}
          />
        );

      case 'practice':
        return (
          <LearningActivityWindow
            activityType="practice"
            algorithm={selectedAlgo}
            onNavigate={handleNavigate}
            onComplete={handlePracticeComplete}
          />
        );

      case 'scoreboard':
        return (
          <Scoreboard
            progress={progress}
            history={history}
            onNavigate={handleNavigate}
          />
        );

      case 'history':
        return (
          <ResultsHistory
            history={history}
            onNavigate={handleNavigate}
          />
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <button onClick={() => handleNavigate('hub')} className="text-white">Return to Hub</button>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full overflow-hidden text-slate-200">
      <AnimatePresence mode="wait">
        <motion.div
          key={view + (selectedAlgo || '')}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="w-full h-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
