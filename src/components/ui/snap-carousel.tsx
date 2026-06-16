'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const AUTO_MS = 4000;
const GAP_PX  = 14;

/**
 * Mobile-only scroll-snap carousel with 4-second auto-advance.
 * Wrap a div.sc-grid inside this component; CSS transforms it into
 * a snapping row on ≤768 px. On desktop this component is invisible/inert.
 *
 * bg = section background colour used for the edge fade gradient.
 */
export function SnapCarousel({
  children,
  bg = 'var(--fr-black)',
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const idxRef   = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const [active, setActive] = useState(0);
  const [count,  setCount]  = useState(0);

  const getGrid   = () => wrapRef.current?.querySelector<HTMLElement>('.sc-grid') ?? null;
  const getSlides = () => {
    const g = getGrid();
    return g ? (Array.from(g.children) as HTMLElement[]) : [];
  };

  const scrollToIdx = useCallback((i: number) => {
    const slides = getSlides();
    const grid   = getGrid();
    if (!slides[i] || !grid) return;
    const slideW = slides[0].offsetWidth + GAP_PX;
    grid.scrollTo({ left: i * slideW, behavior: 'smooth' });
    idxRef.current = i;
    setActive(i);
    slides.forEach((s, j) => s.classList.toggle('sc-card--active', j === i));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = useCallback(() => {
    if (typeof window === 'undefined' || window.innerWidth > 768) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const n = getSlides().length;
      if (n === 0) return;
      scrollToIdx((idxRef.current + 1) % n);
    }, AUTO_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToIdx]);

  const setActiveCard = (slides: HTMLElement[], idx: number) => {
    slides.forEach((s, i) => s.classList.toggle('sc-card--active', i === idx));
  };

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth > 768) return;
    const grid = getGrid();
    if (!grid) return;

    const slides = Array.from(grid.children) as HTMLElement[];
    setCount(slides.length);
    setActiveCard(slides, 0);   // first card is active on mount
    startTimer();

    const pause  = () => clearInterval(timerRef.current);
    const resume = () => startTimer();
    const onScroll = () => {
      if (!slides[0]) return;
      const slideW = slides[0].offsetWidth + GAP_PX;
      const newIdx = Math.min(Math.round(grid.scrollLeft / slideW), slides.length - 1);
      if (newIdx !== idxRef.current) {
        idxRef.current = newIdx;
        setActive(newIdx);
        setActiveCard(slides, newIdx);
      }
    };

    grid.addEventListener('touchstart', pause,    { passive: true });
    grid.addEventListener('touchend',   resume,   { passive: true });
    grid.addEventListener('scroll',     onScroll, { passive: true });

    return () => {
      clearInterval(timerRef.current);
      grid.removeEventListener('touchstart', pause);
      grid.removeEventListener('touchend',   resume);
      grid.removeEventListener('scroll',     onScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className="sc-wrap">
      {children}

      {/* Edge fade shadows — only visible on mobile via CSS */}
      <div className="sc-fade sc-fade-l"
        style={{ background: `linear-gradient(to right,${bg} 35%,transparent)` }}
        aria-hidden="true"
      />
      <div className="sc-fade sc-fade-r"
        style={{ background: `linear-gradient(to left,${bg} 35%,transparent)` }}
        aria-hidden="true"
      />

      {/* Dot indicators — only visible on mobile via CSS */}
      {count > 1 && (
        <div className="sc-dots">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              className={`sc-dot${i === active ? ' sc-dot--on' : ''}`}
              onClick={() => { scrollToIdx(i); startTimer(); }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
