import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LearningHome from './learning/LearningHome.jsx';
import ConceptCards from './learning/ConceptCards.jsx';
import QuizMode from './learning/QuizMode.jsx';
import PredictionMode from './learning/PredictionMode.jsx';
import Scoreboard from './learning/Scoreboard.jsx';

const STORAGE_KEY = 'vmm-learning-progress';

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

export default function LearningModule() {
  const [view, setView] = useState('home'); // home | learn | quiz | practice | scoreboard
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [progress, setProgress] = useState(loadProgress);

  // Persist progress
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

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

  const handleQuizComplete = useCallback((algo, score) => {
    setProgress(prev => {
      const existing = prev[algo] || {};
      const bestScore = Math.max(existing.quizScore || 0, score);
      const newXP = (existing.xp || 0) + score;
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
  }, []);

  const handlePracticeComplete = useCallback((algo, score) => {
    setProgress(prev => {
      const existing = prev[algo] || {};
      const newXP = (existing.xp || 0) + score;
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
