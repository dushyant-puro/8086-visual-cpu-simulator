import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';

export const BusSystem: React.FC = () => {
  const { currentStepIndex, executionSteps } = useCpuStore();
  const currentStep = executionSteps[currentStepIndex];

  const busActivity = currentStep?.busActivity;
  const isBusActive = currentStep?.stage === 0 || currentStep?.stage === 8 || currentStep?.stage === 9;

  return (
    <div className="relative w-full glass-panel rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-cyan-200 tracking-wider">
            SYSTEM BUSES (ADDRESS, DATA, CONTROL)
          </h2>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
          isBusActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}>
          {isBusActive ? 'BUS TRANSMITTING' : 'BUS STANDBY'}
        </span>
      </div>

      <div className="space-y-3 font-mono">
        {/* Address Bus (20-bit Cyan Particles) */}
        <div className="relative p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between overflow-hidden">
          <div className="flex items-center space-x-2 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span className="text-xs font-bold text-cyan-300">ADDRESS BUS (20-BIT)</span>
          </div>

          <div className="text-xs font-bold text-cyan-200 glow-text-cyan z-10">
            {busActivity?.addressBusHex || '32120H'}
          </div>

          {/* Traveling Particles Stream */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-around opacity-70">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ x: ['-100%', '800%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.25,
                }}
                className="w-2 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff]"
              />
            ))}
          </div>
        </div>

        {/* Data Bus (16-bit Emerald Particles) */}
        <div className="relative p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between overflow-hidden">
          <div className="flex items-center space-x-2 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span className="text-xs font-bold text-emerald-300">DATA BUS (16-BIT)</span>
          </div>

          <div className="text-xs font-bold text-emerald-200 glow-text-emerald z-10">
            {busActivity?.dataBusHex || '0045H'}
          </div>

          {/* Traveling Particles Stream */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-around opacity-70">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ x: ['800%', '-100%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.25,
                }}
                className="w-2 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]"
              />
            ))}
          </div>
        </div>

        {/* Control Bus (Orange Pulses) */}
        <div className="relative p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between overflow-hidden">
          <div className="flex items-center space-x-2 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-xs font-bold text-amber-300">CONTROL BUS</span>
          </div>

          <div className="text-xs font-bold text-amber-200 z-10 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
            SIGNAL: {busActivity?.controlSignal || 'READ'}
          </div>

          {/* Pulse Signal */}
          {isBusActive && (
            <motion.div
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-amber-500/10 pointer-events-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};
