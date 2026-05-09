import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LearningHome from './learning/LearningHome.jsx';
import ConceptCards from './learning/ConceptCards.jsx';
import QuizMode from './learning/QuizMode.jsx';
import PredictionMode from './learning/PredictionMode.jsx';
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
  const [view, setView] = useState('home'); // home | learn | quiz | practice | scoreboard | history
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
    setView(targetView);
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
      case 'home':
        return (
          <LearningHome
            onNavigate={handleNavigate}
            progress={progress}
          />
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
          <QuizMode
            algorithm={selectedAlgo}
            onNavigate={handleNavigate}
            onComplete={handleQuizComplete}
          />
        );

      case 'practice':
        return (
          <PredictionMode
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
          <LearningHome
            onNavigate={handleNavigate}
            progress={progress}
          />
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
