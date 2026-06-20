'use client';

import { useEffect, useRef, useState } from 'react';
import { firebaseAuth } from '@/lib/firebase/client';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { TokenIcon } from './token-icon';

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Network   = 'BEP20' | 'ERC20' | 'TRC20';
type PayMethod = 'UPI' | 'IMPS' | 'RTGS' | 'NEFT' | 'CDM' | 'CASH';
type SellStep  =
  | 'loading'
  | 'notLoggedIn'
  | 'phoneGate'
  | 'phoneOtp'
  | 'walletGate'
  | 'payMethod'
  | 'upiDetails'
  | 'bankDetails'
  | 'goldOnly'
  | 'review';

export interface SellFlowProps {
  network:     Network;
  usdtAmount:  number;
  inrAmount:   string;
  rate:        number;
  onClose:     () => void;
  onSuccess?:  () => void;
}

/* ─── Constants ─────────────────────────────────────────────────────────── */

const NET_CHAIN: Record<Network, number> = { ERC20: 1, BEP20: 56, TRC20: 195 };
const NET_LABEL: Record<Network, string> = {
  BEP20: 'BNB Smart Chain',
  ERC20: 'Ethereum Mainnet',
  TRC20: 'TRON Network',
};
const NET_COLOR: Record<Network, string> = {
  BEP20: '#F3BA2F',
  ERC20: '#818CF8',
  TRC20: '#F87171',
};

const SUPPORT_URL = 'https://wa.me/919999999999';

const C = {
  bg:        '#0a0a0c',
  card:      '#111113',
  lime:      '#CCFF00',
  text:      '#FFFFFF',
  sub:       'rgba(255,255,255,0.52)',
  dim:       'rgba(255,255,255,0.25)',
  faint:     'rgba(255,255,255,0.08)',
  border:    'rgba(255,255,255,0.08)',
  borderMd:  'rgba(255,255,255,0.13)',
  success:   '#00E5A0',
  danger:    '#F87171',
  gold:      '#FBBF24',
  mono:      "'JetBrains Mono','Fira Code',monospace",
};

const PAY_METHODS: { id: PayMethod; label: string; desc: string; icon: string; gold?: boolean }[] = [
  { id: 'UPI',  label: 'UPI',  desc: 'Instant · 24×7',        icon: 'upi'  },
  { id: 'IMPS', label: 'IMPS', desc: 'Instant · 24×7',        icon: 'bank' },
  { id: 'RTGS', label: 'RTGS', desc: '₹2 L+ · Business hrs',  icon: 'bank' },
  { id: 'NEFT', label: 'NEFT', desc: 'Up to 2 hrs · 24×7',    icon: 'bank' },
  { id: 'CDM',  label: 'CDM',  desc: 'Cash Deposit Machine',   icon: 'cdm',  gold: true },
  { id: 'CASH', label: 'CASH', desc: 'Physical cash handover', icon: 'cash', gold: true },
];

/* ─── Inline SVG icons ───────────────────────────────────────────────────── */

function IcoClose() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IcoCheck({ size = 16, color = C.success }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 8L6.5 12.5L14 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcoBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcoWallet() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="6" width="18" height="13" rx="2.5" stroke={C.lime} strokeWidth="1.5"/>
      <path d="M6 6V4.5C6 3.4 6.9 2.5 8 2.5H14C15.1 2.5 16 3.4 16 4.5V6" stroke={C.lime} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="15.5" cy="12.5" r="1.5" fill={C.lime}/>
    </svg>
  );
}

function IcoPhone() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="5" y="2" width="12" height="18" rx="2.5" stroke={C.lime} strokeWidth="1.5"/>
      <circle cx="11" cy="17" r="1" fill={C.lime}/>
      <path d="M8 5H14" stroke={C.lime} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IcoUpi() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcoBank() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 8H18M4 8V15M8 8V15M12 8V15M16 8V15M3 15H17M10 3L18 8H2L10 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcoCrown() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 16H19M3 16L5 8L9 12L11 6L13 12L17 8L19 16H3Z" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="11" cy="6" r="1.5" fill={C.gold}/>
    </svg>
  );
}

function IcoSupport() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 5.5C8 5.5 6 5.8 6 7.5C6 8.5 7 9 8 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.8" fill="currentColor"/>
    </svg>
  );
}

