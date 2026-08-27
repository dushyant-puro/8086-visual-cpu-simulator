import { create } from 'zustand';
import {
  RegisterName,
  GeneralRegister,
  ByteRegister,
  CpuFlags,
  ParsedInstruction,
  ExecutionStepResult,
  ConsoleLogEntry,
  AppTheme
} from '../types/cpu';
import { INITIAL_REGISTERS, INITIAL_FLAGS, RegisterState, generateExecutionSteps } from '../engine/cpu';
import { parseAssemblyLine, parseAssemblyProgram } from '../engine/parser';
import { soundFx } from '../utils/audio';

interface CpuStore {
  // CPU State
  registers: RegisterState;
  previousRegisters: RegisterState;
  flags: CpuFlags;
  memory: Uint8Array;
  
  // Program & Execution State
  rawCode: string;
  program: ParsedInstruction[];
  programCounter: number;
  syntaxErrors: { lineNumber: number; message: string }[];
  currentInstruction: ParsedInstruction | null;
  executionSteps: ExecutionStepResult[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  activeReadingRegister: RegisterName | ByteRegister | null;
  isExecutionSuccess: boolean;
  
  // UI & Pop-Out state
  showSplash: boolean;
  popOutRegisters: GeneralRegister[];
  theme: AppTheme;
  soundMuted: boolean;
  logs: ConsoleLogEntry[];
  
  // Modal & Gamification State
  practiceModalOpen: boolean;
  quizModalOpen: boolean;
  userXP: number;
  streak: number;

  // Actions
  setRawCode: (code: string) => void;
  loadPresetInstruction: (instructionStr: string) => void;
  executeInstruction: (instructionStr?: string) => void;
  stepNextInstruction: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  togglePlay: () => void;
  resetCpu: () => void;
  setSpeed: (speed: number) => void;
  setTheme: (theme: AppTheme) => void;
  toggleSound: () => void;
  dismissSplash: () => void;
  setPracticeModalOpen: (open: boolean) => void;
  setQuizModalOpen: (open: boolean) => void;
  addXP: (pts: number) => void;
  clearConsoleLogs: () => void;
}

// Populate mock RAM data (e.g. 0x45 at target address 0x32120)
const initialMemory = new Uint8Array(0x100000); // 1MB
initialMemory[0x32120] = 0x45;
initialMemory[0x32121] = 0x00;
initialMemory[0x11100] = 0x88;
initialMemory[0x11101] = 0x12;

const DEFAULT_PROGRAM = `; 8086 Multi-line Test Program
MOV BX, 2000H
MOV SI, 0100H
MOV AX, [BX+SI+20H]
ADD AX, 100H`;

const initialParsed = parseAssemblyProgram(DEFAULT_PROGRAM);

export const useCpuStore = create<CpuStore>((set, get) => ({
  registers: { ...INITIAL_REGISTERS },
  previousRegisters: { ...INITIAL_REGISTERS },
  flags: { ...INITIAL_FLAGS },
  memory: initialMemory,
  
  rawCode: DEFAULT_PROGRAM,
  program: initialParsed.instructions,
  programCounter: 0,
  syntaxErrors: initialParsed.errors,
  currentInstruction: initialParsed.instructions[0] || null,
  executionSteps: [],
  currentStepIndex: -1,
  isPlaying: false,
  playbackSpeed: 1,
  activeReadingRegister: null,
  isExecutionSuccess: false,
  
  showSplash: true,
  popOutRegisters: ['BX', 'SI', 'AX'],
  theme: 'intel',
  soundMuted: false,
  logs: [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      text: 'Intel 8086 Microprocessor Execution Engine initialized.'
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      text: 'Default Registers Loaded: CS=1000H, DS=3000H, SS=4000H, ES=5000H.'
    }
  ],
  
  practiceModalOpen: false,
  quizModalOpen: false,
  userXP: 250,
  streak: 3,

  setRawCode: (code: string) => {
    const { instructions, errors } = parseAssemblyProgram(code);
    const activeInst = instructions[get().programCounter] || instructions[0] || null;

    const popRegs: GeneralRegister[] = [];
    if (activeInst && activeInst.isValid) {
      const mode = activeInst.addressingMode;
      if (mode.baseRegister) popRegs.push(mode.baseRegister);
      if (mode.indexRegister) popRegs.push(mode.indexRegister);
      if (activeInst.op1Reg && activeInst.op1Reg.length === 2 && !activeInst.op1Reg.endsWith('H') && !activeInst.op1Reg.endsWith('L')) {
        popRegs.push(activeInst.op1Reg as GeneralRegister);
      }
      if (activeInst.op2Reg && activeInst.op2Reg.length === 2 && !activeInst.op2Reg.endsWith('H') && !activeInst.op2Reg.endsWith('L')) {
        popRegs.push(activeInst.op2Reg as GeneralRegister);
      }
    }

    set({
      rawCode: code,
      program: instructions,
      syntaxErrors: errors,
      currentInstruction: activeInst,
      popOutRegisters: Array.from(new Set(popRegs)),
      currentStepIndex: -1,
      isPlaying: false,
      isExecutionSuccess: false,
      activeReadingRegister: null
    });
  },

  loadPresetInstruction: (instructionStr: string) => {
    soundFx.playKeyClick();
    get().setRawCode(instructionStr);
    set({ programCounter: 0 });
  },

  executeInstruction: (instructionStr?: string) => {
    const { program, programCounter } = get();
    const instToExec = instructionStr ? parseAssemblyLine(instructionStr) : (program[programCounter] || program[0]);

    if (!instToExec || !instToExec.isValid) {
      soundFx.playError();
      const lineNum = instToExec?.lineNumber ? `Line ${instToExec.lineNumber}` : 'Code';
      const errorEntry: ConsoleLogEntry = {
        id: `err-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        text: `[SYNTAX ERROR - ${lineNum}] ${instToExec?.errorMessage || 'Invalid 8086 instruction'}`
      };
      set(state => ({
        logs: [...state.logs, errorEntry],
        currentInstruction: instToExec || null
      }));
      return;
    }

    soundFx.playCpuPulse();

    const { steps, updatedRegisters, updatedMemory, updatedFlags } = generateExecutionSteps(
      instToExec,
      get().registers,
      get().memory
    );

    const startEntry: ConsoleLogEntry = {
      id: `exec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'stage',
      text: `[Line ${instToExec.lineNumber || 1}] Instruction Loaded: '${instToExec.raw}' (${instToExec.addressingMode.type} Mode)`
    };

    set(state => ({
      currentInstruction: instToExec,
      executionSteps: steps,
      currentStepIndex: 0,
      isPlaying: true,
      isExecutionSuccess: false,
      activeReadingRegister: null,
      previousRegisters: { ...state.registers },
      registers: updatedRegisters,
      memory: updatedMemory,
      flags: updatedFlags,
      logs: [...state.logs, startEntry]
    }));

    soundFx.playRegisterPop();
  },

  stepNextInstruction: () => {
    const { program, programCounter } = get();
    if (programCounter < program.length) {
      const activeInst = program[programCounter];
      get().executeInstruction(activeInst.raw);

      // Advance program counter for next step
      const nextPC = (programCounter + 1) % Math.max(1, program.length);
      set({ programCounter: nextPC });
    }
  },

  stepForward: () => {
    const { currentStepIndex, executionSteps, logs, currentInstruction } = get();
    if (currentStepIndex < executionSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const step = executionSteps[nextIdx];

      soundFx.playKeyClick();
      if (step.stage === 4) soundFx.playAluBeep();
      if (step.stage === 9) soundFx.playMemoryAccess();

      let activeReg: RegisterName | ByteRegister | null = null;
      if (step.stage === 2) {
        activeReg = currentInstruction?.addressingMode.baseRegister || currentInstruction?.op1Reg || null;
      } else if (step.stage === 10) {
        activeReg = step.updatedRegister?.name || currentInstruction?.op1Reg || null;
      }

      const stepLog: ConsoleLogEntry = {
        id: `step-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        text: `[Stage ${step.stage}: ${step.stageName}] ${step.logMessage}`,
        stageId: step.stage
      };

      set({
        currentStepIndex: nextIdx,
        activeReadingRegister: activeReg,
        logs: [...logs, stepLog]
      });

      if (nextIdx === executionSteps.length - 1) {
        soundFx.playSuccess();
        set({ isPlaying: false, isExecutionSuccess: true, activeReadingRegister: null });
      }
    } else {
      set({ isPlaying: false, isExecutionSuccess: true, activeReadingRegister: null });
    }
  },

  stepBackward: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      soundFx.playKeyClick();
      set({ currentStepIndex: currentStepIndex - 1, isExecutionSuccess: false });
    }
  },

  togglePlay: () => {
    soundFx.playKeyClick();
    set(state => ({ isPlaying: !state.isPlaying }));
  },

  resetCpu: () => {
    soundFx.playKeyClick();
    const parsed = parseAssemblyProgram(get().rawCode);
    set({
      registers: { ...INITIAL_REGISTERS },
      previousRegisters: { ...INITIAL_REGISTERS },
      flags: { ...INITIAL_FLAGS },
      programCounter: 0,
      program: parsed.instructions,
      syntaxErrors: parsed.errors,
      currentInstruction: parsed.instructions[0] || null,
      currentStepIndex: -1,
      isPlaying: false,
      isExecutionSuccess: false,
      activeReadingRegister: null,
      logs: [
        {
          id: `reset-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'warn',
          text: 'CPU & IP Reset to default hardware initialization state.'
        }
      ]
    });
  },

  setSpeed: (speed: number) => {
    set({ playbackSpeed: speed });
  },

  setTheme: (theme: AppTheme) => {
    soundFx.playKeyClick();
    set({ theme });
  },

  toggleSound: () => {
    const muted = !get().soundMuted;
    soundFx.setMuted(muted);
    set({ soundMuted: muted });
  },

  dismissSplash: () => {
    try {
      soundFx.playSuccess();
    } catch (e) {
      console.warn('Audio play failed on splash dismiss:', e);
    }
    set({ showSplash: false });
  },

  setPracticeModalOpen: (open: boolean) => {
    soundFx.playKeyClick();
    set({ practiceModalOpen: open });
  },

  setQuizModalOpen: (open: boolean) => {
    soundFx.playKeyClick();
    set({ quizModalOpen: open });
  },

  addXP: (pts: number) => {
    soundFx.playSuccess();
    set(state => ({
      userXP: state.userXP + pts,
      streak: state.streak + 1
    }));
  },

  clearConsoleLogs: () => {
    soundFx.playKeyClick();
    set({ logs: [] });
  }
}));
