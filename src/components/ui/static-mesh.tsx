'use client';

import { useEffect, useRef } from 'react';

interface Props {
  cols?: number;
  rows?: number;
  opacity?: number;
  lineColor?: string;
  waveAmp?: number;
  waveT?: number;
  diagonals?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function StaticMesh({
  cols = 20,
  rows = 16,
  opacity = 0.22,
  lineColor = '255,255,255',
  waveAmp = 70,
  waveT = 1.4,
  diagonals = true,
  style,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw exactly once after layout settles
    const rafId = requestAnimationFrame(() => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (!W || !H) return;

      // Set pixel dimensions without triggering observer
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);

      const GRID_X   = W * 1.5;
      const GRID_Z   = H * 2.0;
      const CAM_Y    = H * 0.6;
      const CAM_BACK = H * 0.55;
      const FOCAL    = H * 0.95;

      function wave(c: number, r: number): number {
        const u = c / (cols - 1);
        const v = r / (rows - 1);
        const a  = Math.sin(u * 5.5 + v * 3.2 + waveT);
        const b  = Math.sin(u * 2.8 - v * 4.8 + waveT * 0.85) * 0.5;
        const cc = Math.sin(v * 4.2 + waveT * 0.55) * 0.32;
        return ((a + b + cc) / 1.82) * waveAmp;
      }

      const theta = Math.atan2(CAM_Y, CAM_BACK);
      const cosT  = Math.cos(theta);
      const sinT  = Math.sin(theta);

      function project(wx: number, wy: number, wz: number): [number, number, number] {
        const tx = wx;
        const ty = wy - CAM_Y;
        const tz = wz + CAM_BACK;
        const cy =  ty * cosT + tz * sinT;
        const cz = -ty * sinT + tz * cosT;
        if (cz <= 0.1) return [0, 0, -1];
        const sx = (tx / cz) * FOCAL + W * 0.5;
        const sy = (-cy / cz) * FOCAL + H * 0.52;
        return [sx, sy, cz];
      }

      // Build point grid
      const pts: [number, number, number][][] = [];
      const ht: number[][] = [];
      for (let r = 0; r < rows; r++) {
        pts.push([]);
        ht.push([]);
        const wz = ((r / (rows - 1)) - 0.5) * GRID_Z;
        for (let c = 0; c < cols; c++) {
          const wx = ((c / (cols - 1)) - 0.5) * GRID_X;
          const wy = wave(c, r);
          ht[r].push(wy);
          pts[r].push(project(wx, wy, wz));
        }
      }

      const line = (x1: number, y1: number, x2: number, y2: number, a: number) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${lineColor},${Math.min(a, 1).toFixed(3)})`;
        ctx.stroke();
      };

      ctx.lineWidth = 0.75;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const [x1, y1, d1] = pts[r][c];
          const [x2, y2, d2] = pts[r][c + 1];
          if (d1 <= 0 || d2 <= 0) continue;
          const b = ((ht[r][c] + ht[r][c + 1]) * 0.5 / waveAmp + 1) * 0.5;
          line(x1, y1, x2, y2, 0.18 + b * 0.52);
        }
      }

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 1; r++) {
          const [x1, y1, d1] = pts[r][c];
          const [x2, y2, d2] = pts[r + 1][c];
          if (d1 <= 0 || d2 <= 0) continue;
          const b = ((ht[r][c] + ht[r + 1][c]) * 0.5 / waveAmp + 1) * 0.5;
          line(x1, y1, x2, y2, 0.18 + b * 0.52);
        }
      }

      if (diagonals) {
        ctx.lineWidth = 0.45;
        for (let r = 0; r < rows - 1; r++) {
          for (let c = 0; c < cols - 1; c++) {
            const [x1, y1, d1] = pts[r][c];
            const [x2, y2, d2] = pts[r + 1][c + 1];
            if (d1 <= 0 || d2 <= 0) continue;
            const b = ((ht[r][c] + ht[r + 1][c + 1]) * 0.5 / waveAmp + 1) * 0.5;
            line(x1, y1, x2, y2, 0.10 + b * 0.28);
          }
        }
      }
    });

    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: 'block', pointerEvents: 'none', opacity, ...style }}
    />
  );
}
