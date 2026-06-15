'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
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

  if (done) {
    return (
      <div className="auth-bg" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: 420, padding: 40, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(0,229,160,0.12)', border: '1px solid rgba(0,229,160,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle style={{ width: 30, height: 30, color: '#00E5A0' }} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>Check your inbox</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(148,163,184,0.75)', marginBottom: 28 }}>
            We sent a verification link to{' '}
            <strong style={{ color: '#fff' }}>{email}</strong>.
            Click it to activate your account, then sign in.
          </p>
          <Link href="/login" className="btn-primary" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
            Go to sign in <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(148,163,184,0.4)' }}>
            Didn&apos;t receive it? Check spam or{' '}
            <button onClick={() => setDone(false)} style={{ color: '#4D9FFF', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>try again</button>.
          </p>
        </div>
      </div>
    );
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#F87171', '#FBBF24', '#00E5A0'];

  return (
    <div className="auth-bg" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      {/* Ambient glows */}
      <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(107,33,255,0.22)', top: '-100px', right: '-100px' }} />
      <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(26,63,255,0.2)', bottom: '-80px', left: '-60px' }} />

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
          <p style={{ marginTop: 8, fontSize: 14, color: 'rgba(148,163,184,0.7)' }}>Create your free account</p>
        </div>

        <div className="glass-card" style={{ padding: 36 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 24, letterSpacing: '-0.02em' }}>Get started</h1>

          {error && (
            <div style={{ marginBottom: 16, borderRadius: 12, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.1)', padding: '12px 16px', fontSize: 14, color: '#F87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label">Full name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(148,163,184,0.5)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="field-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(148,163,184,0.5)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  className="field-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(148,163,184,0.5)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="field-input"
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', padding: 0, display: 'flex' }}
                >
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
              {password.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{ height: 3, flex: 1, borderRadius: 999, background: strength >= i ? strengthColor[strength] : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: 4, width: '100%', paddingTop: 14, paddingBottom: 14 }}
            >
              {loading
                ? <><span className="spinner" />Creating account…</>
                : <>Create account <ArrowRight style={{ width: 16, height: 16 }} /></>
              }
            </button>
          </form>

          <p style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: 'rgba(148,163,184,0.4)', lineHeight: 1.6 }}>
            By creating an account you agree to our{' '}
            <a href="#" style={{ color: '#4D9FFF', textDecoration: 'none' }}>Terms</a> &amp;{' '}
            <a href="#" style={{ color: '#4D9FFF', textDecoration: 'none' }}>Privacy Policy</a>.
          </p>

          <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(148,163,184,0.7)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#4D9FFF', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <Link href="/" style={{ color: 'rgba(148,163,184,0.45)', textDecoration: 'none' }}>← Back to SwapINR</Link>
        </p>
      </div>
    </div>
  );
}
