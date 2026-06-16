'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    fetch(`/api/auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setTimeout(() => router.push('/login'), 3000);
        } else if (data.alreadyVerified) {
          setStatus('success');
          setMessage('Your email was already verified. Redirecting to login…');
          setTimeout(() => router.push('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error ?? 'Verification failed. The link may have expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [token, router]);

  return (
    <div className="auth-bg" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(26,63,255,0.22)', top: '-100px', left: '50%', transform: 'translateX(-50%)' }} />
      <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(107,33,255,0.18)', bottom: '-80px', right: '-60px' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }} className="animate-slide-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #1A3FFF 0%, #6B21FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(26,63,255,0.5)' }}>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 900 }}>S</span>
            </div>
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em' }}>
              Swap<span style={{ background: 'linear-gradient(135deg, #4D9FFF 0%, #00D4FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>INR</span>
            </span>
          </Link>
        </div>

        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(26,63,255,0.15)', border: '1px solid rgba(26,63,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>Verifying your email</h2>
              <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.7)', lineHeight: 1.6 }}>Please wait a moment…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,229,160,0.12)', border: '1px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M5 14L11 20L23 8" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>Email Verified!</h2>
              <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.7)', lineHeight: 1.6, marginBottom: 24 }}>
                {message || 'Your email has been verified successfully.'}
              </p>
              <div style={{ background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'rgba(0,229,160,0.8)' }}>
                Redirecting to login in 3 seconds…
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M8 8L20 20M20 8L8 20" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>Verification Failed</h2>
              <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.7)', lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
              <Link
                href="/register"
                className="btn-primary"
                style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', marginBottom: 12 }}
              >
                Create new account
              </Link>
              <Link href="/login" style={{ display: 'block', fontSize: 13, color: '#4D9FFF', textDecoration: 'none' }}>
                Back to sign in
              </Link>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <Link href="/" style={{ color: 'rgba(148,163,184,0.45)', textDecoration: 'none' }}>← Back to SwapINR</Link>
        </p>
      </div>
    </div>
  );
}
