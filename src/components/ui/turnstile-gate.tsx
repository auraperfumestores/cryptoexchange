'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      execute: (el: string | HTMLElement, opts?: Record<string, unknown>) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return scriptPromise;
}

const SESSION_FLAG = 'cf_verified_session';

/** Runs a Cloudflare Turnstile bot check in the background once per session.
 *  Stays completely invisible — zero footprint, no script even loaded — for
 *  visitors who already hold a valid `cf_v` cookie (checked server-side in
 *  layout.tsx). For everyone else it executes silently and only expands into
 *  a centered overlay if Cloudflare's own before/after-interactive callbacks
 *  signal that a real challenge is required, instead of sitting as a
 *  permanent corner widget. */
export default function TurnstileGate({ initiallyVerified }: { initiallyVerified: boolean }) {
  const elRef       = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [done, setDone] = useState(initiallyVerified);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (initiallyVerified || sessionStorage.getItem(SESSION_FLAG) === '1') {
      setDone(true);
    }
  }, [initiallyVerified]);

  useEffect(() => {
    if (!siteKey || done || !elRef.current) return;
    let mounted = true;

    loadTurnstileScript().then(() => {
      if (!mounted || !window.turnstile || !elRef.current) return;
      widgetIdRef.current = window.turnstile.render(elRef.current, {
        sitekey: siteKey,
        appearance: 'execute',
        execution: 'execute',
        'before-interactive-callback': () => setNeedsInteraction(true),
        'after-interactive-callback':  () => setNeedsInteraction(false),
        callback: (token: string) => {
          fetch('/api/turnstile/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }).catch(() => {}).finally(() => {
            sessionStorage.setItem(SESSION_FLAG, '1');
            setDone(true);
          });
        },
      });
      window.turnstile.execute(elRef.current);
    });

    return () => {
      mounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
    };
  }, [siteKey, done]);

  if (!siteKey || done) return null;

  return (
    <div
      style={needsInteraction ? {
        position: 'fixed', inset: 0, zIndex: 100000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      } : {
        position: 'fixed', width: 0, height: 0, overflow: 'hidden',
        opacity: 0, pointerEvents: 'none',
      }}
    >
      <div ref={elRef} />
    </div>
  );
}
