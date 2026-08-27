import React from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, CheckCircle2 } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';

export const OutputPanel: React.FC = () => {
  const { currentInstruction, currentStepIndex, executionSteps, isExecutionSuccess } = useCpuStore();

  const currentStep = executionSteps[currentStepIndex];
  const isFinished = currentStepIndex >= executionSteps.length - 1 && executionSteps.length > 0;
  const addressCalc = currentStep?.addressCalc;

  return (
    <div className="relative w-full glass-panel rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] flex flex-col justify-between h-[280px]">
      <div className="flex items-center justify-between mb-2 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-cyan-200 tracking-wider">
            EXECUTION RESULT SUMMARY
          </h2>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
          isFinished ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}>
          {isFinished ? 'STATUS: COMPLETE' : 'STATUS: IN PROGRESS'}
        </span>
      </div>

      <motion.div
        animate={isFinished ? { y: 0, opacity: 1 } : { y: 5, opacity: 0.9 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="flex-1 bg-slate-950/80 rounded-xl p-3.5 border border-cyan-500/20 font-mono text-xs space-y-3 justify-between flex flex-col"
      >
        {currentInstruction && currentInstruction.isValid ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900 p-2 rounded-lg border border-cyan-500/20">
                <div className="text-[9px] text-slate-400">INSTRUCTION</div>
                <div className="font-bold text-cyan-300 truncate">{currentInstruction.raw}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-cyan-500/20">
                <div className="text-[9px] text-slate-400">ADDRESSING MODE</div>
                <div className="font-bold text-purple-300 truncate">{currentInstruction.addressingMode.type}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900 p-2 rounded-lg border border-cyan-500/20">
                <div className="text-[9px] text-slate-400">DEST REGISTER</div>
                <div className="font-bold text-cyan-200">{currentInstruction.op1Reg || 'AX'}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-cyan-500/20">
                <div className="text-[9px] text-slate-400">EFFECTIVE ADDR</div>
                <div className="font-bold text-cyan-300">{addressCalc ? addressCalc.effectiveAddressHex : 'N/A'}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-cyan-500/20">
                <div className="text-[9px] text-slate-400">PHYSICAL ADDR</div>
                <div className="font-bold text-emerald-300">{addressCalc ? addressCalc.physicalAddressHex : 'N/A'}</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-cyan-950/60 p-2 rounded-lg border border-cyan-400/40 text-[10px]">
              <div className="flex items-center space-x-1 text-cyan-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>ESTIMATED CYCLES: ~{currentInstruction.estimatedClockCycles} T-STATES</span>
              </div>
              <span className="text-emerald-400 font-bold">ACCELERATED 60 FPS</span>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-500 my-auto">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-slate-700" />
            <span>Select an instruction and execute to see performance output.</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
