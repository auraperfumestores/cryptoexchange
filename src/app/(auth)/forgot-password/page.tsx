'use client';

import { useState } from 'react';
import Link from 'next/link';
import StaticMesh from '@/components/ui/static-mesh';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true); setError('');
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden' }}>
      <StaticMesh />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#CCFF00', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(204,255,0,0.35)' }}>
              <span style={{ color: '#000', fontSize: 18, fontWeight: 900 }}>S</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
              Swapp<span style={{ color: '#CCFF00' }}>INR</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg,rgba(204,255,0,0.3),#CCFF00,rgba(204,255,0,0.3))' }} />

          <div style={{ padding: '36px 32px' }}>
            {!sent ? (
              <>
                {/* Icon */}
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#CCFF00" strokeWidth="1.6"/><path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" stroke="#CCFF00" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="#CCFF00"/></svg>
                </div>

                <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 8px', textAlign: 'center', letterSpacing: '-0.03em' }}>Forgot password?</h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 28px', textAlign: 'center', lineHeight: 1.6 }}>
                  Enter your email and we'll send you a link to reset your password.
                </p>

                {error && (
                  <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '11px 14px', marginBottom: 18, fontSize: 13, color: '#F87171' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                      Email address
                    </label>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" required
                      style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, fontSize: 15, color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>

                  <button
                    type="submit" disabled={loading}
                    style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(255,255,255,0.07)' : '#CCFF00', color: loading ? 'rgba(255,255,255,0.3)' : '#000', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        Sending…
                      </>
                    ) : 'Send reset link →'}
                  </button>
                </form>
              </>
            ) : (
              /* ── Sent state ── */
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,229,160,0.08)', border: '2px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 14L11 21L24 8" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Check your inbox</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 6px', lineHeight: 1.6 }}>
                  If an account with <strong style={{ color: '#fff' }}>{email}</strong> exists, we've sent a password reset link.
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 28px', lineHeight: 1.6 }}>The link expires in 1 hour. Check your spam folder if you don't see it.</p>
                <button onClick={() => { setSent(false); setEmail(''); }}
                  style={{ fontSize: 13, fontWeight: 700, color: '#CCFF00', background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }}>
                  Try a different email
                </button>
              </div>
            )}

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              Remember your password?{' '}
              <Link href="/login" style={{ color: '#CCFF00', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
