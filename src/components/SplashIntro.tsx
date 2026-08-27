import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Play, Terminal, Layers } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';

export const SplashIntro: React.FC = () => {
  const dismissSplash = useCpuStore(state => state.dismissSplash);

  // Keyboard shortcut listener (Press Enter or Space or click anywhere to launch)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        dismissSplash();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismissSplash]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onClick={() => dismissSplash()}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050816] text-white overflow-hidden cursor-pointer"
    >
      {/* Background Matrix/Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.15)_0,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#00f0ff12_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Central Glowing CPU Chip */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, rotateX: 20 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative group mb-8 pointer-events-none"
      >
        {/* Outer Pulsing Glow Ring */}
        <div className="absolute -inset-8 bg-cyan-500/20 rounded-3xl blur-2xl group-hover:bg-cyan-400/30 transition-all duration-700 animate-pulse" />

        <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-[#0a0f26] border-2 border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.4)] flex flex-col items-center justify-between backdrop-blur-md">
          {/* Pins on top & bottom */}
          <div className="absolute -top-3 left-6 right-6 flex justify-between">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-1 h-3 bg-cyan-400/60 rounded-full shadow-[0_0_5px_#00f0ff]" />
            ))}
          </div>

          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400/80">INTEL 8086</span>
            <span className="text-[10px] font-mono text-cyan-400/80">16-BIT CPU</span>
          </div>

          {/* Central Die Core */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 15px rgba(0, 240, 255, 0.4)',
                '0 0 35px rgba(0, 240, 255, 0.8)',
                '0 0 15px rgba(0, 240, 255, 0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gradient-to-br from-cyan-900/60 via-slate-900 to-indigo-950 border border-cyan-400/50 flex flex-col items-center justify-center p-3 relative overflow-hidden"
          >
            <Cpu className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_#00f0ff] mb-1" />
            <div className="text-[11px] font-bold font-mono tracking-wider text-cyan-300">i8086</div>
            <div className="text-[8px] font-mono text-cyan-400/70">5 MHz ARCH</div>
          </motion.div>

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[9px] font-mono text-emerald-400">READY</span>
            </div>
            <span className="text-[9px] font-mono text-cyan-400/70">DIP-40</span>
          </div>

          <div className="absolute -bottom-3 left-6 right-6 flex justify-between">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-1 h-3 bg-cyan-400/60 rounded-full shadow-[0_0_5px_#00f0ff]" />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Title & Subtitle */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-center px-4 max-w-2xl relative z-20 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400 bg-clip-text text-transparent glow-text-cyan mb-3">
          8086 Visual CPU Simulator
        </h1>
        <p className="text-sm sm:text-base text-cyan-200/80 font-mono max-w-lg mx-auto mb-6">
          Interactive Addressing Mode & Real-time Instruction Execution Engine
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 text-xs font-mono text-cyan-300/90">
          <div className="flex items-center space-x-1.5 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-full backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dynamic Pop-Out Registers</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-purple-950/60 border border-purple-500/30 px-3 py-1.5 rounded-full backdrop-blur-md">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>10-Stage CPU Pipeline</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full backdrop-blur-md">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>EA & Physical Address Calculator</span>
          </div>
        </div>

        {/* Launch Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(0,240,255,0.7)' }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dismissSplash();
          }}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-slate-950 font-bold text-sm sm:text-base tracking-wider uppercase shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center space-x-2 mx-auto cursor-pointer transition-all duration-300 z-50 relative"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Launch CPU Simulator</span>
        </motion.button>

        <div className="mt-3 text-[11px] font-mono text-cyan-400/60">
          (Click anywhere or press Enter/Space to launch)
        </div>
      </motion.div>
    </motion.div>
  );
};
