'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, PaperPlaneTilt } from '@phosphor-icons/react';
import { NetworkIcon } from './token-icon';
import { toast } from './toast';

type Network = 'ERC20' | 'BEP20' | 'TRC20';
type Step =
  | 'main'
  | 'amount'
  | 'phoneRequired'
  | 'network'
  | 'walletRequired'
  | 'kycRequired'
  | 'confirm'
  | 'otp'
  | 'success';

interface WalletPopupProps {
  balance: number;
  onClose: () => void;
  onBalanceChange: (balance: number) => void;
}

const NET_CHAIN: Record<Network, number> = { ERC20: 1, BEP20: 56, TRC20: 195 };
const NET_LABEL: Record<Network, string> = {
  ERC20: 'Ethereum (ERC-20)',
  BEP20: 'BNB Smart Chain (BEP-20)',
  TRC20: 'TRON (TRC-20)',
};
const NET_FEE: Record<Network, number> = { ERC20: 3, BEP20: 0.5, TRC20: 1 };
const NETWORKS: Network[] = ['TRC20', 'BEP20', 'ERC20'];

const C = {
  bg: '#0a0a0c',
  card: '#111113',
  lime: '#CCFF00',
  text: '#FFFFFF',
  sub: 'rgba(255,255,255,0.52)',
  dim: 'rgba(255,255,255,0.25)',
  faint: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.08)',
  borderMd: 'rgba(255,255,255,0.13)',
  success: '#00E5A0',
  danger: '#F87171',
  gold: '#FBBF24',
  mono: "'JetBrains Mono','Fira Code',monospace",
};

