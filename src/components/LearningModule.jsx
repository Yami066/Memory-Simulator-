import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShieldAlert, XCircle, AlertTriangle } from 'lucide-react';
import s from '../styles/mica.module.css';

export default function LearningModule() {
  return (
    <div className="w-full h-full p-6 overflow-y-auto overflow-x-hidden text-slate-200">
      <div className="max-w-5xl mx-auto flex flex-col xl:flex-row gap-6">
        {/* Left Column: MCQ Checkpoint */}
        <div className="flex-1 flex flex-col gap-6">
          <McqWidget />
        </div>

        {/* Right Column: Error Spotting */}
        <div className="flex-1 flex flex-col gap-6">
          <ErrorSpottingWidget />
        </div>
      </div>
    </div>
  );
}

function McqWidget() {
  const [errorShake, setErrorShake] = useState(false);
  
  const questions = [
    {
      id: 1,
      question: "Which algorithm suffers from Belady's Anomaly?",
      options: ["LRU", "FIFO", "Optimal", "MRU"],
      answer: "FIFO"
    },
    {
      id: 2,
      question: "What occurs when the CPU tries to access a page not currently in RAM?",
      options: ["Segmentation Fault", "Cache Miss", "Page Fault", "TLB Hit"],
      answer: "Page Fault"
    },
    {
      id: 3,
      question: "What is \"Thrashing\"?",
      options: ["High CPU usage", "Excessive swapping between RAM and Disk", "Fast page loads"],
      answer: "Excessive swapping between RAM and Disk"
    }
  ];

  const [answers, setAnswers] = useState({});

  const handleOptionClick = (qId, option, isCorrect) => {
    if (answers[qId]?.isCorrect) return; // Already answered correctly

    setAnswers(prev => ({
      ...prev,
      [qId]: { selected: option, isCorrect }
    }));

    if (!isCorrect) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 400);
    }
  };

  return (
    <motion.div 
      className={`${s.panelGlass} p-6 rounded-2xl flex flex-col gap-5 border border-white/10`}
      animate={{ x: errorShake ? [-10, 10, -10, 10, 0] : 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
          <CheckCircle size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-wide text-white">Knowledge Checkpoint</h2>
          <p className="text-xs text-slate-400">Test your understanding of virtual memory concepts.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {questions.map((q) => {
          const answered = answers[q.id];
          return (
            <div key={q.id} className="flex flex-col gap-3">
              <p className="text-sm text-slate-200 font-medium">{q.question}</p>
              <div className="flex flex-col gap-2">
                {q.options.map(opt => {
                  const isSelected = answered?.selected === opt;
                  const isCorrectAnswer = opt === q.answer;
                  
                  let optStyle = "border-white/10 hover:bg-white/5 bg-white/[0.02] text-slate-300 cursor-pointer";
                  let Icon = null;

                  if (answered) {
                    if (isSelected && !isCorrectAnswer) {
                      optStyle = "border-red-500/50 bg-red-500/10 text-red-200";
                      Icon = XCircle;
                    } else if (isCorrectAnswer && answered.isCorrect) {
                      optStyle = "border-green-500/50 bg-green-500/10 text-green-200";
                      Icon = CheckCircle;
                    } else if (!isSelected) {
                      optStyle = "border-white/5 bg-white/[0.01] text-slate-500 opacity-50 cursor-default";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleOptionClick(q.id, opt, isCorrectAnswer)}
                      disabled={answered?.isCorrect}
                      className={`flex items-center justify-between text-left px-4 py-2.5 rounded-xl border transition-all duration-200 ${optStyle}`}
                    >
                      <span className="text-xs md:text-sm">{opt}</span>
                      {Icon && <Icon size={16} className="shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ErrorSpottingWidget() {
  const [errorShake, setErrorShake] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);

  const steps = [
    { step: 1, action: "P1 loads", state: "[1, -, -]", isError: false },
    { step: 2, action: "P2 loads", state: "[1, 2, -]", isError: false },
    { step: 3, action: "P3 loads", state: "[1, 2, 3]", isError: false },
    { step: 4, action: "P1 requested -> HIT", state: "[1, 2, 3]", isError: false },
    { step: 5, action: "P4 loads", state: "[1, 4, 3]", isError: true, note: "P2 was evicted instead of P1!" }
  ];

  const handleStepClick = (step) => {
    setSelectedStep(step.step);
    
    if (!step.isError) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 400);
    }
  };

  return (
    <motion.div 
      className={`${s.panelGlass} p-6 rounded-2xl flex flex-col gap-5 border border-white/10`}
      animate={{ x: errorShake ? [-10, 10, -10, 10, 0] : 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-300">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-wide text-white">System Diagnostics: Error Spotting</h2>
          <p className="text-xs text-slate-400">An intern wrote this FIFO logic, but there is a fatal flaw.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
          <p className="text-xs text-slate-300 font-mono mb-1">
            <span className="text-amber-400">Ref String:</span> 1, 2, 3, 1, 4
          </p>
          <p className="text-xs text-slate-300 font-mono">
            <span className="text-cyan-400">Frames:</span> 3
          </p>
        </div>

        <p className="text-sm text-slate-200">
          Click the exact step below where the FIFO page replacement failed:
        </p>

        <div className="flex flex-col gap-2">
          {steps.map((sItem) => {
            const isSelected = selectedStep === sItem.step;
            let rowStyle = "border-white/10 hover:bg-white/10 bg-white/[0.03] cursor-pointer";
            
            if (isSelected) {
              if (sItem.isError) {
                rowStyle = "border-green-500/50 bg-green-500/20 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
              } else {
                rowStyle = "border-red-500/50 bg-red-500/20 text-red-100";
              }
            }

            return (
              <div 
                key={sItem.step}
                onClick={() => handleStepClick(sItem)}
                className={`px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${rowStyle}`}
              >
                <div className="flex gap-4 items-center">
                  <span className={`text-xs font-bold ${isSelected && sItem.isError ? 'text-green-300' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    Step {sItem.step}
                  </span>
                  <span className={`text-sm font-mono ${isSelected && sItem.isError ? 'text-green-100' : 'text-slate-300'}`}>
                    {sItem.action}
                  </span>
                </div>
                <span className={`text-sm font-mono font-semibold tracking-widest ${isSelected && sItem.isError ? 'text-green-200' : 'text-cyan-200'}`}>
                  {sItem.state}
                </span>
              </div>
            );
          })}
        </div>

        {/* Feedback Area */}
        <div className="h-12 mt-2">
          {selectedStep && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl flex items-center gap-3 text-sm font-medium border ${
                steps.find(s => s.step === selectedStep)?.isError 
                ? 'bg-green-500/10 border-green-500/30 text-green-200' 
                : 'bg-red-500/10 border-red-500/30 text-red-200'
              }`}
            >
              {steps.find(s => s.step === selectedStep)?.isError ? (
                <>
                  <CheckCircle size={18} className="text-green-400" />
                  Correct! FIFO should have evicted Page 1 (oldest), but it evicted Page 2 instead.
                </>
              ) : (
                <>
                  <AlertTriangle size={18} className="text-red-400" />
                  Look closer... The logic holds up at this step.
                </>
              )}
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
