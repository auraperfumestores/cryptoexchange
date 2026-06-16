'use client';

import { useEffect, useRef, useState } from 'react';

const AUTO_MS = 4000;
const GAP_PX  = 14;
const OFFSET   = 1; // one clone of the LAST card is prepended before real cards

/**
 * Mobile-only infinite carousel — cards always advance in the same direction.
 *
 * DOM layout built on mount:  [C',  A,  B,  C,  A', B', C'']
 *                               idx: 0   1   2   3   4   5   6
 *
 * We start at scrollLeft = OFFSET * slideWidth (showing A).
 * C' peeks on the left; B peeks on the right.
 *
 * When auto-advance scrolls into A' (idx 4), a silent jump back to A (idx 1)
 * is scheduled. Because A'=A and both neighbors are clones too, the jump is
 * completely invisible.
 *
 * On desktop the component is fully inert.
 */
export function SnapCarousel({
  children,
  bg = 'var(--fr-black)', // kept for API compat, no longer used internally
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  const outerRef   = useRef<HTMLDivElement>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval>>();
  const jumpingRef = useRef(false); // true while a silent programmatic reset runs
  const [active, setActive] = useState(0);
  const [count,  setCount]  = useState(0);

  const getGrid = () =>
    outerRef.current?.querySelector<HTMLElement>('.sc-grid') ?? null;

  /* ── Dot click handler (needs count from state) ─────────────── */
  const goTo = (realIdx: number) => {
    const grid = getGrid();
    if (!grid) return;
    const first = grid.firstElementChild as HTMLElement | null;
    const sw = (first?.offsetWidth ?? 0) + GAP_PX;
    grid.scrollTo({ left: (OFFSET + realIdx) * sw, behavior: 'smooth' });
    setActive(realIdx);
  };

  /* ── Main effect — mobile only ───────────────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth > 768) return;
    const grid = getGrid();
    if (!grid) return;

    /* 1 ─ Collect originals before any mutation */
    const originals = Array.from(grid.children) as HTMLElement[];
    const n = originals.length;
    if (n === 0) return;

    /* 2 ─ Build [C', A, B, C, A', B', C''] */
    // Prepend clone of last card (C) as C'
    const head = originals[n - 1].cloneNode(true) as HTMLElement;
    head.setAttribute('aria-hidden', 'true');
    grid.insertBefore(head, grid.firstChild);

    // Append clones of all n originals (A', B', C'')
    originals.forEach(s => {
      const clone = s.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      grid.appendChild(clone);
    });

    setCount(n);

    /* 3 ─ Helpers */
    const slideW = () => {
      const first = grid.firstElementChild as HTMLElement | null;
      return (first?.offsetWidth ?? 0) + GAP_PX;
    };

    // Mark the active real card (and all its clones) with .sc-card--active
    const markActive = (realIdx: number) => {
      const kids = Array.from(grid.children) as HTMLElement[];
      kids.forEach((s, i) => {
        // Map DOM index → real index: ((i - OFFSET) mod n + n) mod n
        const ri = ((i - OFFSET) % n + n) % n;
        s.classList.toggle('sc-card--active', ri === realIdx);
      });
      setActive(realIdx);
    };

    // Silent instant jump (no animation, ignored by onScroll)
    const jumpTo = (rawIdx: number) => {
      jumpingRef.current = true;
      grid.scrollLeft = rawIdx * slideW();
      // Allow one rAF for the scroll to settle, then unlock
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { jumpingRef.current = false; });
      });
    };

    /* 4 ─ Initialise: show A centered (rawIdx = OFFSET = 1) */
    requestAnimationFrame(() => {
      jumpTo(OFFSET);
      markActive(0);
    });

    /* 5 ─ Auto-advance tick */
    const tick = () => {
      const s  = slideW();
      const rawIdx  = Math.round(grid.scrollLeft / s);
      const nextRaw = rawIdx + 1;

      // Smooth-scroll one step forward
      grid.scrollTo({ left: nextRaw * s, behavior: 'smooth' });
      markActive(((nextRaw - OFFSET) % n + n) % n);

      // If we've scrolled into the after-clone zone, schedule invisible reset
      if (nextRaw >= OFFSET + n) {
        const targetRaw = nextRaw - n; // equivalent real position (e.g. 4→1)
        const reset = () => jumpTo(targetRaw);
        if ('onscrollend' in grid) {
          grid.addEventListener('scrollend', reset, { once: true });
        } else {
          setTimeout(reset, 340);
        }
      }
    };

    const startTimer = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(tick, AUTO_MS);
    };
    startTimer();

    /* 6 ─ Touch: pause while user drags, restart on release */
    const pause  = () => clearInterval(timerRef.current);
    const resume = () => startTimer();

    /* 7 ─ Scroll: sync dots + handle manual boundary swipes */
    const onScroll = () => {
      if (jumpingRef.current) return; // ignore programmatic resets
      const s = slideW();
      const rawIdx = Math.round(grid.scrollLeft / s);

      // User swiped back past C' (idx 0) — jump to real C
      if (rawIdx < OFFSET) {
        jumpTo(rawIdx + n);
        markActive(((rawIdx + n - OFFSET) % n + n) % n);
        return;
      }
      // User swiped forward past after-clones — jump back to real equivalent
      if (rawIdx >= OFFSET + n) {
        jumpTo(rawIdx - n);
        markActive(((rawIdx - n - OFFSET) % n + n) % n);
        return;
      }

      markActive(rawIdx - OFFSET);
    };

    grid.addEventListener('touchstart', pause,    { passive: true });
    grid.addEventListener('touchend',   resume,   { passive: true });
    grid.addEventListener('scroll',     onScroll, { passive: true });

    /* 8 ─ Cleanup: restore original children */
    return () => {
      clearInterval(timerRef.current);
      grid.removeEventListener('touchstart', pause);
      grid.removeEventListener('touchend',   resume);
      grid.removeEventListener('scroll',     onScroll);
      // Remove the prepended C' and all appended clones, leave A B C intact
      const kids = Array.from(grid.children);
      kids.forEach((c, i) => {
        if (i < OFFSET || i >= OFFSET + n) c.remove();
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={outerRef} className="sc-outer">
      {/* mask-image on sc-wrap dissolves peeking cards at both edges */}
      <div className="sc-wrap">
        {children}
      </div>

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
