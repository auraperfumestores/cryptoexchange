'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StaticMesh from '@/components/ui/static-mesh';
import { pageLoader } from '@/store/page-loader-store';
import {
  Envelope, Lock, Eye, EyeSlash, ArrowRight, Shield,
  CurrencyInr, Lightning, ArrowsLeftRight, Clock, Star,
} from '@phosphor-icons/react';

const FEATURES = [
  { Icon: CurrencyInr,       text: 'Live inter-bank USDT → INR rate, updated every minute' },
  { Icon: Lightning,         text: 'Settlement in under 15 min via UPI, IMPS, NEFT & RTGS' },
  { Icon: ArrowsLeftRight,   text: 'BEP-20, ERC-20 and TRC-20 networks — all supported' },
  { Icon: Clock,             text: 'PRO members get under 8-min settlement + 0.3% better rate' },
  { Icon: Shield,            text: 'On-chain verified · AES-256 encrypted · Zero hidden fees' },
];

const REVIEWERS = [
  { photo: '/testimonials/t1.jpg', name: 'Arjun' },
  { photo: '/testimonials/t2.jpg', name: 'Vikram' },
  { photo: '/testimonials/t3.jpg', name: 'Rohit' },
];

const TRUST_STATS = [
  { value: '₹58L+',   label: 'Volume Processed' },
  { value: '3.1K+',   label: 'Verified Traders' },
  { value: '< 15 min',label: 'Avg Settlement' },
  { value: '4.9★',    label: 'Trader Rating' },
];

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router   = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setUnverified(false);
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    pageLoader.show();
    try {
      const result = await signIn('credentials', { redirect: false, email, password });
      if (result?.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          setError('Please verify your email before signing in. Check your inbox.');
          setUnverified(true);
        } else if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password.');
        } else {
          // Anything other than a real credentials rejection (e.g. CSRF/host mismatch,
          // a transient DB error) — don't tell the user their password is wrong when it isn't.
          console.error('[login] unexpected signIn error:', result.error);
          setError('Something went wrong signing you in. Please try again in a moment.');
        }
        pageLoader.hide();
        return;
      }
      const sessionRes  = await fetch('/api/auth/me');
      const sessionData = await sessionRes.json();
      // Only honor callbackUrl if it's a same-site relative path — prevents open-redirect abuse.
      const safeCallback = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : null;
      // Leave the loader showing — it fades out automatically once the
      // pathname actually changes, so it covers the route-transition delay too.
      router.push(safeCallback ?? (sessionData.data?.role === 'admin' ? '/admin' : '/dashboard'));
    } catch {
      setError('Something went wrong. Please try again.');
      pageLoader.hide();
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!email || resending || resendCooldown > 0) return;
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResendCooldown(data.cooldownSeconds ?? 60);
      setError('Verification email sent — check your inbox.');
    } catch {
      setError('Could not resend right now. Please try again in a moment.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="fr-auth-page">

      {/* ── Left Visual Panel ── */}
      <div className="fr-auth-visual">
        {/* Triangle dot pattern — matches register */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Cpolygon points='6,1 11,11 1,11' fill='%23CCFF00' opacity='0.05'/%3E%3C/svg%3E\")",
          backgroundSize: '12px 12px',
        }} />
        {/* Lime radial glow */}
        <div style={{
          position: 'absolute', top: -100, left: -100,
          width: 400, height: 400, borderRadius: '50%',
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
              Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span>
            </span>
          </Link>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.18, marginBottom: 16 }}>
            India&apos;s fastest<br />
            USDT → INR<br />
            <span style={{ color: 'var(--fr-lime)' }}>settlement platform.</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--fr-text-secondary)', lineHeight: 1.75, marginBottom: 36 }}>
            Live rates updated every minute. Sell USDT and receive INR directly to your UPI or bank account — no middlemen, no hidden fees.
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
        <StaticMesh cols={22} rows={14} opacity={0.25} lineColor="204,255,0" waveAmp={55} waveT={1.1} diagonals className="lp-auth-mesh" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '38%', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 60%)', maskImage: 'linear-gradient(to bottom, transparent 0%, black 60%)' }} />
        <div className="fr-auth-card">
          <div style={{ marginBottom: 32 }}>
            <h2 className="fr-auth-title">Welcome back</h2>
            <p className="fr-auth-subtitle">Sign in to your SwappINR account</p>
          </div>

          {error && (
            <div className="fr-alert fr-alert--error" style={{ marginBottom: unverified ? 10 : 20 }}>{error}</div>
          )}

          {unverified && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending || resendCooldown > 0}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', marginBottom: 20, padding: '9px 0',
                background: 'none', border: '1px solid var(--fr-border-subtle)', borderRadius: 10,
                color: resendCooldown > 0 ? 'var(--fr-text-disabled)' : 'var(--fr-lime)',
                fontSize: 13, fontWeight: 700, cursor: resending || resendCooldown > 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {resending
                ? <><span className="spinner" />Sending…</>
                : resendCooldown > 0
                  ? `Resend verification email in ${resendCooldown}s`
                  : 'Resend verification email'}
            </button>
          )}

          <form onSubmit={handleSubmit} className="fr-auth-form">
            <div className="fr-field">
              <label className="fr-field__label">Email address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fr-text-tertiary)', pointerEvents: 'none' }}>
                  <Envelope size={16} />
                </span>
                <input
                  type="email" className="fr-field__input" style={{ paddingLeft: 42 }}
                  value={email}
                  onChange={e => setEmail(e.target.value)} autoComplete="email" required
                />
              </div>
            </div>

            <div className="fr-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label className="fr-field__label" style={{ marginBottom: 0 }}>Password</label>
                <a href="/forgot-password" style={{ fontSize: 12, color: 'var(--fr-lime)', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fr-text-tertiary)', pointerEvents: 'none' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPass ? 'text' : 'password'} className="fr-field__input"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)} autoComplete="current-password" required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fr-text-tertiary)', padding: 0, display: 'flex' }}>
                  {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="fr-btn fr-btn--primary fr-btn--lg fr-btn--full" style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" />Signing in…</> : <>Sign in <ArrowRight size={16} weight="bold" /></>}
            </button>
          </form>

          {/* Mini stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 24 }}>
            {TRUST_STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '10px 4px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--fr-border-subtle)', borderRadius: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)', letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 9, color: 'var(--fr-text-disabled)', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ margin: '24px 0', borderTop: '1px solid var(--fr-border-subtle)' }} />

          <p className="fr-auth-footer">
            No account?{' '}
            <Link href="/register" style={{ color: 'var(--fr-lime)', fontWeight: 700 }}>Create one free →</Link>
          </p>
          <p style={{ marginTop: 12, textAlign: 'center', fontSize: 13 }}>
            <Link href="/" style={{ color: 'var(--fr-text-tertiary)', textDecoration: 'none' }}>← Back to SwappINR</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
