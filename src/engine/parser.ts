import {
  GeneralRegister,
  SegmentRegister,
  ByteRegister,
  ParsedInstruction,
  AddressingModeInfo,
  AddressingModeType
} from '../types/cpu';

const GENERAL_REGS: GeneralRegister[] = ['AX', 'BX', 'CX', 'DX', 'SP', 'BP', 'SI', 'DI'];
const BYTE_REGS: ByteRegister[] = ['AH', 'AL', 'BH', 'BL', 'CH', 'CL', 'DH', 'DL'];
const SEGMENT_REGS: SegmentRegister[] = ['CS', 'DS', 'SS', 'ES'];
const ALLOWED_BASE_REGS: GeneralRegister[] = ['BX', 'BP'];
const ALLOWED_INDEX_REGS: GeneralRegister[] = ['SI', 'DI'];

/**
 * Parses Hex (e.g., 20H, 0x20, 1000H) or Decimal string into integer
 */
export function parseNumber(numStr: string): number | null {
  const clean = numStr.trim().toUpperCase();
  if (!clean) return null;

  // Hex with H suffix (e.g. 20H, 1234H, 0FFFFH)
  if (clean.endsWith('H')) {
    const hexPart = clean.slice(0, -1);
    const parsed = parseInt(hexPart, 16);
    return isNaN(parsed) ? null : parsed;
  }
  // Hex with 0x prefix
  if (clean.startsWith('0X')) {
    const parsed = parseInt(clean.slice(2), 16);
    return isNaN(parsed) ? null : parsed;
  }
  // Decimal
  const parsedDec = parseInt(clean, 10);
  return isNaN(parsedDec) ? null : parsedDec;
}

/**
 * Format integer to 4-digit uppercase hex string (e.g. 2120H)
 */
