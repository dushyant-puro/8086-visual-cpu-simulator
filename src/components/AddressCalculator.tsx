import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { useCpuStore } from '../store/useCpuStore';

export const AddressCalculator: React.FC = () => {
  const { currentStepIndex, executionSteps } = useCpuStore();
  const currentStep = executionSteps[currentStepIndex];

  const addressCalc = currentStep?.addressCalc;
  const isAddressActive = currentStep?.stage === 5 || currentStep?.stage === 6 || currentStep?.stage === 7;

  return (
    <div className="relative w-full glass-panel rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-cyan-200 tracking-wider">
            EFFECTIVE & PHYSICAL ADDRESS CALCULATOR
          </h2>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
          isAddressActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}>
          {isAddressActive ? 'CALCULATING PA' : 'PA ENGINE READY'}
        </span>
      </div>

      {addressCalc ? (
        <div className="space-y-3 font-mono">
          {/* 1. Effective Address (EA) Step-by-Step Expansion */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2"
          >
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Step 1: Effective Address (EA = Base + Index + Disp)</span>
            </div>

            <div className="flex items-center justify-start flex-wrap gap-2 text-xs sm:text-sm">
              {addressCalc.baseRegName && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded border border-cyan-500/20"
                >
                  <span className="text-slate-400 text-[10px]">{addressCalc.baseRegName}:</span>
                  <span className="font-bold text-cyan-300">{(addressCalc.baseVal || 0).toString(16).toUpperCase().padStart(4, '0')}H</span>
                </motion.div>
              )}

              {addressCalc.baseRegName && addressCalc.indexRegName && (
                <span className="text-purple-400 font-bold">+</span>
              )}

              {addressCalc.indexRegName && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded border border-cyan-500/20"
                >
                  <span className="text-slate-400 text-[10px]">{addressCalc.indexRegName}:</span>
                  <span className="font-bold text-cyan-300">{(addressCalc.indexVal || 0).toString(16).toUpperCase().padStart(4, '0')}H</span>
                </motion.div>
              )}

              {addressCalc.displacementVal !== undefined && addressCalc.displacementVal > 0 && (
                <>
                  <span className="text-purple-400 font-bold">+</span>
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded border border-cyan-500/20"
                  >
                    <span className="text-slate-400 text-[10px]">DISP:</span>
                    <span className="font-bold text-cyan-300">{addressCalc.displacementVal.toString(16).toUpperCase().padStart(2, '0')}H</span>
                  </motion.div>
                </>
              )}

              <span className="text-cyan-400 font-bold">=</span>

              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5 }}
                className="bg-cyan-950 px-3 py-1 rounded border border-cyan-400 font-bold text-cyan-200 glow-text-cyan"
              >
                EA = {addressCalc.effectiveAddressHex}
              </motion.div>
            </div>
          </motion.div>

          {/* 2. Physical Address (PA) Translation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/60 via-slate-950 to-indigo-950 border-2 border-cyan-400/60 space-y-2 shadow-[0_0_25px_rgba(0,240,255,0.2)]"
          >
            <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest flex items-center space-x-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Step 2: 20-Bit Physical Address Translation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs text-center">
              <div className="bg-slate-900/90 p-2 rounded-lg border border-cyan-500/20">
                <div className="text-[9px] text-slate-400">{addressCalc.segmentRegName} Segment</div>
                <div className="font-bold text-cyan-300">{addressCalc.segmentValHex}</div>
              </div>

              <div className="bg-slate-900/90 p-2 rounded-lg border border-cyan-500/20">
                <div className="text-[9px] text-slate-400">Shifted (x16)</div>
                <div className="font-bold text-purple-300">{addressCalc.shiftedSegmentHex}</div>
              </div>

              <div className="bg-slate-900/90 p-2 rounded-lg border border-cyan-500/20">
                <div className="text-[9px] text-slate-400">+ EA</div>
                <div className="font-bold text-cyan-300">{addressCalc.effectiveAddressHex}</div>
              </div>

              <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-400 font-bold">
                <div className="text-[9px] text-cyan-300">Physical Address</div>
                <div className="text-sm text-cyan-200 glow-text-cyan">{addressCalc.physicalAddressHex}</div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-cyan-300/80 text-center border-t border-cyan-500/20 pt-1">
              FORMULA: PA = ({addressCalc.segmentRegName} × 16) + EA = ({addressCalc.segmentValHex} × 10H) + {addressCalc.effectiveAddressHex} = <span className="font-bold text-cyan-200">{addressCalc.physicalAddressHex}</span>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="p-6 text-center text-slate-500 font-mono text-xs my-auto">
          <Calculator className="w-8 h-8 mx-auto mb-1 text-slate-700" />
          <span>Execute a memory instruction to visualize EA & PA calculations.</span>
        </div>
      )}
    </div>
  );
};
