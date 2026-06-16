'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  prefix?: string;
  target: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  color?: string;
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export default function StatCounter({
  prefix = '',
  target,
  suffix = '',
  decimals = 0,
  duration = 3200,
  color,
}: Props) {
  const [display, setDisplay] = useState(decimals > 0 ? (0).toFixed(decimals) : '0');
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();

        const startTime = performance.now();

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeOutQuart(progress);
          const val = Math.max(0, eased * target);

          const formatted = decimals > 0
            ? val.toFixed(decimals)
            : Math.floor(val).toLocaleString('en-IN');

          setDisplay(formatted);

          if (progress < 1) {
            rafId.current = requestAnimationFrame(tick);
          }
        };

        rafId.current = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      ref={ref}
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
