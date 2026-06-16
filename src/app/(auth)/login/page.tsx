'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function IconMail()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 6L8 9.5L14 6" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function IconLock()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7V5C5 3.3 6.3 2 8 2C9.7 2 11 3.3 11 5V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconEye()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8C1 8 3.5 4 8 4C12.5 4 15 8 15 8C15 8 12.5 12 8 12C3.5 12 1 8 1 8Z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function IconEyeOff(){ return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2L14 14M6.5 6.6C6.2 7 6 7.5 6 8C6 9.1 6.9 10 8 10C8.5 10 9 9.8 9.4 9.5M4.3 4.4C2.9 5.3 2 7 2 7C2 7 4.5 11 8 11C9.2 11 10.3 10.6 11.2 10M1 8C1 8 2 5 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconArrow() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconShield(){ return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L3 5V9C3 12.3 5.6 15.4 9 16C12.4 15.4 15 12.3 15 9V5L9 2Z" stroke="currentColor" strokeWidth="1.4"/><path d="M6.5 9L8 10.5L11.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

const TRUST_STATS = [
  { value: '₹83 Cr+', label: 'Volume Processed' },
  { value: '10K+', label: 'Happy Traders' },
  { value: '< 15 min', label: 'Avg Settlement' },
  { value: '4.9★', label: 'User Rating' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const result = await signIn('credentials', { redirect: false, email, password });
      if (result?.error) {
        setError(result.error === 'EMAIL_NOT_VERIFIED'
          ? 'Please verify your email before signing in. Check your inbox.'
          : 'Invalid email or password.');
        return;
      }
      const sessionRes = await fetch('/api/auth/me');
      const sessionData = await sessionRes.json();
      router.push(sessionData.data?.role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fr-auth-page">

      {/* ── Left Visual Panel ── */}
      <div className="fr-auth-visual">
        {/* Subtle dot grid — low opacity so text stays crisp */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'radial-gradient(circle, rgba(204,255,0,0.07) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          WebkitMaskImage: 'radial-gradient(ellipse at 30% 50%, black 0%, transparent 75%)',
          maskImage: 'radial-gradient(ellipse at 30% 50%, black 0%, transparent 75%)',
        }} />
        {/* Lime glow — top left */}
        <div style={{
          position: 'absolute', top: -60, left: -60,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(204,255,0,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 440 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--fr-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--fr-glow-lime)' }}>
              <span style={{ color: '#000', fontSize: 17, fontWeight: 900 }}>S</span>
            </div>
            <span style={{ color: 'var(--fr-text-primary)', fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em' }}>
              Swap<span style={{ color: 'var(--fr-lime)' }}>INR</span>
            </span>
          </Link>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 16 }}>
            India&apos;s Fastest<br />
            <span style={{ color: 'var(--fr-lime)' }}>Crypto → INR</span><br />
            Exchange
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--fr-text-secondary)', marginBottom: 40, maxWidth: 360 }}>
            Sell USDT, BTC, ETH and more directly to your UPI or bank account. No middlemen, best market rates, instant payouts.
          </p>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}>
            {TRUST_STATS.map(s => (
              <div key={s.label} style={{
                background: 'var(--fr-dark-3)',
                border: '1px solid var(--fr-border-default)',
                borderRadius: 12, padding: '14px 16px',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)', letterSpacing: '-0.03em' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.15)', borderRadius: 999 }}>
            <span style={{ color: 'var(--fr-lime)' }}><IconShield /></span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fr-text-secondary)' }}>256-bit SSL · KYC Verified · RBI Compliant</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="fr-auth-form-panel">
        <div className="fr-auth-card">
          <div style={{ marginBottom: 32 }}>
            <h2 className="fr-auth-title">Welcome back</h2>
            <p className="fr-auth-subtitle">Sign in to continue trading</p>
          </div>

          {error && (
            <div className="fr-alert fr-alert--error" style={{ marginBottom: 20 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="fr-auth-form">
            <div className="fr-field">
              <label className="fr-field__label">Email address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fr-text-tertiary)', pointerEvents: 'none' }}><IconMail /></span>
                <input
                  type="email" className="fr-field__input" style={{ paddingLeft: 42 }}
                  placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} autoComplete="email" required
                />
              </div>
            </div>

            <div className="fr-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label className="fr-field__label" style={{ marginBottom: 0 }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: 'var(--fr-lime)', textDecoration: 'none', fontWeight: 600 }}>Forgot?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fr-text-tertiary)', pointerEvents: 'none' }}><IconLock /></span>
                <input
                  type={showPass ? 'text' : 'password'} className="fr-field__input"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  placeholder="Enter your password" value={password}
                  onChange={e => setPassword(e.target.value)} autoComplete="current-password" required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fr-text-tertiary)', padding: 0, display: 'flex' }}>
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="fr-btn fr-btn--primary fr-btn--lg fr-btn--full" style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" />Signing in…</> : <>Sign in <IconArrow /></>}
            </button>
          </form>

          <div style={{ margin: '28px 0', borderTop: '1px solid var(--fr-border-subtle)' }} />

          <p className="fr-auth-footer">
            No account?{' '}
            <Link href="/register" style={{ color: 'var(--fr-lime)', fontWeight: 700 }}>Create one free →</Link>
          </p>
          <p style={{ marginTop: 12, textAlign: 'center', fontSize: 13 }}>
            <Link href="/" style={{ color: 'var(--fr-text-tertiary)', textDecoration: 'none' }}>← Back to SwapINR</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
