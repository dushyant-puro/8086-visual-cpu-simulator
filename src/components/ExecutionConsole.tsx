import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Trash2, Download, CheckCircle, Info, AlertTriangle, Check } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';

export const ExecutionConsole: React.FC = () => {
  const { logs, clearConsoleLogs } = useCpuStore();
  const consoleContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const exportLogText = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `8086_execution_log_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="relative w-full glass-panel rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] flex flex-col justify-between h-[280px]">
      <div className="flex items-center justify-between mb-2 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-cyan-200 tracking-wider">
            EXECUTION CONSOLE & LOGS
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportLogText}
            title="Export Log as TXT"
            className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 text-xs font-mono flex items-center space-x-1 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={clearConsoleLogs}
            title="Clear Console"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs font-mono transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={consoleContainerRef}
        className="flex-1 bg-[#030612] rounded-xl p-3 border border-cyan-500/20 overflow-y-auto font-mono text-xs space-y-1.5 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-2 leading-relaxed"
            >
              <span className="text-slate-500 text-[10px] shrink-0 font-sans">[{log.timestamp}]</span>
              {log.type === 'error' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              ) : log.type === 'stage' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              )}

              <span className={
                log.type === 'error'
                  ? 'text-rose-300 font-bold'
                  : log.type === 'stage'
                  ? 'text-emerald-300 font-bold glow-text-emerald'
                  : 'text-slate-300'
              }>
                {log.type === 'stage' || log.type === 'info' ? `✔ ${log.text}` : log.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
