export type GeneralRegister = 'AX' | 'BX' | 'CX' | 'DX' | 'SP' | 'BP' | 'SI' | 'DI';
export type SegmentRegister = 'CS' | 'DS' | 'SS' | 'ES';
export type RegisterName = GeneralRegister | SegmentRegister | 'IP';

export type ByteRegister = 'AH' | 'AL' | 'BH' | 'BL' | 'CH' | 'CL' | 'DH' | 'DL';

export interface CpuFlags {
  CF: boolean; // Carry Flag
  PF: boolean; // Parity Flag
  AF: boolean; // Auxiliary Carry Flag
  ZF: boolean; // Zero Flag
  SF: boolean; // Sign Flag
  TF: boolean; // Trap Flag
  IF: boolean; // Interrupt Flag
  DF: boolean; // Direction Flag
  OF: boolean; // Overflow Flag
}

export type AddressingModeType =
  | 'Immediate'
  | 'Register'
  | 'Direct'
  | 'Register Indirect'
  | 'Based'
  | 'Indexed'
  | 'Based-Indexed'
  | 'Based-Indexed with Displacement'
  | 'Unknown';

export interface AddressingModeInfo {
  type: AddressingModeType;
  baseRegister?: GeneralRegister;
  indexRegister?: GeneralRegister;
  displacement?: number; // In decimal
  displacementHex?: string;
  defaultSegment: SegmentRegister;
  isMemoryAccess: boolean;
  description: string;
  formulaString?: string;
}

export interface ParsedInstruction {
  raw: string;
  lineNumber?: number;
  lineContent?: string;
  mnemonic: 'MOV' | 'ADD' | 'SUB' | 'INC' | 'DEC' | 'AND' | 'OR' | 'XOR' | 'LEA' | 'CMP' | 'NOP' | 'JMP';
  op1?: string;
  op2?: string;
  op1IsReg?: boolean;
  op1Reg?: RegisterName | ByteRegister;
  op2IsReg?: boolean;
  op2Reg?: RegisterName | ByteRegister;
  addressingMode: AddressingModeInfo;
  isValid: boolean;
  errorMessage?: string;
  opcodeHex?: string;
  estimatedClockCycles: number;
}

export type PipelineStageIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface PipelineStage {
  id: PipelineStageIndex;
  name: string;
  description: string;
  status: 'idle' | 'active' | 'completed';
}

export interface AddressCalculationDetails {
  baseRegName?: GeneralRegister;
  baseVal?: number;
  indexRegName?: GeneralRegister;
  indexVal?: number;
  displacementVal?: number;
  effectiveAddress: number; // Offset EA
  effectiveAddressHex: string;
  segmentRegName: SegmentRegister;
  segmentVal: number;
  segmentValHex: string;
  shiftedSegmentVal: number; // Segment * 16
  shiftedSegmentHex: string;
  physicalAddress: number;
  physicalAddressHex: string;
  formulaString?: string;
}

export interface AluOperationDetails {
  operator: string;
  operand1: number;
  operand2?: number;
  result: number;
  operand1Hex: string;
  operand2Hex?: string;
  resultHex: string;
}

export interface ExecutionStepResult {
  stage: PipelineStageIndex;
  stageName: string;
  logMessage: string;
  addressCalc?: AddressCalculationDetails;
  aluDetails?: AluOperationDetails;
  accessedMemoryAddress?: number;
  accessedMemoryValue?: number;
  updatedRegister?: {
    name: RegisterName | ByteRegister;
    oldVal: number;
    newVal: number;
  };
  busActivity?: {
    addressBusHex?: string;
    dataBusHex?: string;
    controlSignal?: 'READ' | 'WRITE' | 'NONE';
  };
}

export interface ConsoleLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'stage';
  text: string;
  stageId?: number;
}

export type AppTheme = 'intel' | 'cyberpunk' | 'dos' | 'matrix' | 'light';

export interface PracticeQuestion {
  id: string;
  title: string;
  instruction: string;
  registerState: Partial<Record<GeneralRegister | SegmentRegister, number>>;
  questionText: string;
  expectedEA: number;
  expectedPA: number;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
