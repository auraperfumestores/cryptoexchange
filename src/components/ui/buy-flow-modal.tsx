'use client';

import { useEffect, useRef, useState } from 'react';
import { firebaseAuth } from '@/lib/firebase/client';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { TokenIcon } from './token-icon';
import { ProUpgradeModal } from './pro-upgrade-modal';
import { openSupportChat } from './support-chat-widget';
import { Crown } from '@phosphor-icons/react';

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Network   = 'BEP20' | 'ERC20' | 'TRC20';
type PayMethod = 'UPI' | 'IMPS' | 'RTGS' | 'NEFT' | 'CDM' | 'CASH';
type BuyStep   =
  | 'loading'
  | 'notLoggedIn'
  | 'phoneGate'
  | 'phoneOtp'
  | 'walletGate'
  | 'payMethod'
  | 'gatewayError';

export interface BuyFlowProps {
  network:     Network;
  usdtAmount:  number;
  inrAmount:   string;
  rate:        number;
  onClose:     () => void;
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
  warn:      '#FBBF24',
  gold:      '#FBBF24',
  mono:      "'JetBrains Mono','Fira Code',monospace",
};

const PAY_METHODS: { id: PayMethod; label: string; desc: string; icon: string; gold?: boolean }[] = [
  { id: 'UPI',  label: 'UPI',  desc: 'Instant · 24×7',           icon: 'upi'  },
  { id: 'IMPS', label: 'IMPS', desc: 'Instant · 24×7',           icon: 'bank' },
  { id: 'RTGS', label: 'RTGS', desc: '₹2 L+ · Business hrs',     icon: 'bank' },
  { id: 'NEFT', label: 'NEFT', desc: 'Up to 2 hrs · 24×7',       icon: 'bank' },
  { id: 'CDM',  label: 'CDM',  desc: 'Cash Deposit Machine',      icon: 'cdm',  gold: true  },
  { id: 'CASH', label: 'CASH', desc: 'Physical cash handover',    icon: 'cash', gold: true  },
];

/* ─── Inline SVG icons ───────────────────────────────────────────────────── */

function IcoClose() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
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

function IcoTrustWallet() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L3 5V10C3 13.9 6 17.4 10 18.5C14 17.4 17 13.9 17 10V5L10 2Z" fill="#3375BB"/>
      <path d="M10 2L3 5V10C3 13.9 6 17.4 10 18.5V2Z" fill="#5198FF"/>
      <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IcoWarning({ size = 28, color = C.warn }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 4L25 23H3L14 4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M14 11V16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="14" cy="19" r="1" fill={color}/>
    </svg>
  );
}

