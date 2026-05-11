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
          <div className="w-full h-full flex flex-col items-center justify-center p-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
              <h1 className="text-5xl font-bold text-[#ffffff] tracking-tight mb-4 drop-shadow-sm">System Architecture Study Tools</h1>
              <p className="text-[#8899aa] text-lg font-medium">Select a toolset to begin your learning session.</p>
            </motion.div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-6xl">
              {/* Button 1 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate('theory')}
                className="w-96 h-80 bg-[#141c2e] border border-[#2a3a50] shadow-[0_2px_12px_rgba(0,0,0,0.35)] hover:border-[#00e5ff] hover:shadow-[0_4px_20px_rgba(0,229,255,0.12)] rounded-[2rem] p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
              >
                <div className="mb-8 group-hover:scale-110 transition-transform duration-500">
                  <BookOpen size={80} className="text-[#00e5ff] drop-shadow-sm" />
                </div>
                <h2 className="text-3xl font-bold text-[#ffffff] mb-4 tracking-tight">Theory & Quizzes</h2>
                <p className="text-base text-[#8899aa] leading-relaxed font-medium">
                  Master the 4 algorithms through interactive MCQs and 3D visualizers.
                </p>
              </motion.button>

              {/* Button 2 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate('sandbox')}
                className="w-96 h-80 bg-[#1a2236] border border-[#2a3a50] shadow-[0_2px_12px_rgba(0,0,0,0.35)] hover:border-[#00d4e8] hover:shadow-[0_4px_20px_rgba(0,212,232,0.12)] rounded-[2rem] p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
              >
                <div className="mb-8 group-hover:scale-110 transition-transform duration-500">
                  <TableProperties size={80} className="text-[#8c6cff] drop-shadow-sm" />
                </div>
                <h2 className="text-3xl font-bold text-[#ffffff] mb-4 tracking-tight">2D Exam Sandbox</h2>
                <p className="text-base text-[#8899aa] leading-relaxed font-medium">
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
                className="flex items-center gap-1.5 text-sm font-semibold text-[#8899aa] hover:text-[#ffffff] hover:bg-[#1e2d3d] bg-transparent border border-transparent px-3 py-2 rounded-lg transition-all cursor-pointer w-fit group"
              >
                <ChevronLeft size={18} className="group-hover:scale-110 transition-transform" /> Hub
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
                className="flex items-center gap-1.5 text-sm font-semibold text-[#8899aa] hover:text-[#ffffff] hover:bg-[#1e2d3d] bg-transparent border border-transparent px-3 py-2 rounded-lg transition-all cursor-pointer w-fit group"
              >
                <ChevronLeft size={18} className="group-hover:scale-110 transition-transform" /> Hub
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
    <div className="w-full h-full overflow-hidden text-[#ffffff]">
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
