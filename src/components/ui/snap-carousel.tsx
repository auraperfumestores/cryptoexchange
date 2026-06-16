'use client';

import { useEffect, useRef, useState } from 'react';

const AUTO_MS = 4000;
const GAP_PX  = 14;

/**
 * Mobile-only infinite-loop carousel (cards always flow left→right).
 * On mount it clones all .sc-grid children and appends them, so the
 * scroll container is: [A B C A' B' C'].  After advancing past the
 * last real card we silently jump back to position 0 (invisible because
 * A' and A look identical).  Desktop: the component is fully inert.
 */
export function SnapCarousel({
  children,
  bg = 'var(--fr-black)',
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  const outerRef  = useRef<HTMLDivElement>(null);
  const idxRef    = useRef(0);          // current real index (0..n-1)
  const nRef      = useRef(0);          // original slide count
  const allRef    = useRef<HTMLElement[]>([]);
  const timerRef  = useRef<ReturnType<typeof setInterval>>();
  const [active, setActive] = useState(0);
  const [count,  setCount]  = useState(0);

  const getGrid = () =>
    outerRef.current?.querySelector<HTMLElement>('.sc-grid') ?? null;

  /** Mark the active card (+ its clone) and dim everything else. */
  const markActive = (realIdx: number) => {
    const n = nRef.current;
    allRef.current.forEach((s, i) =>
      s.classList.toggle('sc-card--active', i % n === realIdx),
    );
    setActive(realIdx);
    idxRef.current = realIdx;
  };

  /** Jump to real slide i with smooth scroll; restart timer. */
  const goTo = (i: number, restart = true) => {
    const grid = getGrid();
    const slides = allRef.current;
    if (!grid || !slides[i]) return;
    const sw = slides[0].offsetWidth + GAP_PX;
    grid.scrollTo({ left: i * sw, behavior: 'smooth' });
    markActive(i);
    if (restart) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(tick, AUTO_MS);
    }
  };

  /** Advance one step; when leaving last real card, animate into the
   *  clone then silently teleport back to position 0. */
  const tick = () => {
    const grid = getGrid();
    const slides = allRef.current;
    const n = nRef.current;
    if (!grid || !slides.length || !n) return;

    const sw = slides[0].offsetWidth + GAP_PX;
    const rawIdx = Math.round(grid.scrollLeft / sw);
    const nextRaw = rawIdx + 1;

    if (nextRaw >= n) {
      // Smooth-scroll into the clone of card 0 (looks like advancing)
      grid.scrollTo({ left: nextRaw * sw, behavior: 'smooth' });
      markActive(0);

      // After the smooth scroll settles, silently reset to real card 0
      const reset = () => { grid.scrollLeft = 0; };
      if ('onscrollend' in grid) {
        grid.addEventListener('scrollend', reset, { once: true });
      } else {
        setTimeout(reset, 350);
      }
    } else {
      grid.scrollTo({ left: nextRaw * sw, behavior: 'smooth' });
      markActive(nextRaw);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth > 768) return;
    const grid = getGrid();
    if (!grid) return;

    // ── Build: [orig0..origN, clone0..cloneN] ─────────────────────
    const originals = Array.from(grid.children) as HTMLElement[];
    const n = originals.length;
    nRef.current = n;

    originals.forEach(s => {
      const clone = s.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      grid.appendChild(clone);
    });

    const allSlides = Array.from(grid.children) as HTMLElement[];
    allRef.current  = allSlides;

    setCount(n);
    markActive(0);  // first card starts active

    timerRef.current = setInterval(tick, AUTO_MS);

    // ── Touch: pause on drag, resume on release ───────────────────
    const pause  = () => clearInterval(timerRef.current);
    const resume = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(tick, AUTO_MS);
    };

    // ── Scroll: sync active dot when user swipes manually ─────────
    const onScroll = () => {
      const sw = (allSlides[0]?.offsetWidth ?? 0) + GAP_PX;
      const rawIdx  = Math.round(grid.scrollLeft / sw);

      // If swiped into clone territory, silently jump back
      if (rawIdx >= n) {
        grid.scrollLeft = (rawIdx % n) * sw;
        markActive(rawIdx % n);
        return;
      }

      const realIdx = rawIdx % n;
      if (realIdx !== idxRef.current) markActive(realIdx);
    };

    grid.addEventListener('touchstart', pause,    { passive: true });
    grid.addEventListener('touchend',   resume,   { passive: true });
    grid.addEventListener('scroll',     onScroll, { passive: true });

    return () => {
      clearInterval(timerRef.current);
      grid.removeEventListener('touchstart', pause);
      grid.removeEventListener('touchend',   resume);
      grid.removeEventListener('scroll',     onScroll);
      // Clean up clones so re-mount starts fresh
      allSlides.slice(n).forEach(c => c.remove());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    /* sc-outer: full container including dots */
    <div ref={outerRef} className="sc-outer">

      {/* sc-wrap: mask-image on this element creates the edge dissolve */}
      <div className="sc-wrap">
        {children}
      </div>

      {/* Dot indicators — outside sc-wrap, not clipped */}
      {count > 1 && (
        <div className="sc-dots">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              className={`sc-dot${i === active ? ' sc-dot--on' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
