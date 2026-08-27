import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Award, CheckCircle, XCircle, Trophy, Sparkles } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';
import { QuizQuestion } from '../types/cpu';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Which register CANNOT be used inside memory addressing brackets [...] in Intel 8086?',
    options: ['BX', 'SI', 'AX', 'BP'],
    correctIndex: 2,
    explanation: 'AX is an Accumulator register and cannot be used as a base or index register inside memory brackets [...] in 8086 assembly. Only BX, BP, SI, and DI are allowed.'
  },
  {
    id: 'q2',
    question: 'How is the 20-bit Physical Address calculated from a Segment and Offset in 8086?',
    options: [
      'Physical Address = Segment + Offset',
      'Physical Address = (Segment × 16) + Offset',
      'Physical Address = (Segment × 8) + Offset',
      'Physical Address = Segment × Offset'
    ],
    correctIndex: 1,
    explanation: 'The 8086 uses segment registers shifted left 4 bits (multiplied by 16 or 10H) added to the 16-bit offset/Effective Address.'
  },
  {
    id: 'q3',
    question: 'When the Base Pointer (BP) is used for memory addressing, which segment register is used by default?',
    options: ['DS (Data Segment)', 'SS (Stack Segment)', 'CS (Code Segment)', 'ES (Extra Segment)'],
    correctIndex: 1,
    explanation: 'By default in Intel 8086 architecture, memory pointer operations involving BP default to the Stack Segment (SS).'
  },
  {
    id: 'q4',
    question: 'What is the Addressing Mode of MOV AX, [BX+SI+20H]?',
    options: [
      'Based-Indexed with Displacement',
      'Register Indirect',
      'Direct Addressing',
      'Immediate Addressing'
    ],
    correctIndex: 0,
    explanation: 'BX is the Base register, SI is the Index register, and 20H is the numerical displacement, making it Based-Indexed with Displacement.'
  }
];

export const QuizModal: React.FC = () => {
  const { quizModalOpen, setQuizModalOpen, addXP, userXP } = useCpuStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!quizModalOpen) return null;

  const q = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);

    if (idx === q.correctIndex) {
      setScore(prev => prev + 1);
      addXP(100);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl glass-panel rounded-2xl p-6 border-2 border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.3)] font-mono relative text-slate-100"
      >
        <button
          onClick={() => setQuizModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4 border-b border-purple-500/20 pb-3">
          <Award className="w-6 h-6 text-purple-400" />
          <h2 className="text-lg font-bold text-purple-200">
            8086 COA KNOWLEDGE QUIZ
          </h2>
        </div>

        {!isFinished ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-purple-400">
              <span>QUESTION {currentIdx + 1} OF {QUIZ_QUESTIONS.length}</span>
              <span>SCORE: {score}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 font-semibold text-sm text-purple-100">
              {q.question}
            </div>

            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-950 border-purple-500/20 text-slate-300 hover:bg-slate-900';
                if (selectedOpt !== null) {
                  if (idx === q.correctIndex) {
                    btnStyle = 'bg-emerald-950 border-emerald-400 text-emerald-200 font-bold';
                  } else if (idx === selectedOpt) {
                    btnStyle = 'bg-rose-950 border-rose-400 text-rose-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedOpt !== null && (
              <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 text-xs space-y-2">
                <p className="text-purple-200">{q.explanation}</p>
                <button
                  onClick={handleNext}
                  className="w-full py-2.5 rounded-lg bg-purple-600 text-white font-bold cursor-pointer"
                >
                  {currentIdx < QUIZ_QUESTIONS.length - 1 ? 'NEXT QUESTION' : 'VIEW RESULTS'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4 py-4">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto glow-text-purple" />
            <h3 className="text-xl font-bold text-purple-200">QUIZ COMPLETED!</h3>
            <p className="text-sm text-slate-300">
              Final Score: <span className="text-emerald-400 font-bold">{score} / {QUIZ_QUESTIONS.length}</span>
            </p>
            <button
              onClick={restartQuiz}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg"
            >
              RETRY QUIZ
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
