import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, CheckCircle2 } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';
import { toHex20, toHex16 } from '../engine/parser';

export const MemoryVisualizer: React.FC = () => {
  const { memory, currentStepIndex, executionSteps } = useCpuStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const currentStep = executionSteps[currentStepIndex];
  const activeAddr = currentStep?.accessedMemoryAddress ?? 0x32120;
  const activeVal = currentStep?.accessedMemoryValue ?? 0x45;
  const isMemoryStage = currentStep?.stage === 8 || currentStep?.stage === 9;

  // Auto-scroll to active memory address inside RAM list container
  useEffect(() => {
    if (scrollRef.current && activeAddr !== undefined && isMemoryStage) {
      const container = scrollRef.current;
      const targetElem = document.getElementById(`mem-cell-${activeAddr}`);
      if (targetElem) {
        const targetTop = targetElem.offsetTop - container.offsetTop;
        container.scrollTo({ top: Math.max(0, targetTop - 60), behavior: 'smooth' });
      }
    }
  }, [activeAddr, isMemoryStage]);

  // Generate view window of memory addresses around activeAddr
  const range = 12;
  const baseAddr = Math.max(0, activeAddr - Math.floor(range / 2));
  const memoryCells = Array.from({ length: range }).map((_, i) => {
    const addr = baseAddr + i;
    const val = memory[addr % memory.length] || 0;
    return {
      addr,
      addrHex: toHex20(addr),
      val,
      valHex: (val & 0xff).toString(16).toUpperCase().padStart(2, '0') + 'H'
    };
  });

  return (
    <div className="relative w-full glass-panel rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-cyan-200 tracking-wider">
            1MB SYSTEM RAM VISUALIZER
          </h2>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
          isMemoryStage ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}>
          {isMemoryStage ? 'RAM BUS ACTIVE' : 'RAM IDLE'}
        </span>
      </div>

      {/* Target Address Callout Badge */}
      {isMemoryStage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 p-2 rounded-lg bg-emerald-950/80 border border-emerald-400 text-emerald-200 font-mono text-xs font-bold flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Memory[{toHex20(activeAddr)}] = {toHex16(activeVal)}</span>
          </div>
          <span className="text-[10px] text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded">DATA ACCESSED</span>
        </motion.div>
      )}

      {/* Memory Cell Grid */}
      <div
        ref={scrollRef}
        className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 font-mono text-xs custom-scrollbar"
      >
        {memoryCells.map((cell) => {
          const isTarget = cell.addr === activeAddr;

          return (
            <motion.div
              key={cell.addr}
              id={`mem-cell-${cell.addr}`}
              animate={
                isTarget && isMemoryStage
                  ? { scale: [1, 1.03, 1], backgroundColor: 'rgba(16, 185, 129, 0.3)', boxShadow: '0 0 20px rgba(16,185,129,0.5)' }
                  : { scale: 1 }
              }
              transition={{ duration: 0.4 }}
              className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                isTarget
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-cyan-400/70">PHYSICAL:</span>
                <span className="text-cyan-300 font-bold">{cell.addrHex}</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-[10px] text-slate-400">VAL:</div>
                <div className={`px-2 py-0.5 rounded font-mono font-bold ${isTarget ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-cyan-300'}`}>
                  {cell.valHex}
                </div>
                {isTarget && (
                  <span className="text-[9px] bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded font-extrabold animate-pulse">
                    TARGET CELL
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
