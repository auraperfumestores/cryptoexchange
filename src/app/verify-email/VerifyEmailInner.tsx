'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

export default function VerifyEmailInner() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get('token');
  const didFetch = useRef(false);
  const [status,  setStatus]  = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in this link.');
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.success || data.alreadyVerified) {
          setStatus('success');
          if (data.alreadyVerified) setMessage('Your email was already verified.');
          setTimeout(() => router.push('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error ?? 'Verification failed. The link may have expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please check your connection and try again.');
      });
  }, [token, router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      fontFamily: 'var(--fr-font-sans)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#CCFF00', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(204,255,0,0.35)' }}>
          <span style={{ color: '#000', fontSize: 17, fontWeight: 900 }}>S</span>
        </div>
        <span style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em' }}>
          Swap<span style={{ color: '#CCFF00' }}>INR</span>
        </span>
      </Link>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#111111',
        border: '1px solid rgba(204,255,0,0.14)',
        borderRadius: 20,
        overflow: 'hidden',
      }}>

        {/* Loading */}
        {status === 'loading' && (
          <div style={{ padding: '52px 40px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span className="spinner" style={{ width: 28, height: 28, borderWidth: 2.5, borderColor: 'rgba(204,255,0,0.2)', borderTopColor: '#CCFF00' } as React.CSSProperties} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>Verifying your email</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>Please wait a moment…</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div style={{ padding: '52px 40px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 32px rgba(204,255,0,0.1)' }}>
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path d="M6 15L12 21L24 9" stroke="#CCFF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.025em' }}>Email Verified!</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 28 }}>
              {message || 'Your account is now active. You can start swapping USDT to INR instantly.'}
            </p>
            <div style={{ background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 12, padding: '13px 16px', fontSize: 13, color: 'rgba(204,255,0,0.8)', fontWeight: 500 }}>
              Redirecting to sign in in 3 seconds…
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ padding: '52px 40px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M8 8L20 20M20 8L8 20" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.025em' }}>Link Expired</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 28 }}>
              {message}
            </p>
            <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg fr-btn--full" style={{ marginBottom: 12 }}>
              Create new account <ArrowRight size={16} weight="bold" />
            </Link>
            <Link href="/login" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginTop: 4 }}>
              Already verified? Sign in →
            </Link>
          </div>
        )}

        {/* Card footer */}
        <div style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>
            Didn&apos;t request this? You can safely ignore it.
          </p>
        </div>
      </div>

      <p style={{ marginTop: 28, fontSize: 13 }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>← Back to SwapINR</Link>
      </p>
    </div>
  );
}