function IcoClose() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IcoBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcoCheck({ size = 16, color = C.success }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 8L6.5 12.5L14 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Spinner({ size = 18, color = C.lime }: { size?: number; color?: string }) {
  const barH = size <= 12 ? 9 : size <= 16 ? 12 : size <= 20 ? 14 : 20;
  const barW = size <= 12 ? 2 : size <= 20 ? 2.5 : 3;
  const gap = size <= 12 ? 2.5 : 3.5;
  return (
    <>
      <style>{`@keyframes wp-bar{0%,100%{transform:scaleY(0.35);opacity:0.35}50%{transform:scaleY(1);opacity:1}}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap, flexShrink: 0 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: barW, height: barH, borderRadius: 99, background: color, transformOrigin: 'center', animation: `wp-bar 0.75s ease-in-out ${i * 0.13}s infinite` }} />
        ))}
      </div>
    </>
  );
}

function OtpRow({ otp, setOtp, onPaste }: { otp: string[]; setOtp: (v: string[]) => void; onPaste: (e: React.ClipboardEvent) => void }) {
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

export function WalletPopup({ balance, onClose, onBalanceChange }: WalletPopupProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('main');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<Network | null>(null);
  const [walletAddress, setWalletAddress] = useState('');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    if (!otpCountdown) return;
    const t = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCountdown]);

  const amt = parseFloat(amount) || 0;
  const fee = network ? NET_FEE[network] : 0;
  const netReceive = Math.max(0, amt - fee);

  /* ── Add Funds ── */
  async function handleAddFunds() {
    setLoading(true);
    try {
      onClose();
      router.push('/wallets');
      toast.info(
        'You’re on the Wallets tab. Add funds by connecting a crypto wallet and transferring USDT to it — your SwappINR balance updates automatically once the deposit is confirmed on-chain.',
        7000,
        'top-center',
      );
    } finally {
      setLoading(false);
    }
  }

  /* ── Withdraw: amount → phone check ── */
  async function handleSubmitWithdrawal() {
    setError('');
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    if (amt > balance) { setError('Amount exceeds your available balance'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      const json = await res.json();
      const profile = json?.data ?? json;
      if (!profile?.phoneVerified) { setStep('phoneRequired'); return; }
      setStep('network');
    } catch {
      setError('Could not verify your account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Network select → wallet-on-network check → KYC check ── */
  async function handleSelectNetwork(net: Network) {
    setNetwork(net);
    setError('');
    setLoading(true);
    try {
      const [walletRes, profileRes] = await Promise.all([
        fetch('/api/wallets'),
        fetch('/api/user/profile'),
      ]);
      const wallets = walletRes.ok ? (await walletRes.json()).data ?? [] : [];
      const match = wallets.find((w: any) => w.chainId === NET_CHAIN[net] && w.isVerified);
      if (!match) { setStep('walletRequired'); return; }
      setWalletAddress(match.address);

      const profileJson = await profileRes.json();
      const profile = profileJson?.data ?? profileJson;
      if (profile?.kycStatus !== 'verified') { setStep('kycRequired'); return; }

      setStep('confirm');
    } catch {
      setError('Could not check your wallet status. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGetVerifiedNow() {
    setLoading(true);
    try {
      const res = await fetch('/api/kyc/link');
      const data = await res.json();
      if (res.ok) window.open(data.data.path, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  }

  /* ── Confirm → send OTP ── */
  async function handleConfirmWithdraw() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/withdraw-otp/send', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send verification code');
      setStep('otp');
      setOtpCountdown(30);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) setOtp(digits.split(''));
  }

  /* ── Verify OTP → finalize withdrawal ── */
  async function handleVerifyOtp() {
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter all 6 digits'); return; }
    setError('');
    setLoading(true);
    try {
      const vRes = await fetch('/api/withdraw-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: code }),
      });
      const vData = await vRes.json();
      if (!vRes.ok) throw new Error(vData?.error || 'Verification failed.');

      const wRes = await fetch('/api/platform-wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, network }),
      });
      const wData = await wRes.json();
      if (!wRes.ok) throw new Error(wData?.error || 'Failed to submit withdrawal.');

      onBalanceChange(wData.data?.balance ?? Math.max(0, balance - amt));
      setStep('success');
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ─── Shared bits ─────────────────────────────────────────────────────── */

  function header(title: string, back?: () => void) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
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
      }}>
        {loading ? <><Spinner size={15} color="#000" />Please wait…</> : label}
      </button>
    );
  }

  /* ═══════════════════ STEP RENDERS ════════════════════════════════════ */

  function renderMain() {
    return (
      <>
        {header('SwappINR Wallet')}
        <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 16, padding: '20px 18px', marginBottom: 18, textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Available Balance</p>
          <p style={{ fontSize: 32, fontWeight: 900, color: C.text, margin: 0, fontFamily: C.mono, letterSpacing: '-0.02em' }}>
            {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: 15, color: C.sub, fontWeight: 700 }}>USDT</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleAddFunds} disabled={loading} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 12px', background: C.faint, border: `1px solid ${C.border}`, borderRadius: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={19} color={C.success} weight="bold" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Add Funds</span>
          </button>
          <button onClick={() => setStep('amount')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 12px', background: C.faint, border: `1px solid ${C.border}`, borderRadius: 14, cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PaperPlaneTilt size={19} color={C.lime} weight="bold" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Withdraw</span>
          </button>
        </div>
      </>
    );
  }

  function renderAmount() {
    return (
      <>
        {header('Withdraw Funds', () => { setStep('main'); setError(''); })}
        <p style={{ fontSize: 13, color: C.sub, margin: '0 0 18px', lineHeight: 1.6 }}>
          Available balance: <strong style={{ color: C.text }}>{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT</strong>
        </p>
        {errorBanner()}

        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.dim, marginBottom: 6 }}>
          Amount to withdraw
        </label>
        <div style={{ display: 'flex', alignItems: 'center', background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          <input
            type="number" inputMode="decimal" value={amount}
            onChange={e => { setAmount(e.target.value); setError(''); }}
            placeholder="0.00"
            style={{ flex: 1, minWidth: 0, width: '100%', padding: '13px 0 13px 14px', background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: C.text, fontFamily: C.mono }}
          />
          <button onClick={() => setAmount(String(balance))} style={{ margin: '0 6px', padding: '6px 10px', borderRadius: 8, background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.3)', color: C.lime, fontSize: 11, fontWeight: 800, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
            MAX
          </button>
          <div style={{ padding: '0 14px', fontSize: 13, fontWeight: 700, color: C.sub, flexShrink: 0, whiteSpace: 'nowrap' }}>USDT</div>
        </div>

        {primaryBtn('Submit Withdrawal →', handleSubmitWithdrawal, amt <= 0)}
      </>
    );
  }

  function renderPhoneRequired() {
    return (
      <>
        {header('Phone Verification Required', () => { setStep('amount'); setError(''); })}
        <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(251,191,36,0.08)', border: '2px solid rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="7" y="3" width="12" height="20" rx="2.5" stroke={C.gold} strokeWidth="1.6" /><circle cx="13" cy="19" r="1" fill={C.gold} /></svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>Verify your phone number</p>
          <p style={{ fontSize: 13, color: C.sub, margin: '0 0 22px', lineHeight: 1.65 }}>
            For your security, withdrawals require a verified mobile number. Please verify your phone number from your profile, then come back to continue.
          </p>
        </div>
        <button onClick={() => { onClose(); router.push('/settings'); }} style={{ width: '100%', padding: '13px', borderRadius: 11, fontSize: 14, fontWeight: 800, background: C.lime, color: '#000', border: 'none', cursor: 'pointer' }}>
          Verify Phone Now →
        </button>
      </>
    );
  }

  function renderNetwork() {
    return (
      <>
        {header('Select Network', () => { setStep('amount'); setError(''); })}
        <p style={{ fontSize: 13, color: C.sub, margin: '0 0 16px', lineHeight: 1.6 }}>
          Choose the network you'd like to withdraw to. We charge zero platform fees — only the network's standard transfer fee applies.
        </p>
        {errorBanner()}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {NETWORKS.map(net => (
            <button
              key={net}
              onClick={() => handleSelectNetwork(net)}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: C.faint, border: `1px solid ${C.border}`, borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', textAlign: 'left' }}
            >
              <NetworkIcon network={net} size={32} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0 }}>{net}</p>
                <p style={{ fontSize: 11, color: C.dim, margin: '2px 0 0' }}>{NET_LABEL[net]}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.sub, margin: 0, fontFamily: C.mono }}>{NET_FEE[net]} USDT</p>
                <p style={{ fontSize: 10, color: C.dim, margin: 0 }}>network fee</p>
              </div>
            </button>
          ))}
        </div>
      </>
    );
  }

  function renderWalletRequired() {
    return (
      <>
        {header('Wallet Not Connected', () => { setStep('network'); setError(''); })}
        <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(248,113,113,0.08)', border: '2px solid rgba(248,113,113,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="2" y="6" width="22" height="16" rx="3" stroke={C.danger} strokeWidth="1.6" /><circle cx="19" cy="14" r="1.5" fill={C.danger} /></svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>No {network} wallet found</p>
          <p style={{ fontSize: 13, color: C.sub, margin: '0 0 22px', lineHeight: 1.65 }}>
            To withdraw on the {network} network, you'll need to connect a wallet on that network first so we know where to send your funds.
          </p>
        </div>
        <button onClick={() => { onClose(); router.push('/wallets'); }} style={{ width: '100%', padding: '13px', borderRadius: 11, fontSize: 14, fontWeight: 800, background: C.lime, color: '#000', border: 'none', cursor: 'pointer' }}>
          Connect Wallet Now →
        </button>
      </>
    );
  }

  function renderKycRequired() {
    return (
      <>
        {header('Identity Verification Required', () => { setStep('network'); setError(''); })}
        <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(204,255,0,0.07)', border: '2px solid rgba(204,255,0,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="9" r="4" stroke={C.lime} strokeWidth="1.6" /><path d="M4 22C4 18.7 8 16 13 16C18 16 22 18.7 22 22" stroke={C.lime} strokeWidth="1.6" strokeLinecap="round" /></svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>Verify your identity to withdraw</p>
          <p style={{ fontSize: 13, color: C.sub, margin: '0 0 22px', lineHeight: 1.65 }}>
            As a security measure, withdrawals are only available to verified accounts. Complete a quick identity check to unlock withdrawals.
          </p>
        </div>
        <button onClick={handleGetVerifiedNow} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 11, fontSize: 14, fontWeight: 800, background: C.lime, color: '#000', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? <><Spinner size={15} color="#000" />Opening…</> : 'Get Verified Now →'}
        </button>
      </>
    );
  }

  function renderConfirm() {
    return (
      <>
        {header('Review Withdrawal', () => { setStep('network'); setError(''); })}
        <div style={{ background: 'rgba(204,255,0,0.04)', border: '1px solid rgba(204,255,0,0.14)', borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
            {network && <NetworkIcon network={network} size={36} />}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 900, color: C.lime, margin: 0, fontFamily: C.mono }}>{amt.toFixed(2)} USDT</p>
              <p style={{ fontSize: 11, color: C.sub, margin: '3px 0 0' }}>{network} · to {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}</p>
            </div>
          </div>
          {[
            { label: 'Withdrawal amount', value: `${amt.toFixed(2)} USDT` },
            { label: 'Platform fee', value: '0.00 USDT', ok: true },
            { label: 'Network fee', value: `${fee.toFixed(2)} USDT` },
            { label: 'You receive', value: `${netReceive.toFixed(2)} USDT`, highlight: true },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: C.dim }}>{r.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: r.highlight ? C.lime : r.ok ? C.success : C.text, fontFamily: C.mono }}>{r.value}</span>
            </div>
          ))}
        </div>

        {errorBanner()}
        {primaryBtn('Withdraw →', handleConfirmWithdraw)}
      </>
    );
  }

  function renderOtp() {
    return (
      <>
        {header('Verify Withdrawal', () => { setStep('confirm'); setError(''); setOtp(['', '', '', '', '', '']); })}
        <p style={{ fontSize: 13, color: C.sub, margin: '0 0 20px', lineHeight: 1.6 }}>
          We've sent a 6-digit verification code to your registered phone number to confirm this withdrawal.
        </p>
        {errorBanner()}
        <div style={{ marginBottom: 20 }}>
          <OtpRow otp={otp} setOtp={setOtp} onPaste={handleOtpPaste} />
        </div>
        {primaryBtn('Confirm Withdrawal →', handleVerifyOtp, otp.join('').length !== 6)}
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          {otpCountdown > 0
            ? <span style={{ fontSize: 12, color: C.dim }}>Resend in {otpCountdown}s</span>
            : <button onClick={() => { setOtp(['', '', '', '', '', '']); setError(''); handleConfirmWithdraw(); }} style={{ fontSize: 12, color: C.lime, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Resend code</button>}
        </div>
      </>
    );
  }

  function renderSuccess() {
    return (
      <>
        {header('Withdrawal Submitted')}
        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,229,160,0.1)', border: `2px solid rgba(0,229,160,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <IcoCheck size={30} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>
            Your withdrawal request has been received and will be processed shortly.
          </p>
          <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: 1.65 }}>
            {amt.toFixed(2)} USDT is on its way to your {network} wallet. You'll see it reflected once the transfer is confirmed on-chain.
          </p>
        </div>
        <button onClick={onClose} style={{ width: '100%', padding: '13px', borderRadius: 11, fontSize: 14, fontWeight: 800, background: C.lime, color: '#000', border: 'none', cursor: 'pointer' }}>
          Done
        </button>
      </>
    );
  }

  const content = () => {
    switch (step) {
      case 'main': return renderMain();
      case 'amount': return renderAmount();
      case 'phoneRequired': return renderPhoneRequired();
      case 'network': return renderNetwork();
      case 'walletRequired': return renderWalletRequired();
      case 'kycRequired': return renderKycRequired();
      case 'confirm': return renderConfirm();
      case 'otp': return renderOtp();
      case 'success': return renderSuccess();
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9990,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 440, maxHeight: '92dvh',
        background: C.bg, border: `1px solid ${C.borderMd}`, borderRadius: '22px 22px 0 0',
        overflowY: 'auto', boxShadow: '0 -24px 80px rgba(0,0,0,0.7)',
        animation: 'wp-slide 0.3s cubic-bezier(0.34,1.1,0.64,1)',
      }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg,transparent,#CCFF00 40%,#CCFF00 60%,transparent)' }} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
        </div>
        <div style={{ padding: '16px 24px 40px' }}>
          {content()}
        </div>
      </div>
      <style>{`
        @keyframes wp-slide {
          from { transform: translateY(100%); opacity: 0.5; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @media (min-width: 640px) {
          @keyframes wp-slide-desktop {
            from { transform: translateY(16px) scale(0.98); opacity: 0; }
            to   { transform: translateY(0) scale(1);       opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}
