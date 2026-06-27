'use client';

import { useEffect, useRef, useState } from 'react';

interface PhoneVerifyModalProps {
  currentPhone?: string;
  onVerified: (phone: string) => void;
  onClose: () => void;
}

type Step = 'input' | 'otp' | 'done';

export function PhoneVerifyModal({ currentPhone = '', onVerified, onClose }: PhoneVerifyModalProps) {
  const [step,        setStep]        = useState<Step>('input');
  const [phone,       setPhone]       = useState(currentPhone.replace(/\D/g,'').replace(/^91/,''));
  const [otp,         setOtp]         = useState(['','','','','','']);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [countdown,   setCountdown]   = useState(0);
  const otpRefs       = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef  = useRef<HTMLDivElement>(null);

  /* countdown timer for resend */
  useEffect(() => {
    if (!countdown) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function sendOtp() {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) { setError('Enter a valid 10-digit Indian mobile number'); return; }
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      });
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
    const digits = phone.replace(/\D/g, '');
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, otp: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Verification failed.');
      setStep('done');
      onVerified(digits);
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
      <div ref={containerRef} style={{ width: '100%', maxWidth: 420, background: '#0d0d0f', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,rgba(204,255,0,0.3),#CCFF00,rgba(204,255,0,0.3))' }} />
        <div style={{ padding: '24px 24px 28px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0 }}>
              {step === 'done' ? 'Phone Verified!' : step === 'otp' ? 'Enter OTP' : 'Verify Mobile Number'}
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

          {/* Step: input */}
          {step === 'input' && (
            <>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 20px', lineHeight: 1.6 }}>
                We'll text a one-time verification code to this number to confirm it's yours.
              </p>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Mobile Number
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ padding: '13px 14px', fontSize: 15, fontWeight: 700, color: '#fff', borderRight: '1px solid rgba(255,255,255,0.09)', flexShrink: 0, userSelect: 'none' }}>
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                  placeholder="98765 43210"
                  maxLength={10}
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  style={{ flex: 1, padding: '13px 14px', background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#fff', fontFamily: 'inherit', letterSpacing: '0.05em' }}
                />
              </div>
              <button
                onClick={sendOtp} disabled={loading || phone.length !== 10}
                style={{ width: '100%', padding: '13px', borderRadius: 11, fontSize: 14, fontWeight: 800, border: 'none', cursor: loading || phone.length !== 10 ? 'not-allowed' : 'pointer', background: loading || phone.length !== 10 ? 'rgba(255,255,255,0.07)' : '#CCFF00', color: loading || phone.length !== 10 ? 'rgba(255,255,255,0.3)' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
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
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 6px', lineHeight: 1.6 }}>
                OTP sent to <span style={{ color: '#fff', fontWeight: 700 }}>+91 {phone}</span>
              </p>
              <button onClick={() => { setStep('input'); setOtp(['','','','','','']); setError(''); }} style={{ fontSize: 12, color: '#CCFF00', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20, fontWeight: 600 }}>
                ← Change number
              </button>

              <div style={{ display: 'flex', gap: '2.2%', marginBottom: 20 }} onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    style={{ flex: '1 1 0', minWidth: 0, maxWidth: 46, aspectRatio: '46 / 54', boxSizing: 'border-box', textAlign: 'center', fontSize: 22, fontWeight: 800, color: '#fff', background: d ? 'rgba(204,255,0,0.08)' : 'rgba(255,255,255,0.05)', border: `1px solid ${d ? 'rgba(204,255,0,0.35)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 10, outline: 'none', fontFamily: 'monospace', transition: 'all 0.15s', caretColor: '#CCFF00' }}
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

          {/* Step: done */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,229,160,0.08)', border: '2px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 14L11 21L24 8" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>+91 {phone} verified!</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 22px', lineHeight: 1.6 }}>Your mobile number has been verified and saved to your profile.</p>
              <button onClick={onClose} style={{ padding: '11px 24px', borderRadius: 11, background: '#CCFF00', color: '#000', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                Done →
              </button>
            </div>
          )}

        </div>
      </div>

      <style>{`@keyframes fr-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
