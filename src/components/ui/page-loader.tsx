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
      if (href.startsWith('/') && !href.startsWith('//') && href !== pathname) start();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname, start]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes pl-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pl-fade-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes pl-fade-out {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to   { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
        }
      `}</style>

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
          gap: 12,
          padding: '14px 20px',
          background: 'rgba(10, 10, 10, 0.88)',
          border: '1px solid rgba(204, 255, 0, 0.13)',
          borderRadius: 12,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(204,255,0,0.05)',
          animation: fading
            ? 'pl-fade-out 0.32s cubic-bezier(0.4,0,0.2,1) forwards'
            : 'pl-fade-in 0.22s cubic-bezier(0.4,0,0.2,1) forwards',
        }}
      >
        {/* Spinner ring */}
        <div style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: '2px solid rgba(204,255,0,0.15)',
          borderTopColor: '#CCFF00',
          animation: 'pl-spin 0.65s linear infinite',
          flexShrink: 0,
        }} />

        {/* Label */}
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.04em',
          fontFamily: 'inherit',
          userSelect: 'none',
        }}>
          Loading
        </span>
      </div>
    </>
  );
}
