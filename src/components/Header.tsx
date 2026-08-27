import React from 'react';
import {
  Cpu,
  Volume2,
  VolumeX,
  Gauge,
  RotateCcw,
  BookOpen,
  Award,
  Palette,
  Sparkles
} from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';
import { AppTheme } from '../types/cpu';

export const Header: React.FC = () => {
  const {
    theme,
    setTheme,
    soundMuted,
    toggleSound,
    playbackSpeed,
    setSpeed,
    resetCpu,
    userXP,
    streak,
    setPracticeModalOpen,
    setQuizModalOpen
  } = useCpuStore();

  const themeList: { id: AppTheme; label: string; color: string }[] = [
    { id: 'intel', label: 'Intel Cyber', color: 'bg-cyan-500' },
    { id: 'cyberpunk', label: 'Cyberpunk', color: 'bg-pink-500' },
    { id: 'dos', label: 'Retro DOS', color: 'bg-emerald-500' },
    { id: 'matrix', label: 'CRT Matrix', color: 'bg-green-600' },
  ];

  return (
    <header className="relative z-30 w-full bg-[#070b1e]/90 border-b border-cyan-500/20 backdrop-blur-xl px-4 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-4">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        <div className="relative p-2.5 bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-400/50 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] group">
          <Cpu className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-extrabold font-mono tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent glow-text-cyan">
              i8086 SIMULATOR
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 border border-cyan-400/40 text-cyan-300">
              v2.5 PRO
            </span>
          </div>
          <p className="text-[11px] font-mono text-cyan-300/70 hidden sm:block">
            Intel 8086 Addressing Mode & Execution Visualizer
          </p>
        </div>
      </div>

      {/* Center Gamification & Speed Control */}
      <div className="flex items-center space-x-3 flex-wrap">
        {/* Practice Mode Launcher */}
        <button
          onClick={() => setPracticeModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs font-mono font-semibold hover:bg-indigo-900/90 transition-all cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.2)]"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Practice</span>
        </button>

        {/* Quiz Mode Launcher */}
        <button
          onClick={() => setQuizModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-mono font-semibold hover:bg-purple-900/90 transition-all cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.2)]"
        >
          <Award className="w-3.5 h-3.5 text-purple-400" />
          <span>Quiz ({userXP} XP)</span>
          <span className="ml-1 text-[10px] text-amber-400 font-bold flex items-center">
            🔥 {streak}
          </span>
        </button>

        {/* Speed Slider */}
        <div className="flex items-center space-x-2 bg-slate-900/80 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-mono">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-300 text-[11px]">Speed:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="bg-slate-950 text-cyan-300 font-mono text-xs border border-cyan-500/30 rounded px-1.5 py-0.5 outline-none cursor-pointer"
          >
            <option value={0.2}>0.2x (Slow)</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>1.0x (Normal)</option>
            <option value={2}>2.0x (Fast)</option>
            <option value={3}>3.0x (Turbo)</option>
          </select>
        </div>
      </div>

      {/* Right Controls (Theme, Sound, Reset) */}
      <div className="flex items-center space-x-2">
        {/* Theme Picker Dropdown */}
        <div className="relative group">
          <button className="p-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 transition-colors">
            <Palette className="w-4 h-4" />
          </button>
          <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col bg-[#0a0f26] border border-cyan-500/30 rounded-xl p-2 shadow-2xl z-50 min-w-[140px] backdrop-blur-xl">
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-1 uppercase tracking-wider">Select Theme</span>
            {themeList.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center space-x-2 px-2 py-1.5 rounded text-xs font-mono text-left cursor-pointer transition-colors ${
                  theme === t.id ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleSound}
          title={soundMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            soundMuted
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-400'
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
          }`}
        >
          {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Reset CPU */}
        <button
          onClick={resetCpu}
          title="Reset CPU & Registers"
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-mono hover:bg-rose-900/80 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
};
