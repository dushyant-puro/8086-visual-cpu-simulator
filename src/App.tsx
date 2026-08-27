import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCpuStore } from './store/useCpuStore';
import { MotherboardCanvas } from './components/MotherboardCanvas';
import { SplashIntro } from './components/SplashIntro';
import { Header } from './components/Header';
import { CpuCore } from './components/CpuCore';
import { PopOutRegisters } from './components/PopOutRegisters';
import { AssemblyEditor } from './components/AssemblyEditor';
import { PipelineStepper } from './components/PipelineStepper';
import { AluVisualizer } from './components/AluVisualizer';
import { AddressCalculator } from './components/AddressCalculator';
import { MemoryVisualizer } from './components/MemoryVisualizer';
import { BusSystem } from './components/BusSystem';
import { ExecutionConsole } from './components/ExecutionConsole';
import { OutputPanel } from './components/OutputPanel';
import { PracticeModal } from './components/PracticeModal';
import { QuizModal } from './components/QuizModal';

export const App: React.FC = () => {
  const { showSplash, theme } = useCpuStore();

  return (
    <div className={`min-h-screen w-full relative bg-[#050816] text-slate-100 theme-${theme} selection:bg-cyan-500/30 selection:text-cyan-200`}>
      {/* 60 FPS Canvas Motherboard Background */}
      <MotherboardCanvas />

      {/* Opening Cyberpunk Splash Animation */}
      <AnimatePresence>
        {showSplash && <SplashIntro key="splash" />}
      </AnimatePresence>

      {/* Main Dashboard Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: Central CPU & Holographic Pop-Out Registers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4 flex">
              <CpuCore />
            </div>
            <div className="lg:col-span-8 flex">
              <PopOutRegisters />
            </div>
          </div>

          {/* Section 2: Assembly Editor & 10-Stage Pipeline Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 flex">
              <AssemblyEditor />
            </div>
            <div className="lg:col-span-7 flex">
              <PipelineStepper />
            </div>
          </div>

          {/* Section 3: ALU & Address Calculator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <AluVisualizer />
            <AddressCalculator />
          </div>

          {/* Section 4: 1MB RAM Visualizer & Bus System */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <MemoryVisualizer />
            <BusSystem />
          </div>

          {/* Section 5: Execution Console & Output Summary Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <ExecutionConsole />
            <OutputPanel />
          </div>
        </main>
      </div>

      {/* Interactive Modals */}
      <PracticeModal />
      <QuizModal />
    </div>
  );
};

export default App;