function IcoTrustWallet() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L3 5V10C3 13.9 6 17.4 10 18.5C14 17.4 17 13.9 17 10V5L10 2Z" fill="#3375BB"/>
      <path d="M10 2L3 5V10C3 13.9 6 17.4 10 18.5V2Z" fill="#5198FF"/>
      <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Spinner ────────────────────────────────────────────────────────────── */
function Spinner({ size = 18, color = C.lime }: { size?: number; color?: string }) {
  return (
    <>
      <div style={{ width: size, height: size, borderRadius: '50%', border: `2px solid rgba(204,255,0,0.15)`, borderTopColor: color, animation: 'sf-spin 0.7s linear infinite', flexShrink: 0 }} />
      <style>{`@keyframes sf-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

/* ─── Field ──────────────────────────────────────────────────────────────── */
function Field({
  label, value, onChange, placeholder, type = 'text', maxLength, hint, suffix, prefix, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; maxLength?: number;
  hint?: string; suffix?: React.ReactNode; prefix?: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.dim, marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        {prefix && (
          <div style={{ padding: '0 12px', fontSize: 13, fontWeight: 700, color: C.dim, borderRight: `1px solid ${C.border}`, flexShrink: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>
            {prefix}
          </div>
        )}
        <input
          type={type} value={value} maxLength={maxLength}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{ flex: 1, padding: '12px 14px', background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: disabled ? C.dim : C.text, fontFamily: 'inherit' }}
        />
        {suffix && <div style={{ padding: '0 12px', flexShrink: 0 }}>{suffix}</div>}
      </div>
      {hint && <p style={{ fontSize: 11, color: C.dim, margin: '5px 0 0', lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

/* ─── Progress dots ──────────────────────────────────────────────────────── */
function ProgressDots({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
      {steps.map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6,
          height: 6,
          borderRadius: 3,
          background: i === current ? C.lime : i < current ? 'rgba(204,255,0,0.35)' : C.faint,
          transition: 'all 0.25s',
        }} />
      ))}
    </div>
  );
}

/* ─── OTP input row ──────────────────────────────────────────────────────── */
function OtpRow({ otp, setOtp, onPaste }: {
  otp: string[];
  setOtp: (v: string[]) => void;
  onPaste: (e: React.ClipboardEvent) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} onPaste={onPaste}>
      {otp.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, '').slice(-1);
            const next = [...otp]; next[i] = v; setOtp(next);
            if (v && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={e => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus(); }}
          style={{
            width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 800,
            color: C.text, background: d ? 'rgba(204,255,0,0.07)' : C.faint,
            border: `1px solid ${d ? 'rgba(204,255,0,0.3)' : C.border}`,
            borderRadius: 10, outline: 'none', fontFamily: C.mono, transition: 'all 0.15s', caretColor: C.lime,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function SellFlowModal({ network, usdtAmount, inrAmount, rate, onClose, onSuccess }: SellFlowProps) {
  const [step,         setStep]         = useState<SellStep>('loading');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  /* phone */
  const [phone,        setPhone]        = useState('');
  const [otp,          setOtp]          = useState(['','','','','','']);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const confirmRef    = useRef<ConfirmationResult | null>(null);
  const recaptchaRef  = useRef<RecaptchaVerifier   | null>(null);

  /* payment */
  const [payMethod,    setPayMethod]    = useState<PayMethod | null>(null);

  /* UPI */
  const [upiId,        setUpiId]        = useState('');
  const [upiStatus,    setUpiStatus]    = useState<null | { verified: boolean; bankName?: string; message?: string }>(null);
  const [upiChecking,  setUpiChecking]  = useState(false);

  /* Bank */
  const [benefName,    setBenefName]    = useState('');
  const [accountNo,    setAccountNo]    = useState('');
  const [accountNo2,   setAccountNo2]   = useState('');
  const [ifsc,         setIfsc]         = useState('');
  const [bankPhone,    setBankPhone]    = useState('');

  /* ── countdown ── */
  useEffect(() => {
    if (!otpCountdown) return;
    const t = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCountdown]);

  /* ── initial check ── */
  useEffect(() => {
    void runInitialCheck();
  }, []);

  async function runInitialCheck() {
    setStep('loading');
    try {
      const [profileRes, walletRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/wallets'),
      ]);

      if (profileRes.status === 401) { setStep('notLoggedIn'); return; }
      const profile = await profileRes.json();
      const wallets = walletRes.ok ? (await walletRes.json()).data ?? [] : [];

      const phoneVerified = profile?.phoneVerified ?? false;
      if (!phoneVerified) { setStep('phoneGate'); return; }

      const chainId = NET_CHAIN[network];
      const hasWallet = wallets.some((w: any) => w.chainId === chainId && w.isVerified);
      if (!hasWallet) { setStep('walletGate'); return; }

      setStep('payMethod');
    } catch {
      setStep('notLoggedIn');
    }
  }

  /* ── phone OTP flow ── */
  function resetRecaptcha() {
    try { recaptchaRef.current?.clear(); } catch {}
    recaptchaRef.current = null;
  }

  function initRecaptcha() {
    resetRecaptcha();
    recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, 'sf-recaptcha', { size: 'invisible' });
  }

  async function sendOtp() {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) { setError('Enter a valid 10-digit Indian mobile number'); return; }
    setError(''); setLoading(true);
    try {
      initRecaptcha();
      const res = await signInWithPhoneNumber(firebaseAuth, `+91${digits}`, recaptchaRef.current!);
      confirmRef.current = res;
      setStep('phoneOtp');
      setOtpCountdown(30);
    } catch (e: any) {
      resetRecaptcha();
      const code: string = e?.code ?? '';
      const msg: string  = e?.message ?? '';
      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setError('This domain is not authorised for Firebase phone auth. Add it in Firebase Console → Authentication → Authorized domains.');
      } else if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else if (code === 'auth/invalid-phone-number' || msg.includes('invalid-phone-number')) {
        setError('Invalid phone number. Enter a valid 10-digit Indian mobile number.');
      } else if (code === 'auth/captcha-check-failed' || msg.includes('reCAPTCHA')) {
        setError('reCAPTCHA check failed. Please refresh the page and try again.');
      } else {
        setError(`Failed to send OTP (${code || 'unknown error'}). Try again or contact support.`);
      }
    } finally { setLoading(false); }
  }

  async function verifyOtp() {
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter all 6 digits'); return; }
    if (!confirmRef.current) { setError('Session expired. Resend OTP.'); return; }
    setError(''); setLoading(true);
    try {
      await confirmRef.current.confirm(code);
      const digits = phone.replace(/\D/g, '');
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, phoneVerified: true }),
      });
      if (!res.ok) throw new Error('Failed to save phone');
      /* re-check wallet */
      const chainId = NET_CHAIN[network];
      const wRes  = await fetch('/api/wallets');
      const wData = wRes.ok ? (await wRes.json()).data ?? [] : [];
      const hasWallet = wData.some((w: any) => w.chainId === chainId && w.isVerified);
      setStep(hasWallet ? 'payMethod' : 'walletGate');
    } catch (e: any) {
      setError(e?.message?.includes('Invalid') || e?.message?.includes('invalid-verification-code')
        ? 'Wrong OTP. Try again.'
        : e?.message ?? 'Verification failed.');
    } finally { setLoading(false); }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) setOtp(digits.split(''));
  }

  /* ── UPI verify ── */
  async function verifyUpi() {
    if (!upiId.trim()) return;
    setUpiChecking(true); setUpiStatus(null);
    try {
      const res  = await fetch('/api/upi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId: upiId.trim() }),
      });
      const data = await res.json();
      setUpiStatus(data.valid ? { verified: data.verified, bankName: data.bankName, message: data.message } : null);
      if (!data.valid) setError(data.error ?? 'Invalid UPI ID');
    } catch { setError('UPI verification failed'); }
    finally { setUpiChecking(false); }
  }

  /* ── bank validation ── */
  function bankDetailsValid(): string | null {
    if (!benefName.trim())           return 'Beneficiary name is required';
    if (accountNo.length < 9)        return 'Enter a valid account number';
    if (accountNo !== accountNo2)    return 'Account numbers do not match';
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) return 'Enter a valid IFSC code (e.g. HDFC0001234)';
    if (payMethod === 'IMPS' && bankPhone.replace(/\D/g,'').length !== 10) return 'Enter registered mobile number for IMPS';
    return null;
  }

  function handlePayMethodSelect(m: PayMethod) {
    setPayMethod(m);
    setError('');
    if (m === 'CDM' || m === 'CASH') { setStep('goldOnly'); return; }
    if (m === 'UPI')  { setStep('upiDetails');  return; }
    setStep('bankDetails');
  }

  function handleProceedFromUpi() {
    if (!upiId.trim()) { setError('Enter your UPI ID'); return; }
    if (!upiStatus)    { setError('Please verify your UPI ID first'); return; }
    setError(''); setStep('review');
  }

  function handleProceedFromBank() {
    const err = bankDetailsValid();
    if (err) { setError(err); return; }
    setError(''); setStep('review');
  }

  /* ── review submit ── */
  function handlePlaceOrder() {
    const params = new URLSearchParams({
      mode: 'sell',
      amount: String(usdtAmount),
      network,
      payMethod: payMethod ?? '',
      ...(payMethod === 'UPI' ? { upiId } : {
        benefName, accountNo, ifsc: ifsc.toUpperCase(),
        ...(payMethod === 'IMPS' ? { bankPhone } : {}),
      }),
    });
    onSuccess?.();
    window.location.href = `/checkout?${params.toString()}`;
  }

  /* ─── Render ────────────────────────────────────────────────────────────── */

  const STEPS_FLOW: SellStep[] = ['phoneGate', 'walletGate', 'payMethod', 'upiDetails', 'review'];
  const stepIdx = STEPS_FLOW.indexOf(step as any);

  function header(title: string, subtitle?: string, back?: () => void, progressStep?: number) {
    return (
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {back && (
              <button onClick={back} style={{ width: 30, height: 30, borderRadius: 8, background: C.faint, border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcoBack />
              </button>
            )}
            <h3 style={{ fontSize: 16, fontWeight: 900, color: C.text, margin: 0 }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: C.faint, border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcoClose />
          </button>
        </div>
        {subtitle && <p style={{ fontSize: 13, color: C.sub, margin: '0 0 14px', lineHeight: 1.6 }}>{subtitle}</p>}
        {progressStep !== undefined && (
          <ProgressDots steps={['Phone', 'Wallet', 'Payment', 'Details', 'Review']} current={progressStep} />
        )}
      </div>
    );
  }

  function errorBanner() {
    if (!error) return null;
    return (
      <div style={{ background: 'rgba(248,113,113,0.08)', border: `1px solid rgba(248,113,113,0.25)`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.danger }}>
        {error}
      </div>
    );
  }

  function primaryBtn(label: string, onClick: () => void, disabled = false) {
    const dis = disabled || loading;
    return (
      <button onClick={onClick} disabled={dis} style={{
        width: '100%', padding: '13px', borderRadius: 11, fontSize: 14, fontWeight: 800,
        border: 'none', cursor: dis ? 'not-allowed' : 'pointer',
        background: dis ? 'rgba(255,255,255,0.07)' : C.lime,
        color: dis ? C.dim : '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.15s',
      }}>
        {loading ? <><Spinner size={15} color="#000" />Please wait…</> : label}
      </button>
    );
  }

  /* ── Order summary strip (shows on most steps) ── */
  function orderStrip() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(204,255,0,0.04)', border: `1px solid rgba(204,255,0,0.10)`, borderRadius: 10, marginBottom: 20 }}>
        <TokenIcon network={network} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>Selling {usdtAmount} USDT</p>
          <p style={{ fontSize: 11, color: C.sub, margin: '2px 0 0', fontFamily: C.mono }}>{NET_LABEL[network]} · ₹{rate.toFixed(2)}/USDT</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 900, color: C.lime, margin: 0, fontFamily: C.mono }}>₹{inrAmount}</p>
          <p style={{ fontSize: 10, color: C.dim, margin: 0 }}>you receive</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════ STEP RENDERS ════════════════════════════════════════ */

  function renderLoading() {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Spinner size={32} />
        <p style={{ fontSize: 14, color: C.sub, marginTop: 16 }}>Checking your account…</p>
      </div>
    );
  }

  function renderNotLoggedIn() {
    return (
      <>
        {header('Sign in Required')}
        <div style={{ textAlign: 'center', padding: '12px 0 24px' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(248,113,113,0.08)', border: `2px solid rgba(248,113,113,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="9" r="4" stroke={C.danger} strokeWidth="1.6"/><path d="M4 22C4 18.7 8 16 13 16C18 16 22 18.7 22 22" stroke={C.danger} strokeWidth="1.6" strokeLinecap="round"/></svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>You need to be signed in</p>
          <p style={{ fontSize: 13, color: C.sub, margin: '0 0 24px', lineHeight: 1.6 }}>Create an account or sign in to sell USDT on SwapINR.</p>
          <a href="/login" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 11, background: C.lime, color: '#000', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
            Sign In →
          </a>
        </div>
      </>
    );
  }

  function renderPhoneGate() {
    return (
      <>
        {header('Verify Your Mobile', 'A verified phone number is required to process sell orders.', undefined, 0)}
        {orderStrip()}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(204,255,0,0.07)', border: `2px solid rgba(204,255,0,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcoPhone />
          </div>
        </div>

        <p style={{ fontSize: 13, color: C.sub, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.6 }}>
          We'll send a 6-digit OTP to your Indian mobile number (+91) to confirm your identity.
        </p>

        {errorBanner()}

        <Field
          label="Mobile Number"
          value={phone}
          onChange={v => { setPhone(v.replace(/\D/g, '').slice(0, 10)); setError(''); }}
          placeholder="98765 43210"
          type="tel"
          maxLength={10}
          prefix="🇮🇳 +91"
        />

        {primaryBtn('Send OTP →', sendOtp, phone.replace(/\D/g,'').length !== 10)}
      </>
    );
  }

  function renderPhoneOtp() {
    return (
      <>
        {header('Enter OTP', undefined, () => { setStep('phoneGate'); setOtp(['','','','','','']); setError(''); }, 0)}
        {orderStrip()}

        <p style={{ fontSize: 13, color: C.sub, margin: '0 0 6px', lineHeight: 1.6 }}>
          OTP sent to <strong style={{ color: C.text }}>+91 {phone}</strong>
        </p>
        <button onClick={() => { setStep('phoneGate'); setOtp(['','','','','','']); setError(''); }} style={{ fontSize: 12, color: C.lime, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20, fontWeight: 600 }}>
          ← Change number
        </button>

        {errorBanner()}

        <div style={{ marginBottom: 20 }}>
          <OtpRow otp={otp} setOtp={setOtp} onPaste={handleOtpPaste} />
        </div>

        {primaryBtn('Verify OTP →', verifyOtp, otp.join('').length !== 6)}

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          {otpCountdown > 0
            ? <span style={{ fontSize: 12, color: C.dim }}>Resend in {otpCountdown}s</span>
            : <button onClick={() => { setOtp(['','','','','','']); setError(''); sendOtp(); }} style={{ fontSize: 12, color: C.lime, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Resend OTP</button>
          }
        </div>
      </>
    );
  }

  function renderWalletGate() {
    const col = NET_COLOR[network];
    return (
      <>
        {header('Wallet Not Connected', undefined, undefined, 1)}
        {orderStrip()}

        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${col}15`, border: `2px solid ${col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <IcoWallet />
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>
            No {network} Wallet Found
          </p>
          <p style={{ fontSize: 13, color: C.sub, margin: '0 0 22px', lineHeight: 1.65 }}>
            To sell USDT on {NET_LABEL[network]}, you need to connect a wallet first. We support Trust Wallet and any {network === 'TRC20' ? 'TRON' : 'EVM'}-compatible wallet.
          </p>
        </div>

        {/* Trust Wallet CTA */}
        <a
          href="/wallets"
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(51,117,187,0.10)', border: '1px solid rgba(51,117,187,0.25)', borderRadius: 12, textDecoration: 'none', marginBottom: 10 }}
        >
          <IcoTrustWallet />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>Connect Trust Wallet</p>
            <p style={{ fontSize: 11, color: C.sub, margin: '2px 0 0' }}>Go to Wallets page to add your address</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M7 3L11 7L7 11" stroke={C.sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>

        {/* Support */}
        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: C.faint, border: `1px solid ${C.border}`, borderRadius: 12, textDecoration: 'none', marginBottom: 20 }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,229,64,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 10.3 1.83 11.52 2.4 12.6L1.5 16.5L5.4 15.6C6.48 16.17 7.7 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5Z" fill="#00E540" fillOpacity=".15" stroke="#00E540" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6.5 7.5C6.5 7.5 6.8 5.5 9 5.5C11 5.5 11.5 7 11.5 8C11.5 9.5 10 10 9 10.5" stroke="#00E540" strokeWidth="1.2" strokeLinecap="round"/><circle cx="9" cy="12.5" r="0.75" fill="#00E540"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>Contact Support</p>
            <p style={{ fontSize: 11, color: C.sub, margin: '2px 0 0' }}>WhatsApp · Usually replies in minutes</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M7 3L11 7L7 11" stroke={C.sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>

        <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 11, fontSize: 14, fontWeight: 700, background: C.faint, border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer' }}>
          Cancel
        </button>
      </>
    );
  }

  function renderPayMethod() {
    return (
      <>
        {header('Payment Method', 'How would you like to receive your INR?', undefined, 2)}
        {orderStrip()}
        {errorBanner()}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PAY_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => handlePayMethodSelect(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                background: payMethod === m.id ? 'rgba(204,255,0,0.06)' : C.faint,
                border: `1px solid ${payMethod === m.id ? 'rgba(204,255,0,0.25)' : C.border}`,
                borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: m.gold ? 'rgba(251,191,36,0.1)' : payMethod === m.id ? 'rgba(204,255,0,0.1)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${m.gold ? 'rgba(251,191,36,0.2)' : payMethod === m.id ? 'rgba(204,255,0,0.2)' : C.border}`,
                color: m.gold ? C.gold : payMethod === m.id ? C.lime : C.sub,
              }}>
                {m.icon === 'upi'  ? <IcoUpi />  : m.icon === 'bank' ? <IcoBank /> :
                 m.icon === 'cdm'  ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="4" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 10V8M7.5 10V7M10 10V9M12.5 10V7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                 : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 9H13M5 12H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M6 5V3.5C6 2.7 6.7 2 7.5 2H10.5C11.3 2 12 2.7 12 3.5V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{m.label}</span>
                  {m.gold && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 800, color: C.gold, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 99, padding: '2px 7px', letterSpacing: '0.05em' }}>
                      ★ GOLD
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: C.dim }}>{m.desc}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 7H10M7 4L10 7L7 10" stroke={C.dim} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
      </>
    );
  }

  function renderUpiDetails() {
    return (
      <>
        {header('UPI Payment', 'Enter the UPI ID where you want to receive INR.', () => { setStep('payMethod'); setError(''); setUpiStatus(null); }, 3)}
        {orderStrip()}
        {errorBanner()}

        <div style={{ marginBottom: 6 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.dim, marginBottom: 6 }}>
            UPI ID
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: C.faint, border: `1px solid ${upiStatus?.verified ? 'rgba(0,229,160,0.3)' : C.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '0 12px', color: C.dim, borderRight: `1px solid ${C.border}`, alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>
                <IcoUpi />
              </div>
              <input
                type="text" value={upiId}
                onChange={e => { setUpiId(e.target.value); setUpiStatus(null); setError(''); }}
                placeholder="yourname@bankhandle"
                style={{ flex: 1, padding: '12px 14px', background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: C.text, fontFamily: 'inherit' }}
              />
            </div>
            <button
              onClick={verifyUpi}
              disabled={upiChecking || !upiId.trim()}
              style={{ padding: '0 16px', borderRadius: 10, fontSize: 12, fontWeight: 800, border: 'none', cursor: upiChecking || !upiId.trim() ? 'not-allowed' : 'pointer', background: upiChecking || !upiId.trim() ? 'rgba(255,255,255,0.05)' : 'rgba(204,255,0,0.12)', color: upiChecking || !upiId.trim() ? C.dim : C.lime, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, borderWidth: 1, borderStyle: 'solid', borderColor: upiChecking || !upiId.trim() ? C.border : 'rgba(204,255,0,0.22)' }}
            >
              {upiChecking ? <><Spinner size={12} />Checking</> : 'Verify'}
            </button>
          </div>

          {/* UPI status */}
          {upiStatus && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: upiStatus.verified ? 'rgba(0,229,160,0.07)' : 'rgba(251,191,36,0.07)', border: `1px solid ${upiStatus.verified ? 'rgba(0,229,160,0.2)' : 'rgba(251,191,36,0.2)'}`, borderRadius: 9 }}>
              {upiStatus.verified
                ? <IcoCheck size={14} color={C.success} />
                : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 3V7M7 9.5V10" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round"/><circle cx="7" cy="7" r="5.5" stroke={C.gold} strokeWidth="1.3"/></svg>}
              <span style={{ fontSize: 12, fontWeight: 700, color: upiStatus.verified ? C.success : C.gold }}>
                {upiStatus.message}
                {upiStatus.bankName && ` · ${upiStatus.bankName}`}
              </span>
            </div>
          )}

          <p style={{ fontSize: 11, color: C.dim, margin: '8px 0 0', lineHeight: 1.5 }}>
            Example: <span style={{ fontFamily: C.mono }}>98765@okicici</span>, <span style={{ fontFamily: C.mono }}>yourname@paytm</span>
          </p>
        </div>

        <div style={{ marginTop: 20 }}>
          {primaryBtn('Continue →', handleProceedFromUpi, !upiId.trim())}
        </div>
      </>
    );
  }

  function renderBankDetails() {
    const isMobile = payMethod === 'IMPS';
    return (
      <>
        {header(`${payMethod} Bank Transfer`, 'Enter your bank account details for fund transfer.', () => { setStep('payMethod'); setError(''); }, 3)}
        {orderStrip()}
        {errorBanner()}

        <Field label="Beneficiary Name" value={benefName} onChange={setBenefName} placeholder="Full name as in bank records" />
        <Field label="Account Number" value={accountNo} onChange={setAccountNo} placeholder="Enter account number" type="tel" />
        <Field
          label="Confirm Account Number"
          value={accountNo2} onChange={setAccountNo2}
          placeholder="Re-enter to confirm"
          type="tel"
          suffix={accountNo2.length > 0 ? (
            accountNo === accountNo2
              ? <IcoCheck size={16} color={C.success} />
              : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke={C.danger} strokeWidth="1.6" strokeLinecap="round"/></svg>
          ) : undefined}
        />
        <Field
          label="IFSC Code"
          value={ifsc.toUpperCase()} onChange={v => setIfsc(v.replace(/[^A-Za-z0-9]/g,'').slice(0,11).toUpperCase())}
          placeholder="HDFC0001234"
          hint="11-character IFSC code printed on your cheque book"
        />
        {isMobile && (
          <Field
            label="Registered Mobile (for IMPS)"
            value={bankPhone} onChange={v => setBankPhone(v.replace(/\D/g,'').slice(0,10))}
            placeholder="10-digit mobile linked to bank"
            type="tel"
            prefix="+91"
            maxLength={10}
          />
        )}

        <div style={{ marginTop: 6 }}>
          {primaryBtn('Continue →', handleProceedFromBank)}
        </div>
      </>
    );
  }

  function renderGoldOnly() {
    return (
      <>
        {header('Gold Members Only', undefined, () => { setStep('payMethod'); setError(''); }, 2)}
        {orderStrip()}

        <div style={{ textAlign: 'center', padding: '10px 0 24px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(251,191,36,0.1)', border: `2px solid rgba(251,191,36,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <IcoCrown />
          </div>
          <p style={{ fontSize: 15, fontWeight: 900, color: C.text, margin: '0 0 10px' }}>
            {payMethod === 'CDM' ? 'Cash Deposit Machine' : 'Physical Cash'} is a Gold Feature
          </p>
          <p style={{ fontSize: 13, color: C.sub, margin: '0 0 20px', lineHeight: 1.7 }}>
            {payMethod === 'CDM'
              ? 'CDM deposits are available for Gold members who have completed enhanced KYC and maintain higher trading volumes.'
              : 'Physical cash handovers are managed by our Gold relationship team and require an in-person appointment.'}
          </p>

          <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: C.gold, margin: '0 0 8px' }}>✦ Gold membership includes</p>
            {['CDM & Cash deposit options', 'Priority settlement (under 5 min)', 'Dedicated relationship manager', 'Higher trading limits'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <IcoCheck size={12} color={C.gold} />
                <span style={{ fontSize: 12, color: C.sub }}>{f}</span>
              </div>
            ))}
          </div>

          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 11, background: C.gold, color: '#000', fontSize: 14, fontWeight: 800, textDecoration: 'none', marginBottom: 12 }}
          >
            <IcoSupport /> Upgrade to Gold
          </a>

          <br />
          <button onClick={() => setStep('payMethod')} style={{ fontSize: 13, color: C.sub, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            ← Choose another payment method
          </button>
        </div>
      </>
    );
  }

  function renderReview() {
    const isUpi  = payMethod === 'UPI';
    const isBank = ['IMPS','RTGS','NEFT'].includes(payMethod ?? '');

    return (
      <>
        {header('Review Order', 'Please confirm all details before placing your order.', () => setStep(isUpi ? 'upiDetails' : 'bankDetails'), 4)}

        {/* Trade summary */}
        <div style={{ background: 'rgba(204,255,0,0.04)', border: '1px solid rgba(204,255,0,0.14)', borderRadius: 14, padding: '16px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
            <TokenIcon network={network} size={40} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 900, color: C.lime, margin: 0, fontFamily: C.mono }}>
                {usdtAmount} USDT → ₹{inrAmount}
              </p>
              <p style={{ fontSize: 11, color: C.sub, margin: '3px 0 0' }}>{NET_LABEL[network]} · ₹{rate.toFixed(2)}/USDT</p>
            </div>
          </div>

          {[
            { label: 'Network', value: `${network} · ${NET_LABEL[network]}` },
            { label: 'Rate', value: `₹${rate.toFixed(2)} / USDT` },
            { label: 'You Receive', value: `₹${inrAmount}`, highlight: true },
            { label: 'Processing Fee', value: '₹ 0.00', ok: true },
            { label: 'Settlement', value: 'Under 15 minutes' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: C.dim }}>{r.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: r.highlight ? C.lime : r.ok ? C.success : C.text, fontFamily: C.mono }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Payment details */}
        <div style={{ background: C.faint, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.dim, margin: '0 0 10px' }}>Payment Details</p>
          {isUpi ? (
            <>
              <Row label="Method" value="UPI" />
              <Row label="UPI ID" value={upiId} mono />
              {upiStatus?.bankName && <Row label="Bank" value={upiStatus.bankName} />}
            </>
          ) : (
            <>
              <Row label="Method" value={payMethod ?? ''} />
              <Row label="Beneficiary" value={benefName} />
              <Row label="Account No." value={`${'*'.repeat(Math.max(0, accountNo.length - 4))}${accountNo.slice(-4)}`} mono />
              <Row label="IFSC" value={ifsc.toUpperCase()} mono />
              {payMethod === 'IMPS' && bankPhone && <Row label="Mobile" value={`+91 ${bankPhone}`} />}
            </>
          )}
        </div>

        <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
          <p style={{ fontSize: 11, color: C.gold, margin: 0, lineHeight: 1.55 }}>
            ⚠ Once submitted, transfer the exact USDT amount from your {network} wallet. Orders expire in 30 minutes.
          </p>
        </div>

        <button
          onClick={handlePlaceOrder}
          style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 900, background: C.lime, color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 24px rgba(204,255,0,0.25)' }}
        >
          Place Order
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </>
    );
  }

  /* ─── Render current step ─────────────────────────────────────────────── */

  const content = () => {
    switch (step) {
      case 'loading':      return renderLoading();
      case 'notLoggedIn':  return renderNotLoggedIn();
      case 'phoneGate':    return renderPhoneGate();
      case 'phoneOtp':     return renderPhoneOtp();
      case 'walletGate':   return renderWalletGate();
      case 'payMethod':    return renderPayMethod();
      case 'upiDetails':   return renderUpiDetails();
      case 'bankDetails':  return renderBankDetails();
      case 'goldOnly':     return renderGoldOnly();
      case 'review':       return renderReview();
    }
  };

  return (
    <>
      <div
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          background: 'rgba(0,0,0,0.80)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          padding: '0',
        }}
      >
        <div style={{
          width: '100%', maxWidth: 480,
          maxHeight: '92dvh',
          background: C.bg,
          border: `1px solid ${C.borderMd}`,
          borderRadius: '22px 22px 0 0',
          overflowY: 'auto',
          boxShadow: '0 -24px 80px rgba(0,0,0,0.7)',
          animation: 'sf-slide 0.3s cubic-bezier(0.34,1.1,0.64,1)',
        }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg,transparent,#CCFF00 40%,#CCFF00 60%,transparent)' }} />

          {/* drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
          </div>

          <div style={{ padding: '16px 24px 40px', overflowY: 'auto' }}>
            {content()}
          </div>
        </div>
      </div>

      {/* Invisible reCAPTCHA anchor for Firebase Phone Auth */}
      <div id="sf-recaptcha" />

      <style>{`
        @keyframes sf-slide {
          from { transform: translateY(100%); opacity: 0.5; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes sf-spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

/* ── Helper: review row ─────────────────────────────────────────────────── */
function Row({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: highlight ? '#CCFF00' : '#fff', fontFamily: mono ? "'JetBrains Mono',monospace" : 'inherit', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}
