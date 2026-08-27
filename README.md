# 🚀 8086 Visual CPU Simulator & Execution Engine

An interactive, high-performance, educational Intel 8086 microprocessor simulator built with React 18, TypeScript, Tailwind CSS, Framer Motion, and Web Audio API.

![Theme](https://img.shields.io/badge/Theme-Intel%20Cyberpunk-00f0ff)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

---

## ✨ Features

- **⚡ Cyberpunk Intel Dashboard & Motherboard Canvas**: 60 FPS HTML5 Canvas background rendering glowing PCB circuit traces, electric nodes, floating hex particles, and matrix rain.
- **💻 Central 8086 CPU Die & Pop-Out Holographic Registers**: Interactive CPU chip die with live status tracking. Operand registers (`AX`, `BX`, `CX`, `DX`, `SI`, `DI`, `BP`, `SP`) physically pop out as holographic glass cards during execution with 16-bit binary bit-flip highlighting.
- **🧩 8086 Assembly Parser & Addressing Mode Engine**:
  - Parsed instructions: `MOV`, `ADD`, `SUB`, `INC`, `DEC`, `AND`, `OR`, `XOR`, `LEA`, `CMP`, `NOP`, `JMP`.
  - Addressing modes supported: Immediate, Register, Direct, Register Indirect, Based, Indexed, Based-Indexed, and Based-Indexed with Displacement.
  - **Strict Architecture Validation**: Highlights illegal 8086 addressing combinations (e.g. `AX` inside memory brackets `[...]` returns line-specific architectural diagnostics).
- **🔄 Multi-Line Assembly Program & IP Stepping**:
  - Supports multi-line assembly programs, ignoring blank lines and comments.
  - **`RUN PROGRAM`**: Sequentially executes instructions line-by-line.
  - **`STEP INSTRUCTION`**: Points to the active instruction via the Instruction Pointer (`IP`) and highlights the active line in the code editor.
  - **Line-Specific Syntax Errors**: Highlights syntax errors on their specific line numbers without rejecting valid lines.
- **📊 Step-by-Step ALU & EA/PA Calculation Cards**:
  - Floating number cards moving into the ALU core.
  - Step-by-step Effective Address (`EA = Base + Index + Disp`) and 20-bit Physical Address (`PA = Segment * 16 + EA`) calculation cards.
- **💾 1MB System RAM & Animated Buses**:
  - Interactive 1MB memory visualizer.
  - Continuous particle streams on Address Bus (Cyan), Data Bus (Emerald), and Control Bus (Orange).
- **🎮 Educational Practice & Quiz Modes**:
  - Interactive EA/PA calculation practice problems.
  - Timed 8086 Computer Organization & Architecture (COA) quiz with XP points, streak counters, and achievements.
- **🔊 Web Audio Synthesizer**: Procedural sci-fi sound effects for CPU pulses, register pops, ALU chimes, and memory access with top-bar mute controls.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons + Framer Motion
- **State Management**: Zustand
- **Audio Engine**: Web Audio API Procedural Synthesizer
- **Canvas Rendering**: HTML5 2D Context (60 FPS)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/8086-visual-cpu-simulator.git
cd 8086-visual-cpu-simulator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 📜 License

MIT License © 2026
