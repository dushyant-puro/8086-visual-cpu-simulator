import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';
import { toHex16 } from '../engine/parser';

export const CpuCore: React.FC = () => {
  const { isPlaying, currentInstruction, registers, flags, isExecutionSuccess } = useCpuStore();

  return (
    <div className="relative flex flex-col items-center justify-center p-6 glass-panel rounded-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(0,240,255,0.15)] overflow-hidden min-h-[300px] w-full">
      {/* Background Animated Pulse Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.1)_0,transparent_75%)]" />

      {/* Execution Complete Radial Pulse Wave */}
      <AnimatePresence>
        {isExecutionSuccess && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-4 border-cyan-400 pointer-events-none shadow-[0_0_50px_#00f0ff]"
          />
        )}
      </AnimatePresence>

      {/* Main CPU Die */}
      <motion.div
        animate={
          isPlaying
            ? {
                scale: [1, 1.03, 1],
                x: [-1, 1, -1, 1, 0],
                boxShadow: [
                  '0 0 20px rgba(0, 240, 255, 0.4)',
                  '0 0 50px rgba(0, 240, 255, 0.9)',
                  '0 0 20px rgba(0, 240, 255, 0.4)',
                ],
              }
            : isExecutionSuccess
            ? {
                scale: [1, 1.05, 1],
                boxShadow: '0 0 60px rgba(16, 185, 129, 0.9)',
              }
            : { scale: 1, x: 0 }
        }
        transition={{ duration: isPlaying ? 0.3 : 0.8, repeat: isPlaying ? Infinity : 0 }}
        className={`relative z-10 w-52 h-52 sm:w-60 sm:h-60 rounded-2xl bg-gradient-to-br from-[#0c1438] via-[#080d28] to-[#040718] border-2 p-4 flex flex-col justify-between transition-colors ${
          isExecutionSuccess ? 'border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)]' : 'border-cyan-400/60 shadow-[0_0_35px_rgba(0,240,255,0.3)]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${
              isPlaying ? 'bg-cyan-400 animate-ping' : isExecutionSuccess ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-emerald-400'
            }`} />
            <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">
              {isPlaying ? 'EXECUTING' : isExecutionSuccess ? 'SUCCESS' : 'IDLE / READY'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/70">CLK: 5 MHz</span>
        </div>

        {/* Central Glowing Silicon Core */}
        <div className="relative my-auto flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-indigo-950 border border-cyan-400/50 shadow-inner">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.2)_0,transparent_70%)] pointer-events-none"
          />

          <Cpu className={`w-10 h-10 sm:w-12 sm:h-12 mb-1 ${
            isExecutionSuccess ? 'text-emerald-400 drop-shadow-[0_0_15px_#10b981]' : 'text-cyan-400 drop-shadow-[0_0_10px_#00f0ff]'
          }`} />
          <div className="text-xs font-bold font-mono tracking-widest text-cyan-200">INTEL 8086</div>
          <div className="text-[9px] font-mono text-cyan-400/80">IP: {toHex16(registers.IP)}</div>
        </div>

        {/* Flags Summary Row */}
        <div className="grid grid-cols-5 gap-1 text-[9px] font-mono text-center">
          <div className={`p-1 rounded border ${flags.ZF ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'}`}>
            ZF={flags.ZF ? 1 : 0}
          </div>
          <div className={`p-1 rounded border ${flags.CF ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'}`}>
            CF={flags.CF ? 1 : 0}
          </div>
          <div className={`p-1 rounded border ${flags.SF ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'}`}>
            SF={flags.SF ? 1 : 0}
          </div>
          <div className={`p-1 rounded border ${flags.OF ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'}`}>
            OF={flags.OF ? 1 : 0}
          </div>
          <div className={`p-1 rounded border ${flags.PF ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'}`}>
            PF={flags.PF ? 1 : 0}
          </div>
        </div>
      </motion.div>

      {/* Execution Complete Banner */}
      <AnimatePresence>
        {isExecutionSuccess && (
          <motion.div
            initial={{ y: 15, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="mt-3 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 font-mono text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] z-20"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instruction Executed Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Instruction Overlay */}
      {!isExecutionSuccess && (
        <div className="mt-4 text-center z-10">
          <div className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">Active Instruction</div>
          <div className="text-sm font-bold font-mono text-cyan-200 bg-slate-900/80 px-3 py-1 rounded-lg border border-cyan-500/30 mt-1 inline-block glow-text-cyan">
            {currentInstruction?.raw || 'MOV AX, [BX+SI+20H]'}
          </div>
        </div>
      )}
    </div>
  );
};
