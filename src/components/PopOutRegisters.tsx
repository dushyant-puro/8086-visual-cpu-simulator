import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Binary, Info, Sparkles } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';
import { GeneralRegister, SegmentRegister } from '../types/cpu';
import { toHex16, toBinary16 } from '../engine/parser';

interface RegisterMeta {
  name: GeneralRegister | SegmentRegister;
  purpose: string;
  category: 'General' | 'Pointer/Index' | 'Segment';
}

const REGISTER_METADATA: RegisterMeta[] = [
  { name: 'AX', purpose: 'Accumulator Register (I/O & Arithmetic)', category: 'General' },
  { name: 'BX', purpose: 'Base Register (Memory Pointer)', category: 'General' },
  { name: 'CX', purpose: 'Count Register (Loop & Shift Counter)', category: 'General' },
  { name: 'DX', purpose: 'Data Register (I/O & Division)', category: 'General' },
  { name: 'SI', purpose: 'Source Index (Memory Source Pointer)', category: 'Pointer/Index' },
  { name: 'DI', purpose: 'Destination Index (Memory Destination)', category: 'Pointer/Index' },
  { name: 'BP', purpose: 'Base Pointer (Stack Frame Pointer)', category: 'Pointer/Index' },
  { name: 'SP', purpose: 'Stack Pointer (Top of Stack)', category: 'Pointer/Index' },
  { name: 'CS', purpose: 'Code Segment (Instruction Code Pointer)', category: 'Segment' },
  { name: 'DS', purpose: 'Data Segment (Default Data Segment)', category: 'Segment' },
  { name: 'SS', purpose: 'Stack Segment (Stack Data Segment)', category: 'Segment' },
  { name: 'ES', purpose: 'Extra Segment (String Ops Destination)', category: 'Segment' },
];

export const PopOutRegisters: React.FC = () => {
  const { registers, previousRegisters, popOutRegisters, isPlaying, activeReadingRegister, isExecutionSuccess } = useCpuStore();

  return (
    <div className="relative w-full glass-panel rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
      <div className="flex items-center justify-between mb-4 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-cyan-200 tracking-wider">
            8086 HOLOGRAPHIC REGISTERS
          </h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          POP-OUT ACTIVE: {popOutRegisters.length}
        </span>
      </div>

      {/* Grid of Holographic Register Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REGISTER_METADATA.map((reg) => {
          const val = registers[reg.name] || 0;
          const prevVal = previousRegisters[reg.name] || 0;
          const isPopped = popOutRegisters.includes(reg.name as GeneralRegister);
          const isCurrentlyReading = activeReadingRegister === reg.name;

          // Check changed bits for binary highlight
          const currentBin = (val & 0xffff).toString(2).padStart(16, '0');
          const prevBin = (prevVal & 0xffff).toString(2).padStart(16, '0');

          return (
            <motion.div
              key={reg.name}
              layout
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={
                isPlaying && isPopped
                  ? {
                      scale: 1.05,
                      y: -10,
                      opacity: 1,
                      borderColor: isCurrentlyReading ? 'rgba(8, 247, 254, 1)' : 'rgba(0, 240, 255, 0.8)',
                      boxShadow: isCurrentlyReading
                        ? '0 0 35px rgba(8, 247, 254, 0.8), inset 0 0 20px rgba(0, 240, 255, 0.4)'
                        : '0 0 25px rgba(0, 240, 255, 0.4)',
                    }
                  : isExecutionSuccess && isPopped
                  ? {
                      scale: 1.02,
                      y: -4,
                      borderColor: 'rgba(16, 185, 129, 0.8)',
                      boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)',
                    }
                  : {
                      scale: 1,
                      y: 0,
                      opacity: 0.65,
                      borderColor: 'rgba(0, 240, 255, 0.15)',
                      boxShadow: '0 0 0px transparent',
                    }
              }
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`relative rounded-xl p-3 border backdrop-blur-md group cursor-pointer transition-colors ${
                isPopped
                  ? 'bg-gradient-to-br from-cyan-950/80 via-[#0a1236] to-[#0d1848]'
                  : 'bg-slate-950/60 hover:bg-slate-900/80'
              }`}
            >
              {/* Active Badge */}
              {isPopped && (
                <div className={`absolute -top-1 -right-1 flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono shadow-md ${
                  isCurrentlyReading
                    ? 'bg-cyan-300 text-slate-950 shadow-[0_0_12px_#08f7fe] animate-pulse'
                    : 'bg-cyan-500 text-slate-950'
                }`}>
                  <span>{isCurrentlyReading ? 'READING' : 'ACTIVE'}</span>
                </div>
              )}

              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-base font-extrabold font-mono ${
                  isCurrentlyReading ? 'text-cyan-300 glow-text-cyan scale-110' : isPopped ? 'text-cyan-300' : 'text-slate-300'
                }`}>
                  {reg.name}
                </span>
                <span className="text-[9px] font-mono text-cyan-400/70 bg-slate-900 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  {reg.category}
                </span>
              </div>

              {/* Value Displays */}
              <div className="space-y-1 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[10px]">HEX:</span>
                  <span className={`font-bold tracking-wider ${isCurrentlyReading ? 'text-cyan-200 glow-text-cyan' : 'text-cyan-300'}`}>
                    {toHex16(val)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 text-[9px]">DEC:</span>
                  <span className="text-purple-300 font-semibold">{val}</span>
                </div>

                {/* 16-Bit Binary Bits with Bit Flip Highlighting */}
                <div className="border-t border-cyan-500/10 pt-1 mt-1">
                  <div className="text-[8px] text-slate-400 mb-0.5 flex items-center justify-between">
                    <span>16-BIT BINARY</span>
                    {val !== prevVal && <span className="text-emerald-400 text-[8px] font-bold">UPDATED</span>}
                  </div>
                  <div className="flex justify-between text-[8px] font-mono tracking-tighter">
                    {currentBin.split('').map((bit, idx) => {
                      const bitChanged = bit !== prevBin[idx] && val !== prevVal;
                      return (
                        <span
                          key={idx}
                          className={`px-0.5 rounded ${
                            bitChanged
                              ? 'bg-emerald-400 text-slate-950 font-extrabold animate-bounce'
                              : bit === '1'
                              ? 'text-cyan-300 font-semibold'
                              : 'text-slate-600'
                          }`}
                        >
                          {bit}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Hover Tooltip */}
              <div className="absolute inset-x-0 -bottom-1 translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-2 transition-all duration-200 z-30 pointer-events-none p-2 rounded-lg bg-[#070d24] border border-cyan-400/50 shadow-2xl text-[10px] font-mono text-cyan-200">
                <div className="flex items-center space-x-1 font-bold text-cyan-400 mb-0.5">
                  <Info className="w-3 h-3" />
                  <span>{reg.name} Role</span>
                </div>
                <p>{reg.purpose}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