/* ─── Loader bars (matches the website preloader) ───────────────────────── */
function Spinner({ size = 18, color = C.lime }: { size?: number; color?: string }) {
  const barH = size <= 12 ? 9  : size <= 16 ? 12 : size <= 20 ? 14 : 20;
  const barW = size <= 12 ? 2  : size <= 20 ? 2.5 : 3;
  const gap  = size <= 12 ? 2.5 : 3.5;
  return (
    <>
      <style>{`@keyframes bf-bar{0%,100%{transform:scaleY(0.35);opacity:0.35}50%{transform:scaleY(1);opacity:1}}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap, flexShrink: 0 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: barW, height: barH, borderRadius: 99,
            background: color, transformOrigin: 'center',
            animation: `bf-bar 0.75s ease-in-out ${i * 0.13}s infinite`,
          }} />
        ))}
      </div>
    </>
  );
}

/* ─── Field ──────────────────────────────────────────────────────────────── */
function Field({
  label, value, onChange, placeholder, type = 'text', maxLength, prefix,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; maxLength?: number; prefix?: React.ReactNode;
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
          style={{ flex: 1, padding: '12px 14px', background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: C.text, fontFamily: 'inherit' }}
        />
      </div>
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

/* ─── Helper: review row ─────────────────────────────────────────────────── */
function Row({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: highlight ? '#CCFF00' : '#fff', fontFamily: mono ? "'JetBrains Mono',monospace" : 'inherit', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function BuyFlowModal({ network, usdtAmount, inrAmount, rate, onClose }: BuyFlowProps) {
  const [step,         setStep]         = useState<BuyStep>('loading');
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
  const [isPro,        setIsPro]        = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [refCode]      = useState(() => `GW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);

  /* ── countdown ── */
  useEffect(() => {
    if (!otpCountdown) return;
    const t = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCountdown]);

  /* ── hide bottom nav while modal is open ── */
  useEffect(() => {
    document.body.classList.add('sell-modal-open');
    return () => { document.body.classList.remove('sell-modal-open'); };
  }, []);

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
      const profileJson = await profileRes.json();
      const profile = profileJson?.data ?? profileJson;
      const wallets = walletRes.ok ? (await walletRes.json()).data ?? [] : [];

      const phoneVerified = profile?.phoneVerified ?? false;
      if (!phoneVerified) { setStep('phoneGate'); return; }

      const chainId = NET_CHAIN[network];
      const match = wallets.find((w: any) => w.chainId === chainId && w.isVerified);
      if (!match) { setStep('walletGate'); return; }

      setIsPro(!!(profile?.isPro));
      setStep('payMethod');
    } catch {
      setStep('notLoggedIn');
    }
  }

  /* ── phone OTP flow ── */
  function resetRecaptcha() {
    try { recaptchaRef.current?.clear(); } catch {}
    recaptchaRef.current = null;
    const old = document.getElementById('bf-recaptcha');
    if (old) {
      const fresh = document.createElement('div');
      fresh.id = 'bf-recaptcha';
      old.parentNode?.replaceChild(fresh, old);
    }
  }

  async function getVerifier(): Promise<RecaptchaVerifier> {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, 'bf-recaptcha', { size: 'invisible' });
      await recaptchaRef.current.render();
    }
    return recaptchaRef.current;
  }

  async function sendOtp() {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) { setError('Enter a valid 10-digit Indian mobile number'); return; }
    setError(''); setLoading(true);
    try {
      const verifier = await getVerifier();
      const res = await signInWithPhoneNumber(firebaseAuth, `+91${digits}`, verifier);
      confirmRef.current = res;
      setStep('phoneOtp');
      setOtpCountdown(30);
    } catch (e: any) {
      resetRecaptcha();
      console.error('[SwappINR OTP] sendOtp failed:', { code: e?.code, message: e?.message, full: e });
      const code: string = e?.code ?? '';
      const msg: string  = e?.message ?? '';
      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setError('Domain not authorised. Add this site in Firebase Console → Authentication → Authorized domains.');
      } else if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        setError('[auth/operation-not-allowed] Phone provider not fully enabled. Open browser console (F12) for full details.');
      } else if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else if (code === 'auth/invalid-phone-number' || msg.includes('invalid-phone-number')) {
        setError('Invalid phone number. Enter a valid 10-digit Indian mobile number.');
      } else if (code === 'auth/captcha-check-failed' || msg.includes('reCAPTCHA')) {
        setError('reCAPTCHA check failed. Please refresh the page and try again.');
      } else {
        setError(`Failed to send OTP [${code || 'unknown'}] — see browser console (F12) for details.`);
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
      const chainId = NET_CHAIN[network];
      const wRes  = await fetch('/api/wallets');
      const wData = wRes.ok ? (await wRes.json()).data ?? [] : [];
      const match = wData.find((w: any) => w.chainId === chainId && w.isVerified);
      setStep(match ? 'payMethod' : 'walletGate');
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

  const inrValue = parseFloat(inrAmount.replace(/,/g, '')) || 0;

  /* ── Payment method tap: simulate a brief gateway handshake, then fail ── */
  function handlePayMethodSelect(m: PayMethod) {
    setPayMethod(m);
    setError('');
    if ((m === 'CDM' || m === 'CASH') && !isPro) { return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('gatewayError');
    }, 1100);
  }

  /* ─── Render ────────────────────────────────────────────────────────────── */

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
          <ProgressDots steps={['Phone', 'Wallet', 'Payment']} current={progressStep} />
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
          <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>Buying {usdtAmount} USDT</p>
          <p style={{ fontSize: 11, color: C.sub, margin: '2px 0 0', fontFamily: C.mono }}>{NET_LABEL[network]} · ₹{rate.toFixed(2)}/USDT</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 900, color: C.lime, margin: 0, fontFamily: C.mono }}>₹{inrAmount}</p>
          <p style={{ fontSize: 10, color: C.dim, margin: 0 }}>you pay</p>
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
          <p style={{ fontSize: 13, color: C.sub, margin: '0 0 24px', lineHeight: 1.6 }}>Create an account or sign in to buy USDT on SwappINR.</p>
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
        {header('Verify Your Mobile', 'A verified phone number is required to process buy orders.', undefined, 0)}
        {orderStrip()}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(204,255,0,0.07)', border: `2px solid rgba(204,255,0,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcoPhone />
          </div>
        </div>

        <p style={{ fontSize: 13, color: C.sub, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.6 }}>
          For your security, we verify every buy order with a one-time code sent by SMS.
        </p>

        {errorBanner()}

        <Field
          label="Mobile Number"
          value={phone}
          onChange={v => { setPhone(v.replace(/\D/g, '').slice(0, 10)); setError(''); }}
          placeholder="98765 43210"
          type="tel"
          maxLength={10}
          prefix={<span style={{ color: '#fff' }}>🇮🇳 +91</span>}
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
        {header('Receiving Wallet Required', undefined, undefined, 1)}
        {orderStrip()}

        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${col}15`, border: `2px solid ${col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <IcoWallet />
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>
            No {network} Wallet Found
          </p>
          <p style={{ fontSize: 13, color: C.sub, margin: '0 0 22px', lineHeight: 1.65 }}>
            To buy USDT on {NET_LABEL[network]}, add and verify a wallet address first — that's where we'll send your USDT. We support Trust Wallet and any {network === 'TRC20' ? 'TRON' : 'EVM'}-compatible wallet.
          </p>
        </div>

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

        <button
          type="button"
          onClick={() => openSupportChat()}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: C.faint, border: `1px solid ${C.border}`, borderRadius: 12, width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 20 }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,229,64,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 10.3 1.83 11.52 2.4 12.6L1.5 16.5L5.4 15.6C6.48 16.17 7.7 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5Z" fill="#00E540" fillOpacity=".15" stroke="#00E540" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6.5 7.5C6.5 7.5 6.8 5.5 9 5.5C11 5.5 11.5 7 11.5 8C11.5 9.5 10 10 9 10.5" stroke="#00E540" strokeWidth="1.2" strokeLinecap="round"/><circle cx="9" cy="12.5" r="0.75" fill="#00E540"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>Contact Support</p>
            <p style={{ fontSize: 11, color: C.sub, margin: '2px 0 0' }}>Live chat · Usually replies in minutes</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M7 3L11 7L7 11" stroke={C.sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 11, fontSize: 14, fontWeight: 700, background: C.faint, border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer' }}>
          Cancel
        </button>
      </>
    );
  }

  function renderPayMethod() {
    return (
      <>
        {header('Payment Method', 'How would you like to pay for your USDT?', undefined, 2)}
        {orderStrip()}
        {errorBanner()}

        {inrValue > 95000 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)', borderRadius: 10, marginBottom: 10 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M8 3V8M8 10.5V11" stroke="#FBBF24" strokeWidth="1.6" strokeLinecap="round"/><circle cx="8" cy="8" r="6.5" stroke="#FBBF24" strokeWidth="1.3"/></svg>
            <p style={{ fontSize: 12, color: '#FBBF24', margin: 0, lineHeight: 1.55 }}>
              UPI is not available for amounts above ₹95,000. Please use IMPS, RTGS, or NEFT for this transaction.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PAY_METHODS.map(m => {
            const upiLimited = m.id === 'UPI' && inrValue > 95000;
            const goldLocked = m.gold && !isPro;
            const disabled   = upiLimited;
            return (
              <button
                key={m.id}
                onClick={() => {
                  if (disabled) return;
                  if (goldLocked) { setShowProModal(true); return; }
                  handlePayMethodSelect(m.id);
                }}
                disabled={disabled}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  background: disabled ? 'rgba(255,255,255,0.02)' : payMethod === m.id ? 'rgba(204,255,0,0.06)' : C.faint,
                  border: `1px solid ${disabled ? 'rgba(255,255,255,0.04)' : payMethod === m.id ? 'rgba(204,255,0,0.25)' : C.border}`,
                  borderRadius: 12, cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  opacity: disabled ? 0.45 : 1,
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: (m.gold && isPro) ? 'rgba(74,222,128,0.08)' : (m.gold && !isPro) ? 'rgba(255,210,0,0.1)' : payMethod === m.id ? 'rgba(204,255,0,0.1)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${(m.gold && isPro) ? 'rgba(74,222,128,0.25)' : (m.gold && !isPro) ? 'rgba(255,210,0,0.25)' : payMethod === m.id ? 'rgba(204,255,0,0.2)' : C.border}`,
                  color: (m.gold && isPro) ? '#4ADE80' : (m.gold && !isPro) ? '#FFD700' : payMethod === m.id ? C.lime : C.sub,
                }}>
                  {m.icon === 'upi'  ? <IcoUpi />  : m.icon === 'bank' ? <IcoBank /> :
                   m.icon === 'cdm'  ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="4" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 10V8M7.5 10V7M10 10V9M12.5 10V7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                   : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 9H13M5 12H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M6 5V3.5C6 2.7 6.7 2 7.5 2H10.5C11.3 2 12 2.7 12 3.5V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: disabled ? C.dim : C.text }}>{m.label}</span>
                    {m.gold && isPro && (
                      <Crown size={13} weight="fill" color="#FFD700" />
                    )}
                    {m.gold && !isPro && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 900, color: '#000', background: 'linear-gradient(270deg,#FFD700,#FFF176 50%,#FFB800)', borderRadius: 99, padding: '2px 7px', letterSpacing: '0.08em', animation: 'pro-shimmer 6s linear infinite', backgroundSize: '300% 100%' }}>
                        <Crown size={9} weight="fill" color="#000" />PRO
                      </span>
                    )}
                    {upiLimited && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#FBBF24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 99, padding: '2px 7px' }}>
                        ₹95K limit
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: C.dim }}>{m.desc}</span>
                </div>
                {!disabled && (loading && payMethod === m.id
                  ? <Spinner size={14} color={C.lime} />
                  : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 7H10M7 4L10 7L7 10" stroke={C.dim} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                {disabled && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="7" width="8" height="7" rx="1.5" stroke={C.dim} strokeWidth="1.3"/><path d="M5.5 7V5.5C5.5 3.6 10.5 3.6 10.5 5.5V7" stroke={C.dim} strokeWidth="1.3" strokeLinecap="round"/></svg>}
              </button>
            );
          })}
        </div>
        <style>{`@keyframes pro-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}`}</style>
      </>
    );
  }

  function renderGatewayError() {
    return (
      <>
        {header('Payment Gateway Issue', undefined, () => { setStep('payMethod'); setError(''); setPayMethod(null); })}

        <div style={{ textAlign: 'center', padding: '8px 0 22px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 18px',
            background: 'rgba(251,191,36,0.10)',
            border: `2px solid rgba(251,191,36,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IcoWarning size={28} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>
            We couldn't reach the payment gateway
          </p>
          <p style={{ fontSize: 13, color: C.sub, margin: '0 0 4px', lineHeight: 1.65 }}>
            A temporary network issue is preventing us from processing buy orders right now. No funds have been charged or deducted — your account is unaffected.
          </p>
          <p style={{ fontSize: 12, color: C.dim, margin: '10px 0 0' }}>
            Reference code <span style={{ fontFamily: C.mono, color: C.sub }}>{refCode}</span>
          </p>
        </div>

        <div style={{ background: C.faint, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
          <Row label="Amount" value={`${usdtAmount} USDT · ₹${inrAmount}`} mono />
          <Row label="Network" value={`${network} · ${NET_LABEL[network]}`} />
          <Row label="Payment method" value={payMethod ?? '—'} />
          <Row label="Status" value="Failed — gateway unreachable" highlight />
        </div>

        <button
          type="button"
          onClick={() => openSupportChat()}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(0,229,64,0.06)', border: '1px solid rgba(0,229,64,0.2)', borderRadius: 12, width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 10 }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,229,64,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 10.3 1.83 11.52 2.4 12.6L1.5 16.5L5.4 15.6C6.48 16.17 7.7 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5Z" fill="#00E540" fillOpacity=".15" stroke="#00E540" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6.5 7.5C6.5 7.5 6.8 5.5 9 5.5C11 5.5 11.5 7 11.5 8C11.5 9.5 10 10 9 10.5" stroke="#00E540" strokeWidth="1.2" strokeLinecap="round"/><circle cx="9" cy="12.5" r="0.75" fill="#00E540"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>Contact Support</p>
            <p style={{ fontSize: 11, color: C.sub, margin: '2px 0 0' }}>Quote your reference code · Usually replies in minutes</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M7 3L11 7L7 11" stroke={C.sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button onClick={() => { setStep('payMethod'); setError(''); setPayMethod(null); }} style={{ width: '100%', padding: '12px', borderRadius: 11, fontSize: 14, fontWeight: 700, background: C.faint, border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer', marginBottom: 10 }}>
          Try a different payment method
        </button>
        <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 11, fontSize: 14, fontWeight: 700, background: 'transparent', border: 'none', color: C.dim, cursor: 'pointer' }}>
          Close
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
      case 'gatewayError': return renderGatewayError();
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
          animation: 'bf-slide 0.3s cubic-bezier(0.34,1.1,0.64,1)',
        }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg,transparent,#CCFF00 40%,#CCFF00 60%,transparent)' }} />

          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
          </div>

          <div style={{ padding: '16px 24px 40px', overflowY: 'auto' }}>
            {content()}
          </div>
        </div>
      </div>

      <div id="bf-recaptcha" />

      <style>{`
        @keyframes bf-slide {
          from { transform: translateY(100%); opacity: 0.5; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      {showProModal && (
        <ProUpgradeModal onClose={() => {
          setShowProModal(false);
          fetch('/api/user/profile').then(r => r.json()).then(d => {
            if (d?.data?.isPro) { setIsPro(true); }
          }).catch(() => {});
        }} />
      )}
    </>
  );
}