export function toHex16(val: number): string {
  const u16 = (val & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return `${u16}H`;
}

export function toHex20(val: number): string {
  const u20 = (val & 0xfffff).toString(16).toUpperCase().padStart(5, '0');
  return `${u20}H`;
}

export function toBinary16(val: number): string {
  return (val & 0xffff).toString(2).padStart(16, '0').replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Analyzes memory bracket content e.g. "BX+SI+20H", "BP+10H", "1234H"
 */
function parseMemoryBracket(bracketContent: string): AddressingModeInfo | { error: string } {
  let content = bracketContent.trim();
  let defaultSegment: SegmentRegister = 'DS';

  // Check segment override e.g. ES:[BX]
  if (content.includes(':')) {
    const parts = content.split(':');
    const segStr = parts[0].trim().toUpperCase();
    if (SEGMENT_REGS.includes(segStr as SegmentRegister)) {
      defaultSegment = segStr as SegmentRegister;
    }
    content = parts[1].trim();
  }

  // Remove surrounding brackets if present
  if (content.startsWith('[') && content.endsWith(']')) {
    content = content.slice(1, -1).trim();
  }

  // Split by '+' or '-'
  const tokens = content.split(/\s*[\+\-]\s*/).map(t => t.trim().toUpperCase()).filter(Boolean);

  let baseReg: GeneralRegister | undefined;
  let indexReg: GeneralRegister | undefined;
  let displacement = 0;
  let foundDisplacement = false;

  for (const token of tokens) {
    // Check if token is a register
    if (GENERAL_REGS.includes(token as GeneralRegister)) {
      const reg = token as GeneralRegister;

      // 8086 Validation Check: Only BX, BP, SI, DI are allowed in memory addressing!
      if (![...ALLOWED_BASE_REGS, ...ALLOWED_INDEX_REGS].includes(reg)) {
        return {
          error: `Invalid 8086 memory addressing: ${reg} cannot be used inside brackets [...]. Only BX, BP, SI, DI are valid memory pointer registers in Intel 8086.`
        };
      }

      if (ALLOWED_BASE_REGS.includes(reg)) {
        if (baseReg) {
          return {
            error: `Invalid 8086 addressing mode: Cannot combine two base registers (${baseReg} + ${reg}). Intel 8086 allows only ONE base register (BX or BP).`
          };
        }
        baseReg = reg;
      } else if (ALLOWED_INDEX_REGS.includes(reg)) {
        if (indexReg) {
          return {
            error: `Invalid 8086 addressing mode: Cannot combine two index registers (${indexReg} + ${reg}). Intel 8086 allows only ONE index register (SI or DI).`
          };
        }
        indexReg = reg;
      }
    } else {
      // Numerical displacement
      const num = parseNumber(token);
      if (num === null) {
        return {
          error: `Unrecognized token '${token}' in memory address calculation.`
        };
      }
      displacement += num;
      foundDisplacement = true;
    }
  }

  // Segment default logic
  if (baseReg === 'BP' && !content.includes(':')) {
    defaultSegment = 'SS';
  }

  // Classify addressing mode
  let type: AddressingModeType = 'Unknown';
  let description = '';
  let formulaString = '';

  if (!baseReg && !indexReg && foundDisplacement) {
    type = 'Direct';
    description = `Direct Addressing: Address specified directly as ${toHex16(displacement)}`;
    formulaString = `EA = ${toHex16(displacement)}`;
  } else if (baseReg && !indexReg && !foundDisplacement) {
    type = 'Register Indirect';
    description = `Register Indirect: Pointer contained in register ${baseReg}`;
    formulaString = `EA = [${baseReg}]`;
  } else if (!baseReg && indexReg && !foundDisplacement) {
    type = 'Register Indirect';
    description = `Register Indirect: Pointer contained in index register ${indexReg}`;
    formulaString = `EA = [${indexReg}]`;
  } else if (baseReg && !indexReg && foundDisplacement) {
    type = 'Based';
    description = `Based Addressing: Base register ${baseReg} + displacement ${toHex16(displacement)}`;
    formulaString = `EA = [${baseReg} + ${toHex16(displacement)}]`;
  } else if (!baseReg && indexReg && foundDisplacement) {
    type = 'Indexed';
    description = `Indexed Addressing: Index register ${indexReg} + displacement ${toHex16(displacement)}`;
    formulaString = `EA = [${indexReg} + ${toHex16(displacement)}]`;
  } else if (baseReg && indexReg && !foundDisplacement) {
    type = 'Based-Indexed';
    description = `Based-Indexed Addressing: Base ${baseReg} + Index ${indexReg}`;
    formulaString = `EA = [${baseReg} + ${indexReg}]`;
  } else if (baseReg && indexReg && foundDisplacement) {
    type = 'Based-Indexed with Displacement';
    description = `Based-Indexed with Displacement: Base ${baseReg} + Index ${indexReg} + Displacement ${toHex16(displacement)}`;
    formulaString = `EA = [${baseReg} + ${indexReg} + ${toHex16(displacement)}]`;
  }

  return {
    type,
    baseRegister: baseReg,
    indexRegister: indexReg,
    displacement: foundDisplacement ? displacement : 0,
    displacementHex: foundDisplacement ? toHex16(displacement) : undefined,
    defaultSegment,
    isMemoryAccess: true,
    description,
    formulaString
  };
}

/**
 * Main 8086 Assembly Parser
 */
export function parseAssemblyLine(input: string): ParsedInstruction {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      raw: input,
      mnemonic: 'NOP',
      addressingMode: {
        type: 'Unknown',
        defaultSegment: 'DS',
        isMemoryAccess: false,
        description: 'No instruction'
      },
      isValid: false,
      errorMessage: 'Empty instruction',
      estimatedClockCycles: 0
    };
  }

  // Remove trailing comments (e.g. ; comment)
  const codeWithoutComment = trimmed.split(';')[0].trim();
  const match = codeWithoutComment.match(/^([A-Za-z]+)(?:\s+(.+))?$/);

  if (!match) {
    return {
      raw: input,
      mnemonic: 'NOP',
      addressingMode: {
        type: 'Unknown',
        defaultSegment: 'DS',
        isMemoryAccess: false,
        description: 'Syntax Error'
      },
      isValid: false,
      errorMessage: 'Invalid assembly syntax format.',
      estimatedClockCycles: 0
    };
  }

  const mnemonic = match[1].toUpperCase() as ParsedInstruction['mnemonic'];
  const operandsStr = match[2] ? match[2].trim() : '';

  const validMnemonics = ['MOV', 'ADD', 'SUB', 'INC', 'DEC', 'AND', 'OR', 'XOR', 'LEA', 'CMP', 'NOP', 'JMP'];
  if (!validMnemonics.includes(mnemonic)) {
    return {
      raw: input,
      mnemonic: 'NOP',
      addressingMode: {
        type: 'Unknown',
        defaultSegment: 'DS',
        isMemoryAccess: false,
        description: 'Unsupported opcode'
      },
      isValid: false,
      errorMessage: `Unsupported 8086 mnemonic '${mnemonic}'. Supported opcodes: ${validMnemonics.join(', ')}`,
      estimatedClockCycles: 0
    };
  }

  if (mnemonic === 'NOP') {
    return {
      raw: input,
      mnemonic: 'NOP',
      addressingMode: {
        type: 'Register',
        defaultSegment: 'DS',
        isMemoryAccess: false,
        description: 'No Operation'
      },
      isValid: true,
      opcodeHex: '90H',
      estimatedClockCycles: 3
    };
  }

  // Split operands by comma (if present)
  let op1 = '';
  let op2 = '';

  if (operandsStr.includes(',')) {
    const parts = operandsStr.split(',');
    op1 = parts[0].trim();
    op2 = parts[1].trim();
  } else {
    op1 = operandsStr.trim();
  }

  // Determine if operands are memory brackets or registers/immediates
  let modeInfo: AddressingModeInfo = {
    type: 'Unknown',
    defaultSegment: 'DS',
    isMemoryAccess: false,
    description: ''
  };

  const isOp1Mem = op1.startsWith('[') && op1.endsWith(']');
  const isOp2Mem = op2.startsWith('[') && op2.endsWith(']');

  // Intel 8086 Rule: Memory-to-memory operations (e.g. MOV [BX], [SI]) are NOT supported!
  if (isOp1Mem && isOp2Mem) {
    return {
      raw: input,
      mnemonic,
      op1,
      op2,
      addressingMode: modeInfo,
      isValid: false,
      errorMessage: 'Intel 8086 Architecture Constraint: Memory-to-Memory transfers are illegal. Use a register as an intermediate buffer.',
      estimatedClockCycles: 0
    };
  }

  if (isOp1Mem || isOp2Mem) {
    const memStr = isOp1Mem ? op1 : op2;
    const res = parseMemoryBracket(memStr);

    if ('error' in res) {
      return {
        raw: input,
        mnemonic,
        op1,
        op2,
        addressingMode: modeInfo,
        isValid: false,
        errorMessage: res.error,
        estimatedClockCycles: 0
      };
    }
    modeInfo = res;
  } else {
    // Non-memory operand analysis
    const isOp1Reg = GENERAL_REGS.includes(op1.toUpperCase() as GeneralRegister) || BYTE_REGS.includes(op1.toUpperCase() as ByteRegister) || SEGMENT_REGS.includes(op1.toUpperCase() as SegmentRegister);
    const isOp2Reg = GENERAL_REGS.includes(op2.toUpperCase() as GeneralRegister) || BYTE_REGS.includes(op2.toUpperCase() as ByteRegister) || SEGMENT_REGS.includes(op2.toUpperCase() as SegmentRegister);

    if (isOp1Reg && isOp2Reg) {
      modeInfo = {
        type: 'Register',
        defaultSegment: 'DS',
        isMemoryAccess: false,
        description: 'Register Addressing: Operation performed directly between CPU registers',
        formulaString: `${op1} <- ${op2}`
      };
    } else if (op2 && parseNumber(op2) !== null) {
      modeInfo = {
        type: 'Immediate',
        defaultSegment: 'DS',
        isMemoryAccess: false,
        description: 'Immediate Addressing: Constant numerical value loaded into register',
        formulaString: `${op1} <- ${toHex16(parseNumber(op2)!)}`
      };
    } else if (!op2 && isOp1Reg) {
      modeInfo = {
        type: 'Register',
        defaultSegment: 'DS',
        isMemoryAccess: false,
        description: 'Register Addressing: Single-operand operation on register',
        formulaString: `${op1}`
      };
    }
  }

  // Calculate estimated clock cycles based on Addressing Mode
  let cycles = 2;
  switch (modeInfo.type) {
    case 'Immediate': cycles = 4; break;
    case 'Register': cycles = 2; break;
    case 'Direct': cycles = 6; break;
    case 'Register Indirect': cycles = 5; break;
    case 'Based': cycles = 8; break;
    case 'Indexed': cycles = 8; break;
    case 'Based-Indexed': cycles = 9; break;
    case 'Based-Indexed with Displacement': cycles = 12; break;
  }

  const op1Upper = op1.toUpperCase();
  const op2Upper = op2.toUpperCase();

  const op1IsReg = GENERAL_REGS.includes(op1Upper as GeneralRegister) || BYTE_REGS.includes(op1Upper as ByteRegister);
  const op2IsReg = GENERAL_REGS.includes(op2Upper as GeneralRegister) || BYTE_REGS.includes(op2Upper as ByteRegister);

  return {
    raw: input,
    mnemonic,
    op1,
    op2,
    op1IsReg,
    op1Reg: op1IsReg ? (op1Upper as GeneralRegister | ByteRegister) : undefined,
    op2IsReg,
    op2Reg: op2IsReg ? (op2Upper as GeneralRegister | ByteRegister) : undefined,
    addressingMode: modeInfo,
    isValid: true,
    opcodeHex: `${(mnemonic.charCodeAt(0) % 16 + 8).toString(16).toUpperCase()}8H`,
    estimatedClockCycles: cycles
  };
}

/**
 * Parses a multi-line 8086 Assembly Program text line-by-line
 */
export function parseAssemblyProgram(programText: string): {
  instructions: ParsedInstruction[];
  errors: { lineNumber: number; message: string }[];
} {
  const lines = programText.split('\n');
  const instructions: ParsedInstruction[] = [];
  const errors: { lineNumber: number; message: string }[] = [];

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    // Ignore empty lines and comment lines starting with ';'
    if (!trimmed || trimmed.startsWith(';')) {
      return;
    }

    const parsed = parseAssemblyLine(trimmed);
    parsed.lineNumber = lineNum;
    parsed.lineContent = lineText;

    instructions.push(parsed);

    if (!parsed.isValid && parsed.errorMessage) {
      errors.push({
        lineNumber: lineNum,
        message: parsed.errorMessage
      });
    }
  });

  return { instructions, errors };
}
