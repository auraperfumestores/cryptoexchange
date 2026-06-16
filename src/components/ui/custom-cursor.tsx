'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const pos     = useRef({ x: -200, y: -200 });
  const target  = useRef({ x: -200, y: -200 });
  const hovering = useRef(false);
  const rafId   = useRef<number>(0);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.documentElement.style.cursor = 'none';

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    // Detect hover over interactive elements
    const onEnter = (e: MouseEvent) => {
      if ((e.target as Element).closest('a,button,[role="button"],input,select,textarea,label')) {
        hovering.current = true;
      }
    };
    const onLeave = (e: MouseEvent) => {
      if ((e.target as Element).closest('a,button,[role="button"],input,select,textarea,label')) {
        hovering.current = false;
      }
    };

    window.addEventListener('mousemove', onMove,   { passive: true });
    document.addEventListener('mouseover',  onEnter, { passive: true });
    document.addEventListener('mouseout',   onLeave, { passive: true });

    const tick = () => {
      // Lag: dot trails slightly behind real cursor
      pos.current.x += (target.current.x - pos.current.x) * 0.14;
      pos.current.y += (target.current.y - pos.current.y) * 0.14;

      const el = dotRef.current;
      if (el) {
        el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
        if (hovering.current) {
          el.style.width  = '20px';
          el.style.height = '20px';
          el.style.marginLeft = '-10px';
          el.style.marginTop  = '-10px';
          el.style.opacity = '0.6';
          el.style.background = 'transparent';
          el.style.border = '1.5px solid #CCFF00';
        } else {
          el.style.width  = '10px';
          el.style.height = '10px';
          el.style.marginLeft = '-5px';
          el.style.marginTop  = '-5px';
          el.style.opacity = '1';
          el.style.background = '#CCFF00';
          el.style.border = 'none';
        }
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      document.documentElement.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover',  onEnter);
      document.removeEventListener('mouseout',   onLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: 10, height: 10,
        marginLeft: -5, marginTop: -5,
        borderRadius: '50%',
        background: '#CCFF00',
        pointerEvents: 'none',
        zIndex: 999999,
        boxShadow: '0 0 8px rgba(204,255,0,0.7)',
        transition: 'width 0.18s ease, height 0.18s ease, opacity 0.18s ease, background 0.18s ease, border 0.18s ease',
        willChange: 'transform',
      }}
    />
  );
}
