import {
  GeneralRegister,
  SegmentRegister,
  RegisterName,
  ByteRegister,
  CpuFlags,
  ParsedInstruction,
  ExecutionStepResult,
  AddressCalculationDetails,
  AluOperationDetails
} from '../types/cpu';
import { parseNumber, toHex16, toHex20 } from './parser';

export type RegisterState = Record<GeneralRegister | SegmentRegister | 'IP', number>;

export const INITIAL_REGISTERS: RegisterState = {
  AX: 0x1234,
  BX: 0x2000,
  CX: 0x000A,
  DX: 0x0050,
  SP: 0xFFFE,
  BP: 0x1000,
  SI: 0x0100,
  DI: 0x0200,
  CS: 0x1000,
  DS: 0x3000,
  SS: 0x4000,
  ES: 0x5000,
  IP: 0x0100
};

export const INITIAL_FLAGS: CpuFlags = {
  CF: false,
  PF: false,
  AF: false,
  ZF: false,
  SF: false,
  TF: false,
  IF: true,
  DF: false,
  OF: false
};

/**
 * Get 16-bit register or 8-bit high/low byte register value
 */
export function getRegisterValue(regs: RegisterState, name: RegisterName | ByteRegister): number {
  if (name in regs) {
    return regs[name as RegisterName];
  }
  // Byte register handle
  const parent = `${name[0]}X` as GeneralRegister;
  const parentVal = regs[parent] || 0;
  if (name[1] === 'H') {
    return (parentVal >> 8) & 0xff;
  } else {
    return parentVal & 0xff;
  }
}

/**
 * Update register value (16-bit word or 8-bit byte)
 */
export function setRegisterValue(
  regs: RegisterState,
  name: RegisterName | ByteRegister,
  val: number
): RegisterState {
  const newRegs = { ...regs };
  if (name in newRegs) {
    newRegs[name as RegisterName] = val & 0xffff;
    return newRegs;
  }

  // Byte register write
  const parent = `${name[0]}X` as GeneralRegister;
  const current16 = newRegs[parent] || 0;
  if (name[1] === 'H') {
    const lowByte = current16 & 0xff;
    const newHigh = (val & 0xff) << 8;
    newRegs[parent] = newHigh | lowByte;
  } else {
    const highByte = current16 & 0xff00;
    const newLow = val & 0xff;
    newRegs[parent] = highByte | newLow;
  }
  return newRegs;
}

/**
 * Generate 10-stage execution pipeline trace for an instruction
 */
