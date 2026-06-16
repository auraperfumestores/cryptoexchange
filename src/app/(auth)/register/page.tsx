'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function IconUser()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 13C3 10.2 5.2 8 8 8C10.8 8 13 10.2 13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconMail()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 6L8 9.5L14 6" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function IconLock()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7V5C5 3.3 6.3 2 8 2C9.7 2 11 3.3 11 5V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconEye()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8C1 8 3.5 4 8 4C12.5 4 15 8 15 8C15 8 12.5 12 8 12C3.5 12 1 8 1 8Z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function IconEyeOff(){ return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2L14 14M6.5 6.6C6.2 7 6 7.5 6 8C6 9.1 6.9 10 8 10C8.5 10 9 9.8 9.4 9.5M4.3 4.4C2.9 5.3 2 7 2 7C2 7 4.5 11 8 11C9.2 11 10.3 10.6 11.2 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconArrow() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconCheck({ size = 30 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 30 30" fill="none"><path d="M6 15L12 21L24 9" stroke="var(--fr-lime)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconStar()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L9.8 5.8H14.5L10.6 8.4L12.1 12.8L8 10.1L3.9 12.8L5.4 8.4L1.5 5.8H6.2L8 1.5Z" fill="currentColor"/></svg>; }

const FEATURES = [
  'Best USDT → INR rates in India',
  'Settle directly to UPI or bank',
  'BEP-20, ERC-20, TRC-20 networks',
  'Trades confirmed in under 15 minutes',
  'No hidden fees, transparent pricing',
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Registration failed. Please try again.'); return; }
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'var(--fr-text-danger)', 'var(--fr-text-warning)', 'var(--fr-lime)'];

  if (done) {
    return (
      <div className="fr-auth-page">
        <div className="fr-auth-visual">
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Cpolygon points='6,1 11,11 1,11' fill='%23CCFF00' opacity='0.05'/%3E%3C/svg%3E\")", backgroundSize: '12px 12px' }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(204,255,0,0.1)' }}>
              <IconCheck size={36} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--fr-text-primary)', marginBottom: 12, letterSpacing: '-0.02em' }}>You&apos;re in!</h2>
            <p style={{ fontSize: 15, color: 'var(--fr-text-secondary)', lineHeight: 1.7 }}>Account created successfully. Start trading USDT → INR at the best rates.</p>
          </div>
        </div>
        <div className="fr-auth-form-panel">
          <div className="fr-auth-card" style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <IconCheck size={30} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--fr-text-primary)', marginBottom: 10, letterSpacing: '-0.02em' }}>Check your inbox</h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--fr-text-secondary)', marginBottom: 28 }}>
              We sent a verification link to <strong style={{ color: 'var(--fr-lime)' }}>{email}</strong>.
              Click it to activate your account, then sign in.
            </p>
            <Link href="/login" className="fr-btn fr-btn--primary fr-btn--lg fr-btn--full">
              Go to sign in <IconArrow />
            </Link>
            <p style={{ marginTop: 16, fontSize: 12, color: 'var(--fr-text-disabled)' }}>
              Didn&apos;t receive it? Check spam or{' '}
              <button onClick={() => setDone(false)} style={{ color: 'var(--fr-lime)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>try again</button>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fr-auth-page">

      {/* ── Left Visual Panel ── */}
      <div className="fr-auth-visual">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Cpolygon points='6,1 11,11 1,11' fill='%23CCFF00' opacity='0.05'/%3E%3C/svg%3E\")", backgroundSize: '12px 12px' }} />
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(204,255,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
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

          <h1 style={{ fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.18, marginBottom: 16 }}>
            Join 10,000+ traders<br />
            already using{' '}
            <span style={{ color: 'var(--fr-lime)' }}>SwapINR</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--fr-text-secondary)', lineHeight: 1.75, marginBottom: 40 }}>
            Create your free account and start converting crypto to INR in minutes. No monthly fees, no lock-ins.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {FEATURES.map(f => (
              <div key={f} className="fr-academy-feature">
                <div className="fr-academy-check">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--fr-border-subtle)', borderRadius: 12 }}>
            <div style={{ display: 'flex' }}>
              {['#CCFF00','#00D4C8','#9B5DE5','#F72585'].map((c, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid var(--fr-dark-0)', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#000' }}>{String.fromCharCode(65+i)}</div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 1, color: '#F59E0B', fontSize: 12, marginBottom: 2 }}>
                {[1,2,3,4,5].map(i => <IconStar key={i} />)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fr-text-tertiary)' }}>Rated 4.9 by 10,000+ traders</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="fr-auth-form-panel">
        <div className="fr-auth-card">
          <div style={{ marginBottom: 32 }}>
            <h2 className="fr-auth-title">Create your account</h2>
            <p className="fr-auth-subtitle">Free forever · No credit card required</p>
          </div>

          {error && <div className="fr-alert fr-alert--error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} className="fr-auth-form">
            <div className="fr-field">
              <label className="fr-field__label">Full name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fr-text-tertiary)', pointerEvents: 'none' }}><IconUser /></span>
                <input type="text" className="fr-field__input" style={{ paddingLeft: 42 }} placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} autoComplete="name" required />
              </div>
            </div>

            <div className="fr-field">
              <label className="fr-field__label">Email address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fr-text-tertiary)', pointerEvents: 'none' }}><IconMail /></span>
                <input type="email" className="fr-field__input" style={{ paddingLeft: 42 }} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
              </div>
            </div>

            <div className="fr-field">
              <label className="fr-field__label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fr-text-tertiary)', pointerEvents: 'none' }}><IconLock /></span>
                <input type={showPass ? 'text' : 'password'} className="fr-field__input" style={{ paddingLeft: 42, paddingRight: 42 }} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required minLength={8} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fr-text-tertiary)', padding: 0, display: 'flex' }}>
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {password.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ height: 3, flex: 1, borderRadius: 999, background: strength >= i ? strengthColor[strength] : 'var(--fr-border-default)', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="fr-btn fr-btn--primary fr-btn--lg fr-btn--full" style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" />Creating account…</> : <>Create free account <IconArrow /></>}
            </button>
          </form>

          <p style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: 'var(--fr-text-disabled)', lineHeight: 1.6 }}>
            By signing up you agree to our{' '}
            <a href="#" style={{ color: 'var(--fr-lime)', textDecoration: 'none' }}>Terms</a> &amp;{' '}
            <a href="#" style={{ color: 'var(--fr-lime)', textDecoration: 'none' }}>Privacy Policy</a>.
          </p>

          <div style={{ margin: '24px 0', borderTop: '1px solid var(--fr-border-subtle)' }} />

          <p className="fr-auth-footer">
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--fr-lime)', fontWeight: 700 }}>Sign in →</Link>
          </p>
          <p style={{ marginTop: 12, textAlign: 'center', fontSize: 13 }}>
            <Link href="/" style={{ color: 'var(--fr-text-tertiary)', textDecoration: 'none' }}>← Back to SwapINR</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
