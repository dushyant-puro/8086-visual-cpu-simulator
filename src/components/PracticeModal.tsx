import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, CheckCircle, XCircle, Award, Sparkles, ArrowRight } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';
import { PracticeQuestion } from '../types/cpu';
import { toHex16, toHex20 } from '../engine/parser';

const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'p1',
    title: 'Based-Indexed Addressing with Displacement',
    instruction: 'MOV AX, [BX+SI+20H]',
    registerState: { BX: 0x2000, SI: 0x0100, DS: 0x3000 },
    questionText: 'Given BX = 2000H, SI = 0100H, DS = 3000H, calculate the Effective Address (EA) and 20-Bit Physical Address (PA).',
    expectedEA: 0x2120,
    expectedPA: 0x32120,
    explanation: 'EA = BX + SI + 20H = 2000H + 0100H + 20H = 2120H. PA = (DS × 16) + EA = 30000H + 2120H = 32120H.'
  },
  {
    id: 'p2',
    title: 'Stack Segment & Base Pointer',
    instruction: 'MOV CX, [BP+DI+10H]',
    registerState: { BP: 0x1000, DI: 0x0200, SS: 0x4000 },
    questionText: 'Given BP = 1000H, DI = 0200H, SS = 4000H, calculate the Effective Address (EA) and Physical Address (PA). Note: BP defaults to Stack Segment (SS).',
    expectedEA: 0x1210,
    expectedPA: 0x41210,
    explanation: 'EA = BP + DI + 10H = 1000H + 0200H + 10H = 1210H. PA = (SS × 16) + EA = 40000H + 1210H = 41210H.'
  },
  {
    id: 'p3',
    title: 'Direct Addressing',
    instruction: 'MOV AL, [1234H]',
    registerState: { DS: 0x1000 },
    questionText: 'Given DS = 1000H and instruction MOV AL, [1234H], calculate the EA and Physical Address (PA).',
    expectedEA: 0x1234,
    expectedPA: 0x11234,
    explanation: 'EA = 1234H. PA = (DS × 16) + EA = 10000H + 1234H = 11234H.'
  }
];

export const PracticeModal: React.FC = () => {
  const { practiceModalOpen, setPracticeModalOpen, addXP } = useCpuStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputEA, setInputEA] = useState('');
  const [inputPA, setInputPA] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!practiceModalOpen) return null;

  const question = PRACTICE_QUESTIONS[currentIdx];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedEA = parseInt(inputEA.replace(/H$/i, ''), 16);
    const parsedPA = parseInt(inputPA.replace(/H$/i, ''), 16);

    const correct = parsedEA === question.expectedEA && parsedPA === question.expectedPA;
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      addXP(50);
    }
  };

  const handleNext = () => {
    setSubmitted(false);
    setInputEA('');
    setInputPA('');
    setCurrentIdx((prev) => (prev + 1) % PRACTICE_QUESTIONS.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl glass-panel rounded-2xl p-6 border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.3)] font-mono relative text-slate-100"
      >
        <button
          onClick={() => setPracticeModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4 border-b border-cyan-500/20 pb-3">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h2 className="text-lg font-bold text-cyan-200">
            8086 ADDRESSING MODE PRACTICE
          </h2>
        </div>

        {/* Question Info */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between text-xs text-cyan-400">
            <span>EXERCISE {currentIdx + 1} OF {PRACTICE_QUESTIONS.length}</span>
            <span>+50 XP REWARD</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30">
            <h3 className="text-sm font-bold text-cyan-300 mb-1">{question.title}</h3>
            <div className="text-xs text-purple-300 font-bold mb-2">Instruction: {question.instruction}</div>
            <p className="text-xs text-slate-300 leading-relaxed">{question.questionText}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ENTER EA (HEX e.g. 2120H):</label>
                <input
                  type="text"
                  value={inputEA}
                  onChange={(e) => setInputEA(e.target.value)}
                  placeholder="e.g. 2120H"
                  disabled={submitted}
                  className="w-full bg-[#030612] border border-cyan-500/40 rounded-lg p-2.5 text-cyan-200 focus:outline-none focus:border-cyan-400 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">ENTER PA (HEX e.g. 32120H):</label>
                <input
                  type="text"
                  value={inputPA}
                  onChange={(e) => setInputPA(e.target.value)}
                  placeholder="e.g. 32120H"
                  disabled={submitted}
                  className="w-full bg-[#030612] border border-cyan-500/40 rounded-lg p-2.5 text-cyan-200 focus:outline-none focus:border-cyan-400 font-bold"
                />
              </div>
            </div>

            {!submitted ? (
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:bg-cyan-400 cursor-pointer"
              >
                SUBMIT ANSWER
              </button>
            ) : null}
          </form>

          {/* Submission Feedback */}
          {submitted && (
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-2 ${
              isCorrect ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                {isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
                <span>{isCorrect ? 'CORRECT! +50 XP EARNED' : 'INCORRECT'}</span>
              </div>
              <p>{question.explanation}</p>
              <button
                onClick={handleNext}
                className="w-full py-2.5 rounded-lg bg-slate-900 border border-cyan-400 text-cyan-300 font-bold flex items-center justify-center space-x-1 cursor-pointer mt-2"
              >
                <span>NEXT EXERCISE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
