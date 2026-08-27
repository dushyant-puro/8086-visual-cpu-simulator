import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Layers,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';
import { PipelineStageIndex } from '../types/cpu';

const PIPELINE_STAGES: { id: PipelineStageIndex; label: string; short: string }[] = [
  { id: 0, label: 'Instruction Fetch', short: 'FETCH' },
  { id: 1, label: 'Instruction Decode', short: 'DECODE' },
  { id: 2, label: 'Register Read', short: 'REG READ' },
  { id: 3, label: 'Operand Fetch', short: 'OP FETCH' },
  { id: 4, label: 'ALU Compute', short: 'ALU' },
  { id: 5, label: 'Effective Address Calc', short: 'EA CALC' },
  { id: 6, label: 'Segment Shift (x16)', short: 'SEG SHIFT' },
  { id: 7, label: 'Physical Address Calc', short: 'PA CALC' },
  { id: 8, label: 'Bus Transmission', short: 'BUS TRANSMIT' },
  { id: 9, label: 'Memory Access', short: 'MEM ACCESS' },
  { id: 10, label: 'Register Writeback', short: 'WRITEBACK' },
];

export const PipelineStepper: React.FC = () => {
  const {
    currentStepIndex,
    executionSteps,
    isPlaying,
    playbackSpeed,
    stepForward,
    stepBackward,
    togglePlay
  } = useCpuStore();

  // Auto-play timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && currentStepIndex < executionSteps.length - 1) {
      const intervalMs = Math.max(200, 1200 / playbackSpeed);
      timer = setTimeout(() => {
        stepForward();
      }, intervalMs);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, executionSteps.length, playbackSpeed, stepForward]);

  const currentStep = executionSteps[currentStepIndex];

  return (
    <div className="relative w-full glass-panel rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
      {/* Title & Pipeline Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-cyan-200 tracking-wider">
            10-STAGE CPU EXECUTION PIPELINE
          </h2>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={stepBackward}
            disabled={currentStepIndex <= 0}
            className="p-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            disabled={executionSteps.length === 0}
            className="px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono font-bold text-xs hover:bg-cyan-500/30 flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'PAUSE' : 'AUTO PLAY'}</span>
          </button>

          <button
            onClick={stepForward}
            disabled={currentStepIndex >= executionSteps.length - 1}
            className="p-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Pipeline Stage Stepper Bar */}
      <div className="grid grid-cols-11 gap-1 sm:gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
        {PIPELINE_STAGES.map((stage) => {
          const isCurrent = currentStepIndex === stage.id;
          const isDone = currentStepIndex > stage.id;

          return (
            <motion.div
              key={stage.id}
              animate={
                isCurrent
                  ? { scale: [1, 1.05, 1], boxShadow: '0 0 20px rgba(0,240,255,0.6)' }
                  : { scale: 1, boxShadow: '0 0 0px transparent' }
              }
              transition={{ duration: 0.3 }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all min-w-[70px] ${
                isCurrent
                  ? 'bg-gradient-to-b from-cyan-950 to-slate-900 border-cyan-400 text-cyan-300'
                  : isDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-600'
              }`}
            >
              <div className="text-[10px] font-mono font-bold mb-1">
                S{stage.id}
              </div>
              <div className="text-[9px] font-mono leading-tight uppercase font-semibold">
                {stage.short}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Active Stage Description Detail Card */}
      {currentStep ? (
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs font-mono flex items-start space-x-3 shadow-inner">
          <Activity className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-cyan-300 text-sm">
                STAGE {currentStep.stage}: {currentStep.stageName}
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">
                ACTIVE
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {currentStep.logMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-500 text-center">
          Press &apos;EXECUTE INSTRUCTION&apos; to begin step-by-step pipeline execution.
        </div>
      )}
    </div>
  );
};
