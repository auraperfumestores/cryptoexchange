'use client';

import { useRef, useState, useEffect } from 'react';

interface WalletOtpGateProps {
  phone: string;
  onVerified: () => void;
  onClose: () => void;
}

type Step = 'ready' | 'otp';

export function WalletOtpGate({ phone, onVerified, onClose }: WalletOtpGateProps) {
  const [step,      setStep]      = useState<Step>('ready');
  const [otp,       setOtp]       = useState(['','','','','','']);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!countdown) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function sendOtp() {
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/wallet-otp/send', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to send OTP. Please try again.');
      setStep('otp');
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter all 6 digits'); return; }
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/wallet-otp/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Verification failed.');
      onVerified();
    } catch (err: any) {
      setError(err?.message ?? 'Verification failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  function handleOtpChange(i: number, val: string) {
    const d = val.replace(/\D/g,'').slice(-1);
    const next = [...otp]; next[i] = d;
    setOtp(next);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (digits.length === 6) {
      setOtp(digits.split(''));
      otpRefs.current[5]?.focus();
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
    >
      <div style={{ width: '100%', maxWidth: 420, background: '#0d0d0f', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,rgba(204,255,0,0.3),#CCFF00,rgba(204,255,0,0.3))' }} />
        <div style={{ padding: '24px 24px 28px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0 }}>
              {step === 'otp' ? 'Enter OTP' : 'Confirm It’s You'}
            </h3>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#F87171' }}>
              {error}
            </div>
          )}

          {/* Step: ready */}
          {step === 'ready' && (
            <>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 20px', lineHeight: 1.6 }}>
                For your security, we'll text a one-time code to confirm it's you before connecting this wallet.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '13px 14px', marginBottom: 20 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>🇮🇳 +91 {phone}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#00E5A0', marginLeft: 'auto' }}>Verified ✓</span>
              </div>
              <button
                onClick={sendOtp} disabled={loading}
                style={{ width: '100%', padding: '13px', borderRadius: 11, fontSize: 14, fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(255,255,255,0.07)' : '#CCFF00', color: loading ? 'rgba(255,255,255,0.3)' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading
                  ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#000', borderRadius: '50%', animation: 'fr-spin 0.7s linear infinite' }} />Sending OTP…</>
                  : 'Send OTP →'}
              </button>
            </>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 20px', lineHeight: 1.6 }}>
                OTP sent to <span style={{ color: '#fff', fontWeight: 700 }}>+91 {phone}</span>
              </p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }} onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    style={{ width: 46, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 800, color: '#fff', background: d ? 'rgba(204,255,0,0.08)' : 'rgba(255,255,255,0.05)', border: `1px solid ${d ? 'rgba(204,255,0,0.35)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 10, outline: 'none', fontFamily: 'monospace', transition: 'all 0.15s', caretColor: '#CCFF00' }}
                  />
                ))}
              </div>

              <button
                onClick={verifyOtp} disabled={loading || otp.join('').length !== 6}
                style={{ width: '100%', padding: '13px', borderRadius: 11, fontSize: 14, fontWeight: 800, border: 'none', cursor: loading || otp.join('').length !== 6 ? 'not-allowed' : 'pointer', background: loading || otp.join('').length !== 6 ? 'rgba(255,255,255,0.07)' : '#CCFF00', color: loading || otp.join('').length !== 6 ? 'rgba(255,255,255,0.3)' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}
              >
                {loading
                  ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#000', borderRadius: '50%', animation: 'fr-spin 0.7s linear infinite' }} />Verifying…</>
                  : 'Verify OTP →'}
              </button>

              <div style={{ textAlign: 'center' }}>
                {countdown > 0 ? (
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Resend OTP in {countdown}s</span>
                ) : (
                  <button onClick={() => { setOtp(['','','','','','']); setError(''); sendOtp(); }} style={{ fontSize: 12, color: '#CCFF00', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Resend OTP
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </div>

      <style>{`@keyframes fr-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
