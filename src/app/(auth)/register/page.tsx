'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User, Envelope, Lock, Eye, EyeSlash, ArrowRight,
  CheckCircle, Star, CurrencyInr, Lightning, ArrowsLeftRight,
  Clock, Shield,
} from '@phosphor-icons/react';

const FEATURES = [
  { Icon: CurrencyInr,       text: 'Best USDT → INR rates — live inter-bank pricing' },
  { Icon: Lightning,         text: 'Settlement in under 15 min via UPI, IMPS, NEFT & RTGS' },
  { Icon: ArrowsLeftRight,   text: 'BEP-20, ERC-20, TRC-20 networks supported' },
  { Icon: Clock,             text: 'PRO members get under 8-min settlement' },
  { Icon: Shield,            text: 'On-chain verified · Zero hidden fees' },
];

const REVIEWERS = [
  { photo: '/testimonials/t1.jpg', name: 'Arjun' },
  { photo: '/testimonials/t2.jpg', name: 'Vikram' },
  { photo: '/testimonials/t3.jpg', name: 'Rohit' },
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
              <CheckCircle size={36} color="#CCFF00" weight="fill" />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--fr-text-primary)', marginBottom: 12, letterSpacing: '-0.02em' }}>You&apos;re in!</h2>
            <p style={{ fontSize: 15, color: 'var(--fr-text-secondary)', lineHeight: 1.7 }}>Account created successfully. Start trading USDT → INR at the best rates.</p>
          </div>
        </div>
        <div className="fr-auth-form-panel">
          <div className="fr-auth-card" style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={30} color="#CCFF00" weight="fill" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--fr-text-primary)', marginBottom: 10, letterSpacing: '-0.02em' }}>Check your inbox</h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--fr-text-secondary)', marginBottom: 28 }}>
              We sent a verification link to <strong style={{ color: 'var(--fr-lime)' }}>{email}</strong>.
              Click it to activate your account, then sign in.
            </p>
            <Link href="/login" className="fr-btn fr-btn--primary fr-btn--lg fr-btn--full">
              Go to sign in <ArrowRight size={16} weight="bold" />
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
            Join 3,000+ traders<br />
            already using{' '}
            <span style={{ color: 'var(--fr-lime)' }}>SwapINR</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--fr-text-secondary)', lineHeight: 1.75, marginBottom: 36 }}>
            Create your free account and start converting USDT to INR in minutes. No monthly fees, no lock-ins.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEATURES.map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color="#CCFF00" weight="fill" />
                </div>
                <span style={{ fontSize: 13, color: 'var(--fr-text-secondary)', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--fr-border-subtle)', borderRadius: 12 }}>
            <div style={{ display: 'flex' }}>
              {REVIEWERS.map(({ photo, name }, i) => (
                <img
                  key={name}
                  src={photo}
                  alt={name}
                  style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 15%', border: '2px solid var(--fr-dark-0)', marginLeft: i > 0 ? -9 : 0 }}
                />
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 2, color: '#F59E0B', marginBottom: 3 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={12} weight="fill" />)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fr-text-tertiary)' }}>Rated 4.9 by 1,000+ traders</div>
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
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fr-text-tertiary)', pointerEvents: 'none' }}><User size={16} /></span>
                <input type="text" className="fr-field__input" style={{ paddingLeft: 42 }} placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} autoComplete="name" required />
              </div>
            </div>

            <div className="fr-field">
              <label className="fr-field__label">Email address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fr-text-tertiary)', pointerEvents: 'none' }}><Envelope size={16} /></span>
                <input type="email" className="fr-field__input" style={{ paddingLeft: 42 }} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
              </div>
            </div>

            <div className="fr-field">
              <label className="fr-field__label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fr-text-tertiary)', pointerEvents: 'none' }}><Lock size={16} /></span>
                <input type={showPass ? 'text' : 'password'} className="fr-field__input" style={{ paddingLeft: 42, paddingRight: 42 }} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required minLength={8} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fr-text-tertiary)', padding: 0, display: 'flex' }}>
                  {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
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
              {loading ? <><span className="spinner" />Creating account…</> : <>Create free account <ArrowRight size={16} weight="bold" /></>}
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
