'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export default function PageLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const prevPath = useRef(pathname);

  const clear = () => { if (timer.current) clearTimeout(timer.current); };

  const start = useCallback(() => {
    clear();
    setFading(false);
    setVisible(true);
  }, []);

  const finish = useCallback(() => {
    clear();
    setFading(true);
    timer.current = setTimeout(() => {
      setVisible(false);
      setFading(false);
    }, 380);
  }, []);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      finish();
    }
  }, [pathname, finish]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      const opensNewTab = a.getAttribute('target') === '_blank';
      if (!opensNewTab && href.startsWith('/') && !href.startsWith('//') && href !== pathname) start();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname, start]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes pl-bar {
          0%, 100% { transform: scaleY(0.35); opacity: 0.35; }
          50%       { transform: scaleY(1);    opacity: 1; }
        }
        @keyframes pl-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes pl-out {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to   { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
        }
        @keyframes pl-bg-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pl-bg-out { from { opacity: 1; } to { opacity: 0; } }
      `}</style>

      {/* Blur backdrop — single GPU-composited layer, no per-element repaint */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          pointerEvents: 'none',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          background: 'rgba(0,0,0,0.18)',
          willChange: 'opacity',
          animation: fading
            ? 'pl-bg-out 0.32s cubic-bezier(0.4,0,0.2,1) forwards'
            : 'pl-bg-in  0.22s cubic-bezier(0.4,0,0.2,1) forwards',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          width: 52,
          height: 44,
          background: 'rgba(10, 10, 10, 0.85)',
          border: '1px solid rgba(204, 255, 0, 0.12)',
          borderRadius: 12,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
          animation: fading
            ? 'pl-out 0.3s cubic-bezier(0.4,0,0.2,1) forwards'
            : 'pl-in  0.2s cubic-bezier(0.4,0,0.2,1) forwards',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 16,
              borderRadius: 99,
              background: '#CCFF00',
              transformOrigin: 'center',
              animation: `pl-bar 0.75s ease-in-out ${i * 0.13}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}
