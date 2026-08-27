import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Binary } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';

export const AluVisualizer: React.FC = () => {
  const { currentStepIndex, executionSteps } = useCpuStore();
  const currentStep = executionSteps[currentStepIndex];

  const aluDetails = currentStep?.aluDetails;
  const isAluActive = currentStep?.stage === 4;

  return (
    <div className="relative w-full glass-panel rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-cyan-200 tracking-wider">
            ARITHMETIC LOGIC UNIT (ALU)
          </h2>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
          isAluActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}>
          {isAluActive ? 'ALU COMPUTING' : 'ALU IDLE'}
        </span>
      </div>

      {/* Futuristic ALU Box */}
      <motion.div
        animate={isAluActive ? { scale: [1, 1.03, 1], borderColor: 'rgba(0, 240, 255, 0.9)', boxShadow: '0 0 35px rgba(0,240,255,0.6)' } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: isAluActive ? Infinity : 0 }}
        className="relative p-4 rounded-xl bg-gradient-to-br from-[#070e28] via-[#05091e] to-[#0a1236] border border-cyan-500/30 flex flex-col items-center justify-center shadow-inner my-auto min-h-[150px] overflow-hidden"
      >
        {aluDetails ? (
          <div className="w-full flex items-center justify-around flex-wrap gap-3 font-mono z-10">
            {/* Input Operand 1 */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center bg-slate-900/80 p-2.5 rounded-lg border border-cyan-500/30 min-w-[85px]"
            >
              <div className="text-[9px] text-slate-400">OPERAND 1</div>
              <div className="text-sm font-bold text-cyan-300">{aluDetails.operand1Hex}</div>
              <div className="text-[9px] text-slate-400">{aluDetails.operand1} Dec</div>
            </motion.div>

            {/* Operator Symbol */}
            <motion.div
              animate={{ scale: isAluActive ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5, repeat: isAluActive ? Infinity : 0 }}
              className="flex flex-col items-center"
            >
              <span className="text-base font-extrabold text-purple-400 glow-text-purple bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-500/40">
                {aluDetails.operator}
              </span>
            </motion.div>

            {/* Input Operand 2 */}
            {aluDetails.operand2Hex && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center bg-slate-900/80 p-2.5 rounded-lg border border-cyan-500/30 min-w-[85px]"
              >
                <div className="text-[9px] text-slate-400">OPERAND 2</div>
                <div className="text-sm font-bold text-cyan-300">{aluDetails.operand2Hex}</div>
                <div className="text-[9px] text-slate-400">{aluDetails.operand2} Dec</div>
              </motion.div>
            )}

            <ArrowRight className="w-5 h-5 text-cyan-400 animate-pulse hidden sm:block" />

            {/* Result Output */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center bg-gradient-to-br from-cyan-950 to-indigo-950 p-2.5 rounded-lg border-2 border-cyan-400 min-w-[95px] shadow-[0_0_25px_rgba(0,240,255,0.5)]"
            >
              <div className="text-[9px] text-cyan-400">RESULT</div>
              <div className="text-base font-extrabold text-cyan-200 glow-text-cyan">{aluDetails.resultHex}</div>
              <div className="text-[9px] text-cyan-300/80">{aluDetails.result} Dec</div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center text-slate-500 font-mono text-xs">
            <Binary className="w-8 h-8 mx-auto mb-1 text-slate-700" />
            <span>Waiting for Arithmetic / Bitwise ALU stage...</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