export function generateExecutionSteps(
  instruction: ParsedInstruction,
  registers: RegisterState,
  memory: Uint8Array
): { steps: ExecutionStepResult[]; updatedRegisters: RegisterState; updatedMemory: Uint8Array; updatedFlags: CpuFlags } {
  const steps: ExecutionStepResult[] = [];
  let currentRegs = { ...registers };
  let currentMemory = new Uint8Array(memory);
  let flags = { ...INITIAL_FLAGS };

  const mode = instruction.addressingMode;
  const mnemonic = instruction.mnemonic;

  // Stage 0: Fetch
  steps.push({
    stage: 0,
    stageName: 'Instruction Fetch',
    logMessage: `Fetching instruction '${instruction.raw}' from CS:IP [${toHex16(currentRegs.CS)}:${toHex16(currentRegs.IP)}] via Address Bus.`,
    busActivity: {
      addressBusHex: toHex20((currentRegs.CS * 16) + currentRegs.IP),
      dataBusHex: instruction.opcodeHex || '90H',
      controlSignal: 'READ'
    }
  });

  // Stage 1: Decode
  steps.push({
    stage: 1,
    stageName: 'Instruction Decode',
    logMessage: `Decoded Opcode ${instruction.opcodeHex || '90H'}: Mnemonic=${mnemonic}, Mode='${mode.type}'.`
  });

  // Stage 2: Register Read
  let regLogs: string[] = [];
  if (mode.baseRegister) {
    regLogs.push(`Read Base Reg ${mode.baseRegister} = ${toHex16(currentRegs[mode.baseRegister])}`);
  }
  if (mode.indexRegister) {
    regLogs.push(`Read Index Reg ${mode.indexRegister} = ${toHex16(currentRegs[mode.indexRegister])}`);
  }
  if (instruction.op1IsReg && instruction.op1Reg) {
    regLogs.push(`Read Dest Reg ${instruction.op1Reg} = ${toHex16(getRegisterValue(currentRegs, instruction.op1Reg))}`);
  }
  if (instruction.op2IsReg && instruction.op2Reg) {
    regLogs.push(`Read Src Reg ${instruction.op2Reg} = ${toHex16(getRegisterValue(currentRegs, instruction.op2Reg))}`);
  }

  steps.push({
    stage: 2,
    stageName: 'Register Read',
    logMessage: regLogs.length > 0 ? regLogs.join(' | ') : 'No register read required.'
  });

  // Stage 3: Operand Fetch
  let opVal = 0;
  if (instruction.op2 && parseNumber(instruction.op2) !== null) {
    opVal = parseNumber(instruction.op2)!;
  } else if (instruction.op2IsReg && instruction.op2Reg) {
    opVal = getRegisterValue(currentRegs, instruction.op2Reg);
  }

  steps.push({
    stage: 3,
    stageName: 'Operand Fetch',
    logMessage: `Fetched operand value: ${toHex16(opVal)} (${opVal} Dec).`
  });

  // Stage 4: ALU Compute (for arithmetic/bitwise instructions)
  let aluDetails: AluOperationDetails | undefined;
  if (['ADD', 'SUB', 'AND', 'OR', 'XOR', 'CMP', 'INC', 'DEC'].includes(mnemonic)) {
    const destVal = instruction.op1Reg ? getRegisterValue(currentRegs, instruction.op1Reg) : 0;
    let res = 0;

    switch (mnemonic) {
      case 'ADD': res = (destVal + opVal) & 0xffff; break;
      case 'SUB':
      case 'CMP': res = (destVal - opVal + 0x10000) & 0xffff; break;
      case 'AND': res = destVal & opVal; break;
      case 'OR': res = destVal | opVal; break;
      case 'XOR': res = destVal ^ opVal; break;
      case 'INC': res = (destVal + 1) & 0xffff; break;
      case 'DEC': res = (destVal - 1 + 0x10000) & 0xffff; break;
    }

    // Flags computation
    flags.ZF = res === 0;
    flags.SF = (res & 0x8000) !== 0;
    flags.CF = (mnemonic === 'ADD' && (destVal + opVal) > 0xffff) || (mnemonic === 'SUB' && destVal < opVal);

    aluDetails = {
      operator: mnemonic,
      operand1: destVal,
      operand2: mnemonic === 'INC' || mnemonic === 'DEC' ? 1 : opVal,
      result: res,
      operand1Hex: toHex16(destVal),
      operand2Hex: toHex16(mnemonic === 'INC' || mnemonic === 'DEC' ? 1 : opVal),
      resultHex: toHex16(res)
    };
  }

  steps.push({
    stage: 4,
    stageName: 'ALU Compute',
    logMessage: aluDetails ? `ALU Executed ${aluDetails.operator}: ${aluDetails.operand1Hex} ${aluDetails.operator} ${aluDetails.operand2Hex || ''} => ${aluDetails.resultHex}` : 'ALU bypassed for direct data transfer.',
    aluDetails
  });

  // Stage 5: Effective Address Calculation
  let addressCalc: AddressCalculationDetails | undefined;
  let ea = 0;

  if (mode.isMemoryAccess) {
    const baseVal = mode.baseRegister ? currentRegs[mode.baseRegister] : 0;
    const indexVal = mode.indexRegister ? currentRegs[mode.indexRegister] : 0;
    const dispVal = mode.displacement || 0;

    ea = (baseVal + indexVal + dispVal) & 0xffff;
    const segName = mode.defaultSegment;
    const segVal = currentRegs[segName];
    const shiftedSeg = segVal * 16;
    const pa = shiftedSeg + ea;

    addressCalc = {
      baseRegName: mode.baseRegister,
      baseVal: mode.baseRegister ? baseVal : undefined,
      indexRegName: mode.indexRegister,
      indexVal: mode.indexRegister ? indexVal : undefined,
      displacementVal: dispVal,
      effectiveAddress: ea,
      effectiveAddressHex: toHex16(ea),
      segmentRegName: segName,
      segmentVal: segVal,
      segmentValHex: toHex16(segVal),
      shiftedSegmentVal: shiftedSeg,
      shiftedSegmentHex: toHex20(shiftedSeg),
      physicalAddress: pa,
      physicalAddressHex: toHex20(pa),
      formulaString: mode.formulaString
    };
  }

  steps.push({
    stage: 5,
    stageName: 'Effective Address Calc',
    logMessage: addressCalc ? `Computed EA = ${addressCalc.effectiveAddressHex} (${addressCalc.formulaString || mode.description}).` : 'No Effective Address calculation required (Register/Immediate mode).',
    addressCalc
  });

  // Stage 6: Segment Shift (Segment * 16)
  steps.push({
    stage: 6,
    stageName: 'Segment Shift (x16)',
    logMessage: addressCalc ? `Segment Register ${addressCalc.segmentRegName} = ${addressCalc.segmentValHex} shifted left 4 bits (x16) => ${addressCalc.shiftedSegmentHex}.` : 'Segment shift bypassed.',
    addressCalc
  });

  // Stage 7: Physical Address Calculation (PA = Segment*16 + EA)
  steps.push({
    stage: 7,
    stageName: 'Physical Address Calc',
    logMessage: addressCalc ? `Physical Address PA = Shifted Segment (${addressCalc.shiftedSegmentHex}) + EA (${addressCalc.effectiveAddressHex}) => ${addressCalc.physicalAddressHex}.` : 'Physical Address calculation bypassed.',
    addressCalc
  });

  // Stage 8: Bus Transmission
  steps.push({
    stage: 8,
    stageName: 'Bus Transmission',
    logMessage: addressCalc ? `Address Bus illuminated: Transmitting ${addressCalc.physicalAddressHex} to RAM controller.` : 'Bus idle.',
    busActivity: {
      addressBusHex: addressCalc?.physicalAddressHex,
      dataBusHex: '0045H',
      controlSignal: mode.isMemoryAccess ? 'READ' : 'NONE'
    }
  });

  // Stage 9: Memory Access
  let memoryVal = 0x45; // Default memory value for simulation
  if (addressCalc) {
    // Read low and high byte from memory array
    const addr = addressCalc.physicalAddress % memory.length;
    memoryVal = (memory[addr] | (memory[(addr + 1) % memory.length] << 8)) || 0x45;
  }

  steps.push({
    stage: 9,
    stageName: 'Memory Access',
    logMessage: addressCalc ? `Accessed 16-bit RAM cell at ${addressCalc.physicalAddressHex}: Read value ${toHex16(memoryVal)} via Data Bus.` : 'No RAM access required.',
    accessedMemoryAddress: addressCalc?.physicalAddress,
    accessedMemoryValue: memoryVal
  });

  // Stage 10: Register Writeback & Final State Update
  if (instruction.op1Reg && instruction.mnemonic !== 'CMP') {
    const oldVal = getRegisterValue(currentRegs, instruction.op1Reg);
    let newVal = oldVal;

    if (mnemonic === 'MOV') {
      newVal = mode.isMemoryAccess ? memoryVal : opVal;
    } else if (mnemonic === 'LEA' && addressCalc) {
      newVal = addressCalc.effectiveAddress;
    } else if (aluDetails) {
      newVal = aluDetails.result;
    }

    currentRegs = setRegisterValue(currentRegs, instruction.op1Reg, newVal);

    steps.push({
      stage: 10,
      stageName: 'Register Writeback',
      logMessage: `Updated Destination Register ${instruction.op1Reg}: ${toHex16(oldVal)} => ${toHex16(newVal)}. IP updated to ${toHex16(currentRegs.IP + 2)}.`,
      updatedRegister: {
        name: instruction.op1Reg,
        oldVal,
        newVal
      }
    });
  } else {
    steps.push({
      stage: 10,
      stageName: 'Execution Complete',
      logMessage: `Execution completed. Flags updated (ZF=${flags.ZF ? 1 : 0}, SF=${flags.SF ? 1 : 0}, CF=${flags.CF ? 1 : 0}).`
    });
  }

  currentRegs.IP = (currentRegs.IP + 2) & 0xffff;

  return {
    steps,
    updatedRegisters: currentRegs,
    updatedMemory: currentMemory,
    updatedFlags: flags
  };
}
