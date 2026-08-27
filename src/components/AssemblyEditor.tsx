import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Code, CheckCircle, AlertTriangle, Sparkles, SkipForward, ArrowRight } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';

const PRESET_PROGRAMS = [
  {
    label: 'Addressing Sequence',
    code: `; Multi-line Addressing Mode Test\nMOV BX, 2000H\nMOV SI, 0100H\nMOV AX, [BX+SI+20H]\nADD AX, 100H`
  },
  {
    label: 'Arithmetic Calculation',
    code: `; Multi-line ALU Program\nMOV AX, 0100H\nMOV BX, 0020H\nADD AX, BX\nSUB AX, 0010H`
  },
  {
    label: 'Memory Direct Load',
    code: `; Direct Memory Program\nMOV AL, [1234H]\nMOV AH, 0045H\nMOV BX, 1000H`
  },
  {
    label: 'Syntax Error Test',
    code: `; Test line-specific error handling\nMOV BX, 2000H\nMOV AX, [AX+SI] ; Invalid 8086 mode on Line 3\nMOV CX, 100H`
  }
];

export const AssemblyEditor: React.FC = () => {
  const {
    rawCode,
    setRawCode,
    loadPresetInstruction,
    executeInstruction,
    stepNextInstruction,
    program,
    programCounter,
    syntaxErrors,
    currentInstruction,
    isPlaying
  } = useCpuStore();

  const lines = rawCode.split('\n');
  const activeLineNumber = program[programCounter]?.lineNumber || 1;

  return (
    <div className="relative w-full glass-panel rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] flex flex-col justify-between">
      <div>
        {/* Editor Title & Presets Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-cyan-500/20 pb-2">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold font-mono text-cyan-200 tracking-wider">
              8086 MULTI-LINE PROGRAM EDITOR
            </h2>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[11px]">
              IP: Line {activeLineNumber} ({programCounter + 1}/{Math.max(1, program.length)})
            </span>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
          <span className="text-[10px] font-mono text-cyan-400/70 whitespace-nowrap">PRESETS:</span>
          {PRESET_PROGRAMS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => loadPresetInstruction(preset.code)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono hover:border-cyan-400 hover:bg-cyan-950/50 transition-all whitespace-nowrap cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Multi-Line Code Editor Container */}
        <div className="relative rounded-xl bg-[#030612] border-2 border-cyan-500/40 p-3 shadow-inner flex mb-3">
          {/* Line Numbers & IP Markers Sidebar */}
          <div className="pr-3 border-r border-cyan-500/20 font-mono text-xs select-none text-right text-slate-500 space-y-1">
            {lines.map((_, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLineNumber;
              const hasError = syntaxErrors.some(e => e.lineNumber === lineNum);

              return (
                <div key={idx} className="flex items-center justify-end space-x-1 h-6">
                  {isActive && <ArrowRight className="w-3 h-3 text-cyan-400 animate-pulse" />}
                  <span className={
                    hasError
                      ? 'text-rose-400 font-bold'
                      : isActive
                      ? 'text-cyan-300 font-bold glow-text-cyan'
                      : 'text-slate-600'
                  }>
                    {lineNum}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Code Textarea Area */}
          <div className="flex-1 pl-3 overflow-hidden">
            <textarea
              value={rawCode}
              onChange={(e) => setRawCode(e.target.value)}
              placeholder="Type 8086 assembly instructions (one per line)..."
              rows={Math.max(5, lines.length)}
              className="w-full bg-transparent text-cyan-200 font-mono text-sm leading-6 focus:outline-none resize-none placeholder:text-slate-600 custom-scrollbar"
            />
          </div>
        </div>

        {/* Parsed Cards Breakdown for Active Instruction */}
        {currentInstruction && currentInstruction.isValid && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs mb-3"
          >
            <div className="bg-slate-900/90 p-2 rounded-lg border border-cyan-500/30">
              <div className="text-[9px] text-slate-400 uppercase">Opcode</div>
              <div className="font-bold text-cyan-300">{currentInstruction.mnemonic}</div>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-cyan-500/30">
              <div className="text-[9px] text-slate-400 uppercase">Destination</div>
              <div className="font-bold text-purple-300">{currentInstruction.op1 || 'AX'}</div>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-cyan-500/30">
              <div className="text-[9px] text-slate-400 uppercase">Source</div>
              <div className="font-bold text-emerald-300">{currentInstruction.op2 || 'N/A'}</div>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-cyan-500/30">
              <div className="text-[9px] text-slate-400 uppercase">Mode</div>
              <div className="font-bold text-cyan-200 text-[10px] truncate">{currentInstruction.addressingMode.type}</div>
            </div>
          </motion.div>
        )}

        {/* Line-Specific Error Diagnostics */}
        {syntaxErrors.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {syntaxErrors.map((err, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-start space-x-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-300">[Line {err.lineNumber} Error]: </span>
                  <span>{err.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Action Buttons: STEP INSTRUCTION & RUN ALL */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <button
          onClick={stepNextInstruction}
          disabled={isPlaying || program.length === 0}
          className="py-3 rounded-xl bg-slate-900 border border-cyan-400 text-cyan-300 font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 hover:bg-cyan-950/50 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          <SkipForward className="w-4 h-4" />
          <span>STEP INSTRUCTION</span>
        </button>

        <button
          onClick={() => executeInstruction()}
          disabled={isPlaying || program.length === 0}
          className="py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-slate-950 font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 hover:shadow-[0_0_35px_rgba(0,240,255,0.7)] transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>RUN PROGRAM</span>
        </button>
      </div>
    </div>
  );
};
