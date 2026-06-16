'use client';

import { useEffect, useRef } from 'react';

/*
  3-D perspective mesh with sine-wave surface displacement.
  Grid vertices exist in world space (X horizontal, Y wave-height, Z depth).
  A proper pinhole-camera projection maps them to screen coords.
  Lines connect neighbours; dots mark every intersection.
  The wave animation is slow and organic — "cloth breathing".
*/

/* ── Grid dimensions ─────────────────────────────────────── */
const COLS = 34;
const ROWS = 24;

/* ── World extents of the grid (world units) ─────────────── */
const GRID_X = 1600;  // total width
const GRID_Z = 1200;  // total depth (near→far)

/* ── Wave ────────────────────────────────────────────────── */
const WAVE_AMP   = 110;   // world-unit height of waves
const WAVE_SPEED = 0.22;  // time multiplier (low = slower)

/* ── Camera ──────────────────────────────────────────────── */
const CAM_Y     = 380;   // camera height above grid plane
const CAM_BACK  = 580;   // camera distance behind grid centre
const FOCAL     = 720;   // focal length (perspective strength)

function waveHeight(col: number, row: number, t: number): number {
  const u = col / (COLS - 1);   // 0..1
  const v = row / (ROWS - 1);   // 0..1

  // Three overlapping sine sheets — organic, never mechanical
  const a = Math.sin(u * 7.0 + v * 4.5 + t);
  const b = Math.sin(u * 3.5 - v * 6.0 + t * 0.72) * 0.55;
  const c = Math.sin(v * 5.5       + t * 0.44) * 0.30;

  return ((a + b + c) / 1.85) * WAVE_AMP;
}

/* Pinhole camera projection — returns [sx, sy, depth] */
function project(
  wx: number, wy: number, wz: number,
  W: number, H: number,
): [number, number, number] {
  // Camera look-down angle derived from height + back-distance
  const theta = Math.atan2(CAM_Y, CAM_BACK);
  const cosT  = Math.cos(theta);
  const sinT  = Math.sin(theta);

  // Translate world point relative to camera
  const tx = wx;
  const ty = wy - CAM_Y;
  const tz = wz + CAM_BACK;   // camera is at -CAM_BACK on the Z axis

  // Rotate by tilt (camera looks forward+down = positive tilt around X)
  const cy =  ty * cosT + tz * sinT;
  const cz = -ty * sinT + tz * cosT;

  if (cz <= 0.1) return [0, 0, -1];   // behind camera, discard

  // Perspective divide
  const sx = (tx / cz) * FOCAL + W * 0.5;
  const sy = (-cy / cz) * FOCAL + H * 0.48;  // slight vertical offset

  return [sx, sy, cz];
}

export default function HeroBg3D() {
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
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* Pre-allocate point buffer */
    type Pt = [number, number, number]; // sx, sy, cz
    const pts: Pt[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => [0, 0, 0] as Pt)
    );
    const heights: number[][] = Array.from({ length: ROWS }, () =>
      new Array<number>(COLS).fill(0)
    );

    const drawFrame = (ts: number) => {
      ctx.clearRect(0, 0, W, H);

      const t = ts * 0.001 * WAVE_SPEED;

      /* ── 1. Compute all projected points ── */
      for (let r = 0; r < ROWS; r++) {
        const wz = ((r / (ROWS - 1)) - 0.5) * GRID_Z;
        for (let c = 0; c < COLS; c++) {
          const wx = ((c / (COLS - 1)) - 0.5) * GRID_X;
          const wy = waveHeight(c, r, t);
          heights[r][c] = wy;
          pts[r][c] = project(wx, wy, wz, W, H);
        }
      }

      /* ── 2. Draw grid lines ── */
      ctx.lineWidth = 0.65;

      // Horizontal lines (same row, varying column)
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 1; c++) {
          const [x1, y1, d1] = pts[r][c];
          const [x2, y2, d2] = pts[r][c + 1];
          if (d1 <= 0 || d2 <= 0) continue;

          // Height-based brightness: peaks glow brighter
          const h1 = heights[r][c]     / WAVE_AMP;  // -1..1
          const h2 = heights[r][c + 1] / WAVE_AMP;
          const brightness = ((h1 + h2) * 0.5 + 1) * 0.5; // 0..1
          // Dim lines are dark lime, bright peaks glow full lime → white-hot
          const alpha = 0.14 + brightness * 0.38;
          const g = Math.round(160 + brightness * 70);
          const b = Math.round(brightness * brightness * 45);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${Math.round(120 + brightness * 60)},${g},${b},${alpha.toFixed(3)})`;
          ctx.stroke();
        }
      }

      // Vertical lines (same column, varying row)
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 1; r++) {
          const [x1, y1, d1] = pts[r][c];
          const [x2, y2, d2] = pts[r + 1][c];
          if (d1 <= 0 || d2 <= 0) continue;

          const h1 = heights[r][c]     / WAVE_AMP;
          const h2 = heights[r + 1][c] / WAVE_AMP;
          const brightness = ((h1 + h2) * 0.5 + 1) * 0.5;
          const alpha = 0.14 + brightness * 0.38;
          const g = Math.round(160 + brightness * 70);
          const b = Math.round(brightness * brightness * 45);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${Math.round(120 + brightness * 60)},${g},${b},${alpha.toFixed(3)})`;
          ctx.stroke();
        }
      }

      /* ── 3. Draw intersection dots ── */
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const [sx, sy, cz] = pts[r][c];
          if (cz <= 0) continue;

          const hn = heights[r][c] / WAVE_AMP;          // -1..1
          const brightness = (hn + 1) * 0.5;            // 0..1
          const alpha  = 0.20 + brightness * 0.55;
          const radius = 1.0  + brightness * 1.5;

          const dr = Math.round(100 + brightness * 80);
          const dg = Math.round(160 + brightness * 80);
          const db = Math.round(brightness > 0.8 ? (brightness - 0.8) * 5 * 50 : 0);

          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${dr},${dg},${db},${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(drawFrame);
    };

    rafRef.current = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
        opacity: 1,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}
