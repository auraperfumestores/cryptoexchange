'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

// Build the zig-zag SVG path
// ViewBox: 0 0 1440 18 | peaks at y=2, valleys at y=16 | horizontal step: 18px
function buildZigZag(): string {
  const MID = 9, AMP = 7, STEP = 18, W = 1440;
  const pts: string[] = [`M0,${MID}`];
  let up = true;
  for (let x = STEP; x <= W + STEP; x += STEP, up = !up) {
    pts.push(`L${x},${up ? MID - AMP : MID + AMP}`);
  }
  return pts.join(' ');
}

const PATH = buildZigZag();
// Each segment: sqrt(18² + 14²) ≈ 22.8px. ~80 segments → ~1824px total
const PATH_LEN = 1900;
const SPARK_LEN = 45; // bright "electric head" length

export default function PageLoader() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const prevPath = useRef(pathname);

  const clearT = () => { if (timer.current) clearTimeout(timer.current); };

  const start = useCallback(() => {
    clearT();
    setDone(false);
    setPct(0);
    setActive(true);
    let p = 6;
    const tick = () => {
      // Ease: fast at first, exponentially slow near 85%
      p = Math.min(85, p + (85 - p) * 0.13 + Math.random() * 3.5);
      setPct(p);
      if (p < 85) timer.current = setTimeout(tick, 70 + Math.random() * 110);
    };
    timer.current = setTimeout(tick, 40);
  }, []);

  const finish = useCallback(() => {
    clearT();
    setPct(100);
    setDone(true);
    timer.current = setTimeout(() => {
      setActive(false);
      setDone(false);
      setPct(0);
    }, 520);
  }, []);

  // Detect route change → finish
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      finish();
    }
  }, [pathname, finish]);

  // Start on any internal link click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      const isInternal = href.startsWith('/') && !href.startsWith('//');
      if (isInternal && href !== pathname) start();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname, start]);

  if (!active) return null;

  // stroke-dashoffset math:
  // Main line: reveal from left → offset = PATH_LEN * (1 - pct/100)
  // Tip spark: length SPARK_LEN ending at current progress point
  //   dashoffset_spark = SPARK_LEN - PATH_LEN * (pct/100)
  const mainOffset = PATH_LEN * (1 - pct / 100);
  const sparkOffset = SPARK_LEN - PATH_LEN * (pct / 100);
  const transition = done
    ? 'stroke-dashoffset 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease'
    : 'stroke-dashoffset 0.18s cubic-bezier(0.4,0,0.2,1)';

  return (
    <>
      <style>{`
        @keyframes zz-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes zz-shimmer {
          0% { stroke-opacity: 0.5; }
          50% { stroke-opacity: 1; }
          100% { stroke-opacity: 0.5; }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 18, zIndex: 99999, pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <svg
          viewBox="0 0 1440 18"
          width="100%"
          height="18"
          preserveAspectRatio="none"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            {/* Soft glow filter */}
            <filter id="zz-glow-soft" x="-5%" y="-150%" width="110%" height="400%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Strong glow for the electric tip */}
            <filter id="zz-glow-strong" x="-10%" y="-300%" width="120%" height="700%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Lime gradient for the main line */}
            <linearGradient id="zz-lime-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#CCFF00" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* 1. Dark track — shows the full zig-zag path faintly */}
          <path
            d={PATH}
            fill="none"
            stroke="rgba(204,255,0,0.07)"
            strokeWidth="1.5"
          />

          {/* 2. Wide background glow halo */}
          <path
            d={PATH}
            fill="none"
            stroke="rgba(204,255,0,0.15)"
            strokeWidth="8"
            filter="url(#zz-glow-strong)"
            style={{
              strokeDasharray: PATH_LEN,
              strokeDashoffset: mainOffset,
              transition,
              opacity: done ? 0 : 0.7,
            }}
          />

          {/* 3. Core lime zig-zag line */}
          <path
            d={PATH}
            fill="none"
            stroke="#CCFF00"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#zz-glow-soft)"
            style={{
              strokeDasharray: PATH_LEN,
              strokeDashoffset: mainOffset,
              transition,
              opacity: done ? 0 : 1,
            }}
          />

          {/* 4. Electric tip spark — white-hot leading edge */}
          {!done && pct > 2 && (
            <path
              d={PATH}
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#zz-glow-strong)"
              style={{
                strokeDasharray: `${SPARK_LEN} ${PATH_LEN + SPARK_LEN}`,
                strokeDashoffset: sparkOffset,
                transition: 'stroke-dashoffset 0.18s cubic-bezier(0.4,0,0.2,1)',
                animation: 'zz-shimmer 0.4s ease infinite',
              }}
            />
          )}

          {/* 5. Thin bright center of the spark for extra crispness */}
          {!done && pct > 2 && (
            <path
              d={PATH}
              fill="none"
              stroke="#CCFF00"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: `${SPARK_LEN * 0.4} ${PATH_LEN + SPARK_LEN}`,
                strokeDashoffset: sparkOffset + SPARK_LEN * 0.3,
                transition: 'stroke-dashoffset 0.18s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          )}
        </svg>

        {/* Bottom shadow line — grounds the loader visually */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 1,
          background: 'rgba(204,255,0,0.12)',
        }} />
      </div>
    </>
  );
}
