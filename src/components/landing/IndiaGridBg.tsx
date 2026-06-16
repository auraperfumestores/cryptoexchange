'use client';

import { useEffect, useRef } from 'react';

/*
  Animated 3D wave mesh — Indian tricolour edition.
  Line colour is determined by horizontal column position:
    left third  → Saffron  #FF9933
    middle third → White   #FFFFFF
    right third  → Green   #138808
  The canvas covers the left side of its parent; a CSS mask
  fades it from fully opaque on the left to transparent on the right.
*/

const COLS = 30;
const ROWS = 22;
const GRID_X  = 1400;
const GRID_Z  = 1100;
const WAVE_AMP   = 90;
const WAVE_SPEED = 0.18;
const CAM_Y     = 340;
const CAM_BACK  = 520;
const FOCAL     = 680;

// Indian tricolour RGB stops
const SAFFRON = [255, 153, 51]  as const;
const WHITE   = [255, 255, 255] as const;
const GREEN   = [19,  136,  8]  as const;

function lerpColor(
  a: readonly [number,number,number],
  b: readonly [number,number,number],
  t: number,
): [number,number,number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function flagColor(colFraction: number): [number,number,number] {
  if (colFraction < 0.33) return lerpColor(SAFFRON, WHITE,  colFraction / 0.33);
  if (colFraction < 0.66) return lerpColor(WHITE,   GREEN,  (colFraction - 0.33) / 0.33);
  return [...GREEN] as [number, number, number];
}

function waveHeight(col: number, row: number, t: number): number {
  const u = col / (COLS - 1);
  const v = row / (ROWS - 1);
  const a  = Math.sin(u * 6.0 + v * 4.0 + t);
  const b  = Math.sin(u * 3.2 - v * 5.5 + t * 0.75) * 0.55;
  const cc = Math.sin(v * 4.8 + t * 0.42) * 0.30;
  return ((a + b + cc) / 1.85) * WAVE_AMP;
}

function project(
  wx: number, wy: number, wz: number,
  W: number, H: number,
): [number, number, number] {
  const theta = Math.atan2(CAM_Y, CAM_BACK);
  const cosT  = Math.cos(theta);
  const sinT  = Math.sin(theta);
  const tx = wx;
  const ty = wy - CAM_Y;
  const tz = wz + CAM_BACK;
  const cy =  ty * cosT + tz * sinT;
  const cz = -ty * sinT + tz * cosT;
  if (cz <= 0.1) return [0, 0, -1];
  const sx = (tx / cz) * FOCAL + W * 0.5;
  const sy = (-cy / cz) * FOCAL + H * 0.48;
  return [sx, sy, cz];
}

export default function IndiaGridBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    // ResizeObserver only on parent (not canvas) to avoid feedback loop
    const parent = canvas.parentElement;
    const ro = parent ? new ResizeObserver(resize) : null;
    ro?.observe(parent!);

    type Pt = [number, number, number];
    const pts: Pt[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => [0, 0, 0] as Pt)
    );
    const heights: number[][] = Array.from({ length: ROWS }, () =>
      new Array<number>(COLS).fill(0)
    );

    const draw = (ts: number) => {
      if (!W || !H) { rafRef.current = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);

      const t = ts * 0.001 * WAVE_SPEED;

      for (let r = 0; r < ROWS; r++) {
        const wz = ((r / (ROWS - 1)) - 0.5) * GRID_Z;
        for (let c = 0; c < COLS; c++) {
          const wx = ((c / (COLS - 1)) - 0.5) * GRID_X;
          const wy = waveHeight(c, r, t);
          heights[r][c] = wy;
          pts[r][c] = project(wx, wy, wz, W, H);
        }
      }

      ctx.lineWidth = 0.7;

      // Horizontal lines — coloured by the midpoint column fraction
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 1; c++) {
          const [x1, y1, d1] = pts[r][c];
          const [x2, y2, d2] = pts[r][c + 1];
          if (d1 <= 0 || d2 <= 0) continue;
          const brightness = ((heights[r][c] + heights[r][c + 1]) * 0.5 / WAVE_AMP + 1) * 0.5;
          const alpha = 0.12 + brightness * 0.42;
          const [rr, gg, bb] = flagColor((c + 0.5) / (COLS - 1));
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${rr},${gg},${bb},${alpha.toFixed(3)})`;
          ctx.stroke();
        }
      }

      // Vertical lines — coloured by column fraction
      for (let c = 0; c < COLS; c++) {
        const colFrac = c / (COLS - 1);
        for (let r = 0; r < ROWS - 1; r++) {
          const [x1, y1, d1] = pts[r][c];
          const [x2, y2, d2] = pts[r + 1][c];
          if (d1 <= 0 || d2 <= 0) continue;
          const brightness = ((heights[r][c] + heights[r + 1][c]) * 0.5 / WAVE_AMP + 1) * 0.5;
          const alpha = 0.12 + brightness * 0.42;
          const [rr, gg, bb] = flagColor(colFrac);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${rr},${gg},${bb},${alpha.toFixed(3)})`;
          ctx.stroke();
        }
      }

      // Intersection dots
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const [sx, sy, cz] = pts[r][c];
          if (cz <= 0) continue;
          const brightness = (heights[r][c] / WAVE_AMP + 1) * 0.5;
          const alpha  = 0.15 + brightness * 0.50;
          const radius = 0.8  + brightness * 1.4;
          const [rr, gg, bb] = flagColor(c / (COLS - 1));
          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro?.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0, left: 0, bottom: 0,
        width: '62%',
        pointerEvents: 'none',
        zIndex: 0,
        // Fade from left (visible) → right (transparent)
        WebkitMaskImage: 'linear-gradient(to right, black 0%, black 35%, transparent 100%)',
        maskImage:        'linear-gradient(to right, black 0%, black 35%, transparent 100%)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}
