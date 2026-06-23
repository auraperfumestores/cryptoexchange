'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
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

/** Runs an invisible Cloudflare Turnstile check on every fresh page load and
 *  stores the result as a signed cookie that middleware checks before allowing
 *  login, registration, or OTP requests through. Renders nothing visible unless
 *  Cloudflare decides the visitor needs an interactive challenge. */
export default function TurnstileGate() {
  const elRef      = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !elRef.current) return;
    let mounted = true;

    loadTurnstileScript().then(() => {
      if (!mounted || !window.turnstile || !elRef.current) return;
      widgetIdRef.current = window.turnstile.render(elRef.current, {
        sitekey: siteKey,
        size: 'normal',
        appearance: 'interaction-only',
        callback: (token: string) => {
          fetch('/api/turnstile/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }).catch(() => {});
        },
      });
    });

    return () => {
      mounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={elRef} style={{ position: 'fixed', bottom: 12, right: 12, zIndex: 100000 }} />;
}
