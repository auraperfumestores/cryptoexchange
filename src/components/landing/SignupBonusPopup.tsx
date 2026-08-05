'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

export default function SignupBonusPopup() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => setAnimating(true));
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = useCallback(() => {
    setAnimating(false);
    setTimeout(() => setVisible(false), 280);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: animating ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        aria-hidden="true"
      />

      {/* ── Card ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-headline"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: animating
            ? 'translate(-50%, -50%) scale(1)'
            : 'translate(-50%, -50%) scale(0.88)',
          zIndex: 9001,
          width: 'min(380px, 92vw)',
          aspectRatio: '3 / 4',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
          opacity: animating ? 1 : 0,
          transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {/* ── Background: USDT coin photo ── */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'url(/images/popup-bg.png) center 30% / cover no-repeat',
          }}
        />

        {/* Translucent teal-to-dark overlay — ties the photo into the dark brand theme */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(160deg, rgba(0,20,10,0.45) 0%, rgba(0,18,8,0.38) 40%, rgba(0,10,5,0.15) 70%, rgba(0,0,0,0) 100%)',
        }} />

        {/* Bottom content fade — ensures text stays legible over the photo */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.72) 62%, rgba(0,0,0,0.93) 100%)',
        }} />

        {/* Subtle lime glow at top to echo brand accent */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 45% at 50% 8%, rgba(204,255,0,0.10) 0%, transparent 70%)',
        }} />

        {/* ── Close button ── */}
        <button
          onClick={dismiss}
          aria-label="Close offer"
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 36, height: 36,
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.8)',
            transition: 'background 0.15s, color 0.15s',
            zIndex: 2,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.8)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.5)'; }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── Content ── */}
        <div style={{
          position: 'relative', zIndex: 2,
          padding: '0 28px 32px',
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(204,255,0,0.15)',
            border: '1px solid rgba(204,255,0,0.3)',
            borderRadius: 20, padding: '5px 12px',
            marginBottom: 18, alignSelf: 'flex-start',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#CCFF00', boxShadow: '0 0 6px #CCFF00', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#CCFF00', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Limited Time Offer
            </span>
          </div>

          {/* Headline */}
          <h2
            id="popup-headline"
            style={{
              fontSize: 'clamp(28px, 8vw, 36px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: '#ffffff',
              margin: '0 0 6px',
            }}
          >
            Get <span style={{ color: '#CCFF00' }}>$5</span> Free<br />
            When You Sign Up
          </h2>

          {/* Sub */}
          <p style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.62)',
            lineHeight: 1.55,
            margin: '0 0 24px',
          }}>
            Join SwappINR and your $5 bonus lands directly in your wallet — fully withdrawable once you complete your first exchange.
          </p>

          {/* Social proof */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 20,
          }}>
            {/* Avatars */}
            <div style={{ display: 'flex', marginRight: 2 }}>
              {['/testimonials/t2.jpg', '/testimonials/t5.jpg', '/testimonials/t3.jpg', '/testimonials/t7.jpg'].map((src, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '2px solid rgba(0,0,0,0.7)',
                  marginLeft: i === 0 ? 0 : -9,
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}>
                  <img
                    src={src}
                    alt=""
                    width={28}
                    height={28}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
              <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>1,200+</strong> traders already claimed
            </span>
          </div>

          {/* CTA */}
          <Link
            href="/register"
            onClick={dismiss}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#CCFF00',
              color: '#000',
              fontSize: 15,
              fontWeight: 900,
              borderRadius: 14,
              padding: '15px 24px',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              transition: 'background 0.15s, box-shadow 0.15s',
              boxShadow: '0 4px 24px rgba(204,255,0,0.35)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = '#d9ff1a';
              el.style.boxShadow = '0 6px 30px rgba(204,255,0,0.55)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = '#CCFF00';
              el.style.boxShadow = '0 4px 24px rgba(204,255,0,0.35)';
            }}
          >
            Claim My $5 Bonus
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M8 3L13 8L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            style={{
              marginTop: 14,
              background: 'none', border: 'none',
              fontSize: 12, color: 'rgba(255,255,255,0.32)',
              cursor: 'pointer', padding: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.32)'; }}
          >
            No thanks, I&apos;ll skip the bonus
          </button>
        </div>
      </div>
    </>
  );
}
