'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';

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
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          setError('Please verify your email before signing in. Check your inbox.');
        } else {
          setError('Invalid email or password.');
        }
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
    <div className="auth-bg" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      {/* Ambient glows */}
      <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(26,63,255,0.25)', top: '-120px', left: '50%', transform: 'translateX(-50%)' }} />
      <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(107,33,255,0.18)', bottom: '-60px', right: '-80px' }} />

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
          <p style={{ marginTop: 8, fontSize: 14, color: 'rgba(148,163,184,0.7)' }}>Sign in to your account</p>
        </div>

        <div className="glass-card" style={{ padding: 36 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 24, letterSpacing: '-0.02em' }}>Welcome back</h1>

          {error && (
            <div style={{ marginBottom: 16, borderRadius: 12, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.1)', padding: '12px 16px', fontSize: 14, color: '#F87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <label className="field-label" style={{ marginBottom: 0 }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: '#4D9FFF', textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(148,163,184,0.5)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="field-input"
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', padding: 0, display: 'flex' }}
                >
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: 4, width: '100%', paddingTop: 14, paddingBottom: 14 }}
            >
              {loading
                ? <><span className="spinner" />Signing in…</>
                : <>Sign in <ArrowRight style={{ width: 16, height: 16 }} /></>
              }
            </button>
          </form>

          <div style={{ margin: '24px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(148,163,184,0.7)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#4D9FFF', fontWeight: 700, textDecoration: 'none' }}>
              Create one free
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
