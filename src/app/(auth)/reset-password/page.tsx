'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StaticMesh from '@/components/ui/static-mesh';

function StrengthBar({ password }: { password: string }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const color = ['', '#F87171', '#FBBF24', '#60A5FA', '#00E5A0'][score];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= score ? color : 'rgba(255,255,255,0.08)', transition: 'all 0.2s' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 700 }}>{label}</span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token') ?? '';

  const [valid,     setValid]     = useState<boolean | null>(null);
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!token) { setValid(false); return; }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then(r => r.json())
      .then(d => setValid(d.valid))
      .catch(() => setValid(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
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
              Swap<span style={{ color: '#CCFF00' }}>INR</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg,rgba(204,255,0,0.3),#CCFF00,rgba(204,255,0,0.3))' }} />

          <div style={{ padding: '36px 32px' }}>

            {/* Loading validation */}
            {valid === null && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 24, height: 24, border: '2.5px solid rgba(255,255,255,0.1)', borderTopColor: '#CCFF00', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Validating reset link…</p>
              </div>
            )}

            {/* Invalid token */}
            {valid === false && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#F87171" strokeWidth="1.6"/><path d="M9 9L15 15M15 9L9 15" stroke="#F87171" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 10px' }}>Link expired or invalid</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px', lineHeight: 1.6 }}>
                  This password reset link has expired or already been used. Please request a new one.
                </p>
                <Link href="/forgot-password"
                  style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 12, background: '#CCFF00', color: '#000', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
                  Request new link →
                </Link>
              </div>
            )}

            {/* Done */}
            {done && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,229,160,0.08)', border: '2px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 14L11 21L24 8" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 10px' }}>Password updated!</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  Your password has been reset successfully. Redirecting you to sign in…
                </p>
              </div>
            )}

            {/* Form */}
            {valid === true && !done && (
              <>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#CCFF00" strokeWidth="1.6"/><path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" stroke="#CCFF00" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="#CCFF00"/></svg>
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 8px', textAlign: 'center', letterSpacing: '-0.03em' }}>Set new password</h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 28px', textAlign: 'center', lineHeight: 1.6 }}>
                  Choose a strong password you haven't used before.
                </p>

                {error && (
                  <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '11px 14px', marginBottom: 18, fontSize: 13, color: '#F87171' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>New password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPass ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters" required minLength={8}
                        style={{ width: '100%', padding: '13px 48px 13px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, fontSize: 15, color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0 }}>
                        {showPass
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3L21 21M9.88 9.88A3 3 0 0 0 14.12 14.12M10.73 5.08A10 10 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12S5 19 12 19a9.74 9.74 0 0 0 5.39-1.61" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 12S5 5 12 5s10 7 10 7-3 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>}
                      </button>
                    </div>
                    <StrengthBar password={password} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Confirm password</label>
                    <input
                      type={showPass ? 'text' : 'password'} value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat new password" required
                      style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${confirm && password !== confirm ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.10)'}`, borderRadius: 12, fontSize: 15, color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                    {confirm && password !== confirm && <p style={{ fontSize: 11, color: '#F87171', margin: '6px 0 0' }}>Passwords don't match</p>}
                  </div>

                  <button
                    type="submit" disabled={loading}
                    style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(255,255,255,0.07)' : '#CCFF00', color: loading ? 'rgba(255,255,255,0.3)' : '#000', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        Updating password…
                      </>
                    ) : 'Update password →'}
                  </button>
                </form>
              </>
            )}

            {valid !== null && (
              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                <Link href="/login" style={{ color: '#CCFF00', fontWeight: 700, textDecoration: 'none' }}>← Back to sign in</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
