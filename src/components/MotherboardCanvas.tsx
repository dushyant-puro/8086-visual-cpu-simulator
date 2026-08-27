import React, { useEffect, useRef } from 'react';
import { useCpuStore } from '../store/useCpuStore';

export const MotherboardCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useCpuStore(state => state.theme);
  const isPlaying = useCpuStore(state => state.isPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Color theme mapping
    let primaryColor = 'rgba(0, 240, 255, 0.4)';
    let hexColor = 'rgba(0, 240, 255, 0.25)';
    let nodeColor = '#00f0ff';

    if (theme === 'dos' || theme === 'matrix') {
      primaryColor = 'rgba(0, 255, 100, 0.4)';
      hexColor = 'rgba(0, 255, 100, 0.25)';
      nodeColor = '#00ff66';
    } else if (theme === 'cyberpunk') {
      primaryColor = 'rgba(255, 0, 127, 0.4)';
      hexColor = 'rgba(255, 0, 127, 0.25)';
      nodeColor = '#ff007f';
    }

    const traceCount = 22;
    const particlesCount = 40;

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }

    interface FloatingHex {
      x: number;
      y: number;
      text: string;
      speedY: number;
      alpha: number;
    }

    const nodes: Node[] = Array.from({ length: particlesCount }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.6 + 0.2
    }));

    const hexStrings = ['32120H', '0045H', '2120H', '1000H', '00F0H', '3000H', '4000H', '90H'];
    const floatingHexes: FloatingHex[] = Array.from({ length: 15 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      text: hexStrings[Math.floor(Math.random() * hexStrings.length)],
      speedY: - (Math.random() * 0.4 + 0.1),
      alpha: Math.random() * 0.3 + 0.1
    }));

    const pcbLines = Array.from({ length: traceCount }).map(() => {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      const midX = startX + (Math.random() > 0.5 ? 100 : -100);
      const midY = startY + (Math.random() > 0.5 ? 100 : -100);
      const endX = midX + (Math.random() > 0.5 ? 150 : -150);
      const endY = midY;

      return {
        startX, startY, midX, midY, endX, endY,
        pulseOffset: Math.random() * 100
      };
    });

    let pulseTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Grid lines
      const gridSize = 40;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. Floating Hex Values
      ctx.font = '10px "JetBrains Mono", monospace';
      floatingHexes.forEach(h => {
        h.y += h.speedY * (isPlaying ? 2 : 1);
        if (h.y < -20) {
          h.y = canvas.height + 20;
          h.x = Math.random() * canvas.width;
        }
        ctx.fillStyle = hexColor;
        ctx.globalAlpha = h.alpha;
        ctx.fillText(h.text, h.x, h.y);
      });
      ctx.globalAlpha = 1.0;

      // 3. PCB Traces
      pulseTime += isPlaying ? 0.05 : 0.015;

      pcbLines.forEach(line => {
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(line.startX, line.startY);
        ctx.lineTo(line.midX, line.midY);
        ctx.lineTo(line.endX, line.endY);
        ctx.stroke();

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(line.startX, line.startY, 2.5, 0, Math.PI * 2);
        ctx.arc(line.endX, line.endY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        const progress = ((pulseTime + line.pulseOffset) % 100) / 100;
        let px = line.startX;
        let py = line.startY;

        if (progress < 0.5) {
          const t = progress * 2;
          px = line.startX + (line.midX - line.startX) * t;
          py = line.startY + (line.midY - line.startY) * t;
        } else {
          const t = (progress - 0.5) * 2;
          px = line.midX + (line.endX - line.midX) * t;
          py = line.midY + (line.endY - line.midY) * t;
        }

        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 4. Floating particles
      nodes.forEach(node => {
        node.x += node.vx * (isPlaying ? 2 : 1);
        node.y += node.vy * (isPlaying ? 2 : 1);

        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        ctx.fillStyle = nodeColor;
        ctx.globalAlpha = node.alpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
    />
  );
};
