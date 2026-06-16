'use client';

import { useEffect, useRef, useState } from 'react';

// June 16 2026 00:00:00 UTC — the baseline moment for seeded live values
const REF_MS = 1781568000000; // 2026-06-16 00:00:00 UTC

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

interface Props {
  prefix?: string;
  /** Value at REF_MS */
  base: number;
  /** Units added per real-world second (0 = static) */
  ratePerSec?: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  color?: string;
}

export default function StatCounter({
  prefix = '',
  base,
  ratePerSec = 0,
  suffix = '',
  decimals = 0,
  duration = 3200,
  color,
}: Props) {
  const [display, setDisplay] = useState(decimals > 0 ? '0.0' : '0');
  const spanRef   = useRef<HTMLSpanElement>(null);
  const started   = useRef(false);
  const rafId     = useRef<number>(0);
  const liveTimer = useRef<ReturnType<typeof setInterval>>();
  const liveVal   = useRef(0);

  const fmt = (v: number) =>
    decimals > 0
      ? Math.max(0, v).toFixed(decimals)
      : Math.floor(Math.max(0, v)).toLocaleString('en-IN');

  // Compute target seeded by real-world elapsed time since REF_MS
  const seedTarget = () => {
    const elapsed = Math.max(0, (Date.now() - REF_MS) / 1000);
    return base + elapsed * ratePerSec;
  };

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      observer.disconnect();

      const target = seedTarget();
      const startTime = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const val = easeOutQuart(progress) * target;
        liveVal.current = val;
        setDisplay(fmt(val));

        if (progress < 1) {
          rafId.current = requestAnimationFrame(tick);
        } else {
          liveVal.current = target;
          setDisplay(fmt(target));

          // Live tick after animation — interval adapts to rate magnitude
          if (ratePerSec > 0) {
            const ms = ratePerSec >= 1 ? 5000 : 30000;
            liveTimer.current = setInterval(() => {
              liveVal.current += ratePerSec * (ms / 1000);
              setDisplay(fmt(liveVal.current));
            }, ms);
          }
        }
      };

      rafId.current = requestAnimationFrame(tick);
    }, { threshold: 0.4 });

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId.current);
      if (liveTimer.current) clearInterval(liveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      ref={spanRef}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 'clamp(22px,2.5vw,34px)',
        fontWeight: 900,
        color: color ?? 'inherit',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}
    >
      {prefix}{display}{suffix}
    </span>
  );
}
