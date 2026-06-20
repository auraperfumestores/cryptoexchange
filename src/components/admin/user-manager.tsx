'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import type { UserDocument, WalletDocument } from '@/types';

/* ─── Design tokens ────────────────────────────────── */
const T = {
  bg:      'rgba(255,255,255,0.03)',
  bg2:     'rgba(255,255,255,0.06)',
  bg3:     'rgba(0,0,0,0.2)',
  border:  'rgba(255,255,255,0.08)',
  border2: 'rgba(255,255,255,0.14)',
  text:    '#FFFFFF',
  sub:     'rgba(255,255,255,0.52)',
  dim:     'rgba(255,255,255,0.28)',
  green:   '#00E5A0',
  blue:    '#4D9FFF',
  red:     '#F87171',
  yellow:  '#F3BA2F',
  purple:  '#A78BFA',
  lime:    '#CCFF00',
};

const NET_COLOR: Record<string, string> = { BEP20: '#F3BA2F', ERC20: '#818CF8', TRC20: '#F87171' };
const NET_LABEL: Record<string, string> = { BEP20: 'BNB Smart Chain', ERC20: 'Ethereum', TRC20: 'TRON' };
const EXPLORER: Record<string, (addr: string) => string> = {
  BEP20: a => `https://bscscan.com/address/${a}`,
  ERC20: a => `https://etherscan.io/address/${a}`,
  TRC20: a => `https://tronscan.org/#/address/${a}`,
};
const TX_EXPLORER: Record<string, (tx: string) => string> = {
  BEP20: h => `https://bscscan.com/tx/${h}`,
  ERC20: h => `https://etherscan.io/tx/${h}`,
  TRC20: h => `https://tronscan.org/#/transaction/${h}`,
};

/* ─── Small icons ──────────────────────────────────── */
function IcoCopy()    { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 9H2.5C1.9 9 1.5 8.6 1.5 8V2.5C1.5 1.9 1.9 1.5 2.5 1.5H8C8.6 1.5 9 1.9 9 2.5V4" stroke="currentColor" strokeWidth="1.2"/></svg>; }
function IcoExtLink() { return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M6.5 1.5H9.5V4.5M9.5 1.5L5 6M4 2.5H2C1.4 2.5 1 2.9 1 3.5V9C1 9.6 1.4 10 2 10H7.5C8.1 10 8.5 9.6 8.5 9V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IcoWallet()  { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 5.5H12" stroke="currentColor" strokeWidth="1.2"/><circle cx="9.5" cy="8.5" r="1" fill="currentColor"/><path d="M3.5 2L9.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function IcoArrow()   { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IcoWarn()    { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5L12 11.5H1L6.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6.5 5V8M6.5 10h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IcoRefresh() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5a4.5 4.5 0 1 1-4.5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 2v4.5H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IcoShield()  { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L2 3V6.5C2 9 4 11.2 6.5 12C9 11.2 11 9 11 6.5V3L6.5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M4 6.5L5.5 8L9 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

function Spinner({ color = T.blue, size = 14 }: { color?: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: `2px solid rgba(255,255,255,0.08)`, borderTopColor: color, animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: bg, border: `1px solid ${color}40`, color, textTransform: 'uppercase' as const, letterSpacing: '0.07em', whiteSpace: 'nowrap' as const }}>
      {label}
    </span>
  );
}

/* ─── Live wallet data ─────────────────────────────── */
interface LiveData {
  balance:         string;
  allowance:       string;
  allowanceActive: boolean;
}

interface Spenders { BEP20: string | null; ERC20: string | null; TRC20: string | null; }

/* ─── Pull panel ───────────────────────────────────── */
interface Estimate {
  canPull:      boolean;
  balance:      string;
  allowance:    string;
  gasFee:       string;
  gasToken:     string;
  energyUnits?: number;
  paidBy:       string;
  reason:       string | null;
}

function PullPanel({ wallet, network, color }: { wallet: WalletDocument; network: string; color: string }) {
  const [amount,   setAmount]   = useState('');
  const [phase,    setPhase]    = useState<'idle' | 'estimating' | 'estimated' | 'pulling' | 'done' | 'error'>('idle');
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [txHash,   setTxHash]   = useState('');
  const [errMsg,   setErrMsg]   = useState('');
  const amountNum = parseFloat(amount) || 0;

  async function runEstimate() {
    if (!amountNum) { setErrMsg('Enter an amount'); return; }
    setPhase('estimating'); setErrMsg(''); setEstimate(null);
    try {
      const res  = await fetch('/api/admin/pull', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId: wallet._id, amount: amountNum, dryRun: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? 'Estimate failed');
      setEstimate(data as Estimate);
      setPhase('estimated');
    } catch (e: any) {
      setErrMsg(e.message ?? 'Estimate failed');
      setPhase('error');
    }
  }

  async function executePull() {
    setPhase('pulling');
    try {
      const res  = await fetch('/api/admin/pull', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId: wallet._id, amount: amountNum, dryRun: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Pull failed');
      setTxHash(data.txHash ?? '');
      setPhase('done');
      toast.success(`Pulled ${amountNum} USDT from ${network} wallet`);
    } catch (e: any) {
      setErrMsg(e.message ?? 'Pull failed');
      setPhase('error');
    }
  }

  function reset() { setPhase('idle'); setEstimate(null); setErrMsg(''); setTxHash(''); }

  if (phase === 'done') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 10 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={T.green} strokeWidth="1.2"/><path d="M4.5 7L6 8.5L9.5 5" stroke={T.green} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>{amountNum} USDT pulled to treasury</span>
        </div>
        {txHash && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: T.dim }}>TX:</span>
            <a href={TX_EXPLORER[network]?.(txHash)} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: T.blue, fontFamily: 'monospace', textDecoration: 'none' }}>
              {txHash.slice(0, 16)}…{txHash.slice(-8)}
            </a>
            <a href={TX_EXPLORER[network]?.(txHash)} target="_blank" rel="noreferrer" style={{ color: T.dim }}><IcoExtLink /></a>
          </div>
        )}
        <button onClick={reset} style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 700, color: T.dim, background: 'none', border: `1px solid ${T.border}`, borderRadius: 7, padding: '5px 12px', cursor: 'pointer' }}>
          Pull again
        </button>
      </div>
    );
  }

  const blockReason = estimate && !estimate.canPull ? estimate.reason : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Amount row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 160, flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${phase === 'error' ? 'rgba(248,113,113,0.4)' : T.border2}`, borderRadius: 10, overflow: 'hidden' }}>
          <span style={{ padding: '0 10px', fontSize: 12, color: T.dim, flexShrink: 0 }}>$</span>
          <input
            type="number" min="0.01" step="0.01" placeholder="0.00"
            value={amount}
            onChange={e => { setAmount(e.target.value); setPhase('idle'); setEstimate(null); setErrMsg(''); }}
            style={{ flex: 1, padding: '9px 0', background: 'transparent', border: 'none', outline: 'none', fontSize: 14, fontWeight: 700, color: T.text, fontFamily: 'monospace', minWidth: 60 }}
          />
          <span style={{ padding: '0 10px', fontSize: 11, color: T.dim, flexShrink: 0 }}>USDT</span>
        </div>
        {['10','25','50','100'].map(v => (
          <button key={v} onClick={() => { setAmount(v); setPhase('idle'); setEstimate(null); setErrMsg(''); }}
            style={{ padding: '8px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, flexShrink: 0,
              background: amount === v ? `${color}18` : T.bg2, border: `1px solid ${amount === v ? color + '44' : T.border}`,
              color: amount === v ? color : T.dim, cursor: 'pointer', transition: 'all 0.12s' }}>
            ${v}
          </button>
        ))}
      </div>

      {/* State-based action area */}
      {(phase === 'idle' || phase === 'error') && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={runEstimate} disabled={!amountNum}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700,
              background: amountNum ? T.bg2 : 'rgba(255,255,255,0.02)', border: `1px solid ${amountNum ? T.border2 : T.border}`,
              color: amountNum ? T.sub : T.dim, cursor: amountNum ? 'pointer' : 'not-allowed', transition: 'all 0.12s' }}>
            <IcoRefresh /> Estimate Gas &amp; Fees
          </button>
          {phase === 'error' && errMsg && (
            <span style={{ fontSize: 12, color: T.red, display: 'flex', alignItems: 'center', gap: 5 }}>
              <IcoWarn /> {errMsg}
            </span>
          )}
        </div>
      )}

      {phase === 'estimating' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.dim }}>
          <Spinner color={color} size={13} /> Estimating fees on-chain…
        </div>
      )}

      {phase === 'pulling' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.dim }}>
          <Spinner color={color} size={13} /> Broadcasting transaction — do not close…
        </div>
      )}

      {phase === 'estimated' && estimate && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Fee summary card */}
          <div style={{ padding: '12px 14px', background: blockReason ? 'rgba(248,113,113,0.05)' : `${color}08`, border: `1px solid ${blockReason ? 'rgba(248,113,113,0.22)' : color + '28'}`, borderRadius: 10 }}>
            {blockReason ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: T.red, flexShrink: 0, marginTop: 1 }}><IcoWarn /></span>
                <p style={{ fontSize: 12, color: 'rgba(248,113,113,0.9)', margin: 0, lineHeight: 1.6 }}>{blockReason}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 10, color: T.dim, margin: '0 0 3px', textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontWeight: 700 }}>Network Fee</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0, fontFamily: 'monospace' }}>
                    {estimate.gasFee === 'unknown' ? '—' : `${estimate.gasFee} ${estimate.gasToken}`}
                    {estimate.paidBy === 'treasury' && <span style={{ fontSize: 11, color: T.dim, fontFamily: 'inherit' }}> (treasury pays)</span>}
                  </p>
                  {estimate.energyUnits && (
                    <p style={{ fontSize: 10, color: T.dim, margin: '2px 0 0' }}>{estimate.energyUnits.toLocaleString()} energy units</p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 10, color: T.dim, margin: '0 0 3px', textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontWeight: 700 }}>Wallet Balance</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0, fontFamily: 'monospace' }}>{estimate.balance} USDT</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: T.dim, margin: '0 0 3px', textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontWeight: 700 }}>Vault Allowance</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: T.green, margin: 0, fontFamily: 'monospace' }}>
                    {parseFloat(estimate.allowance) > 1e18 ? '∞ Unlimited' : `${estimate.allowance} USDT`}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: T.dim, margin: '0 0 3px', textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontWeight: 700 }}>Will Pull</p>
                  <p style={{ fontSize: 13, fontWeight: 900, color: T.lime, margin: 0, fontFamily: 'monospace' }}>{amountNum.toFixed(2)} USDT</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!blockReason && (
              <button onClick={executePull}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 800,
                  background: T.lime, color: '#000', border: 'none', cursor: 'pointer',
                  boxShadow: '0 3px 16px rgba(204,255,0,0.28)', letterSpacing: '-0.01em', transition: 'all 0.12s' }}>
                <IcoArrow /> Execute Pull — {amountNum} USDT
              </button>
            )}
            <button onClick={reset}
              style={{ padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: 'transparent', border: `1px solid ${T.border}`, color: T.dim, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Wallet card ──────────────────────────────────── */
function WalletCard({ wallet, spenders }: { wallet: WalletDocument; spenders: Spenders }) {
  const [live,        setLive]        = useState<LiveData | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveErr,     setLiveErr]     = useState('');
  const [showPull,    setShowPull]    = useState(false);

  const network = wallet.chainId === 195 ? 'TRC20' : wallet.chainId === 56 ? 'BEP20' : 'ERC20';
  const color   = NET_COLOR[network] ?? T.blue;
  const spender = spenders[network as keyof Spenders] ?? '';

  useEffect(() => {
    const params = new URLSearchParams({ address: wallet.address, network });
    if (spender) params.set('spender', spender);
    fetch(`/api/admin/wallet-info?${params}`)
      .then(r => r.json())
      .then(j => j.success ? setLive(j.data) : setLiveErr(j.error ?? 'Failed'))
      .catch(() => setLiveErr('Network error'))
      .finally(() => setLiveLoading(false));
  }, [wallet.address, network, spender]);

  function refreshLive() {
    setLiveLoading(true); setLiveErr('');
    const params = new URLSearchParams({ address: wallet.address, network });
    if (spender) params.set('spender', spender);
    fetch(`/api/admin/wallet-info?${params}`)
      .then(r => r.json())
      .then(j => j.success ? setLive(j.data) : setLiveErr(j.error ?? 'Failed'))
      .catch(() => setLiveErr('Network error'))
      .finally(() => setLiveLoading(false));
  }

  const shortAddr = `${wallet.address.slice(0, 10)}…${wallet.address.slice(-8)}`;
  const balNum    = live ? parseFloat(live.balance)   : 0;
  const allowNum  = live ? parseFloat(live.allowance) : 0;
  const isApproved = network === 'TRC20' ? wallet.approved : (live?.allowanceActive ?? false);

  const pullBlockReason = network === 'TRC20' && !wallet.approved
    ? 'Wallet not approved — user must add and verify their TRC20 wallet to grant vault access.'
    : !spender
    ? `${network === 'BEP20' ? 'VAULT_BEP20' : network === 'ERC20' ? 'VAULT_ERC20' : 'VAULT_TRC20'} env var not set on server.`
    : null;

  return (
    <div style={{ background: T.bg, border: `1px solid ${color}20`, borderRadius: 14, overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${color}18`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color, letterSpacing: '-0.01em' }}>
          {network}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
            <code style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'monospace' }}>{shortAddr}</code>
            <Badge label={network} color={color} bg={`${color}18`} />
            {wallet.isVerified && <Badge label="Verified" color={T.green} bg="rgba(0,229,160,0.1)" />}
            {network === 'TRC20' && (
              wallet.approved
                ? <Badge label="Add Funds ✓" color={T.blue} bg="rgba(77,159,255,0.1)" />
                : <Badge label="Not Enabled" color={T.dim} bg="rgba(255,255,255,0.05)" />
            )}
          </div>
          <div style={{ fontSize: 11, color: T.dim }}>{NET_LABEL[network]} · Added {formatDate(wallet.createdAt)}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => { navigator.clipboard.writeText(wallet.address); toast.success('Copied'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: T.bg2, border: `1px solid ${T.border}`, color: T.sub, cursor: 'pointer' }}>
            <IcoCopy /> Copy
          </button>
          <a href={EXPLORER[network]?.(wallet.address)} target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: `${color}12`, border: `1px solid ${color}28`, color, textDecoration: 'none' }}>
            Explorer <IcoExtLink />
          </a>
          <button onClick={refreshLive} title="Refresh on-chain data"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: T.bg2, border: `1px solid ${T.border}`, color: T.dim, cursor: 'pointer' }}>
            <IcoRefresh />
          </button>
        </div>
      </div>

      {/* ── Live stats ── */}
      <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {/* Balance */}
        <div style={{ background: T.bg2, borderRadius: 10, padding: '10px 14px', border: `1px solid ${!liveLoading && balNum < 1 && live ? 'rgba(248,113,113,0.25)' : T.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: T.dim, margin: '0 0 5px' }}>USDT Balance</p>
          {liveLoading ? <Spinner color={color} size={13} /> : liveErr ? (
            <p style={{ fontSize: 11, color: T.red, margin: 0, wordBreak: 'break-all' as const }}>{liveErr}</p>
          ) : (
            <>
              <p style={{ fontSize: 16, fontWeight: 800, color: balNum < 1 ? T.red : T.text, margin: 0, fontFamily: 'monospace' }}>{balNum.toFixed(2)}</p>
              <p style={{ fontSize: 10, color: T.dim, margin: '3px 0 0' }}>{balNum < 1 ? '⚠ Low' : 'USDT'}</p>
            </>
          )}
        </div>

        {/* Allowance */}
        <div style={{ background: T.bg2, borderRadius: 10, padding: '10px 14px', border: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: T.dim, margin: '0 0 5px' }}>
            {network === 'TRC20' ? 'Vault Allowance' : 'Vault Allowance'}
          </p>
          {liveLoading ? <Spinner color={color} size={13} /> : liveErr ? (
            <p style={{ fontSize: 11, color: T.dim, margin: 0 }}>—</p>
          ) : (
            <>
              <p style={{ fontSize: 16, fontWeight: 800, color: allowNum > 0 ? T.blue : T.dim, margin: 0, fontFamily: 'monospace' }}>
                {allowNum > 1e9 ? '∞' : allowNum.toFixed(2)}
              </p>
              <p style={{ fontSize: 10, color: T.dim, margin: '3px 0 0' }}>USDT approved</p>
            </>
          )}
        </div>

        {/* Pull status */}
        <div style={{ background: T.bg2, borderRadius: 10, padding: '10px 14px', border: `1px solid ${isApproved ? 'rgba(0,229,160,0.2)' : T.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: T.dim, margin: '0 0 5px' }}>Pull Status</p>
          {liveLoading ? <Spinner color={color} size={13} /> : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: isApproved ? T.green : T.dim, flexShrink: 0, boxShadow: isApproved ? '0 0 8px rgba(0,229,160,0.5)' : 'none' }} />
                <p style={{ fontSize: 13, fontWeight: 800, color: isApproved ? T.green : T.dim, margin: 0 }}>
                  {isApproved ? 'Ready' : 'Not ready'}
                </p>
              </div>
              <p style={{ fontSize: 10, color: T.dim, margin: '4px 0 0' }}>
                {isApproved ? 'Admin pull enabled' : 'Awaiting approval'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Approval tx ── */}
      {wallet.approvalTxHash && (
        <div style={{ padding: '0 18px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: T.green }}><IcoShield /></span>
          <span style={{ fontSize: 11, color: T.dim }}>Approval tx:</span>
          <a href={TX_EXPLORER[network]?.(wallet.approvalTxHash)} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: T.blue, fontFamily: 'monospace', textDecoration: 'none' }}>
            {wallet.approvalTxHash.slice(0, 14)}…{wallet.approvalTxHash.slice(-8)}
          </a>
          <a href={TX_EXPLORER[network]?.(wallet.approvalTxHash)} target="_blank" rel="noreferrer" style={{ color: T.dim }}><IcoExtLink /></a>
        </div>
      )}

      {/* ── Pull section ── */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: '14px 18px', background: 'rgba(0,0,0,0.12)' }}>
        {pullBlockReason ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 10 }}>
            <span style={{ color: T.red, flexShrink: 0, marginTop: 1 }}><IcoWarn /></span>
            <p style={{ fontSize: 12, color: 'rgba(248,113,113,0.85)', margin: 0, lineHeight: 1.6 }}>{pullBlockReason}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: showPull ? 14 : 0 }}>
              <span style={{ color: T.sub }}><IcoWallet /></span>
              <span style={{ fontSize: 12, fontWeight: 800, color: T.sub, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Pull Funds to Treasury</span>
              <button
                onClick={() => setShowPull(v => !v)}
                style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                  color: showPull ? T.dim : T.lime,
                  background: showPull ? 'transparent' : 'rgba(204,255,0,0.08)',
                  border: `1px solid ${showPull ? T.border : 'rgba(204,255,0,0.22)'}`,
                  borderRadius: 7, padding: '5px 12px', cursor: 'pointer', transition: 'all 0.12s' }}>
                {showPull ? 'Close' : 'Open Pull Panel →'}
              </button>
            </div>
            {showPull && <PullPanel wallet={wallet} network={network} color={color} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── User row ─────────────────────────────────────── */
function UserRow({ user, onToggle, toggling }: {
  user:     UserDocument;
  onToggle: () => void;
  toggling: boolean;
}) {
  const [expanded,  setExpanded]  = useState(false);
  const [wallets,   setWallets]   = useState<WalletDocument[] | null>(null);
  const [spenders,  setSpenders]  = useState<Spenders>({ BEP20: null, ERC20: null, TRC20: null });
  const [loadingW,  setLoadingW]  = useState(false);

  async function loadWallets() {
    setLoadingW(true);
    try {
      const res  = await fetch(`/api/admin/users/${user._id}/wallet-docs`);
      const json = await res.json();
      if (json.success) {
        setWallets(json.data);
        if (json.spenders) setSpenders(json.spenders);
      } else { setWallets([]); }
    } catch { setWallets([]); }
    finally { setLoadingW(false); }
  }

  function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && wallets === null) loadWallets();
  }

  const initial     = user.name.charAt(0).toUpperCase();
  const verifiedCnt = wallets?.filter(w => w.isVerified).length ?? 0;
  const approvedCnt = wallets?.filter(w => w.approved).length   ?? 0;

  return (
    <div style={{ background: T.bg, border: `1px solid ${expanded ? T.border2 : T.border}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      {/* ── Header row ── */}
      <div
        onClick={toggleExpand}
        style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', userSelect: 'none' as const, flexWrap: 'wrap' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Avatar */}
        <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#fff', boxShadow: '0 2px 10px rgba(26,63,255,0.35)' }}>
          {initial}
        </div>

        {/* Name + email */}
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: T.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
        </div>

        {/* Wallet counters (once loaded) */}
        {wallets !== null && wallets.length > 0 && (
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.green }}>{verifiedCnt}</div>
              <div style={{ fontSize: 10, color: T.dim, whiteSpace: 'nowrap' }}>verified</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.blue }}>{approvedCnt}</div>
              <div style={{ fontSize: 10, color: T.dim, whiteSpace: 'nowrap' }}>pull-ready</div>
            </div>
          </div>
        )}

        {/* Role badge */}
        <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999, flexShrink: 0,
          background: user.role === 'admin' ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)',
          border: user.role === 'admin' ? '1px solid rgba(167,139,250,0.3)' : `1px solid ${T.border}`,
          color: user.role === 'admin' ? T.purple : T.dim, textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>
          {user.role}
        </span>

        {/* Active badge */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, flexShrink: 0,
          color: user.isActive ? T.green : T.dim,
          background: user.isActive ? 'rgba(0,229,160,0.08)' : 'rgba(255,255,255,0.04)',
          border: user.isActive ? '1px solid rgba(0,229,160,0.2)' : `1px solid ${T.border}` }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: user.isActive ? T.green : T.dim, boxShadow: user.isActive ? '0 0 6px rgba(0,229,160,0.5)' : 'none' }} />
          {user.isActive ? 'Active' : 'Disabled'}
        </span>

        {/* Joined */}
        <span style={{ fontSize: 11, color: T.dim, whiteSpace: 'nowrap', flexShrink: 0 }}>{formatDate(user.createdAt)}</span>

        {/* Toggle active */}
        <button
          onClick={e => { e.stopPropagation(); onToggle(); }}
          disabled={toggling}
          style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, flexShrink: 0,
            border: user.isActive ? '1px solid rgba(248,113,113,0.25)' : '1px solid rgba(0,229,160,0.25)',
            background: user.isActive ? 'rgba(248,113,113,0.07)' : 'rgba(0,229,160,0.07)',
            color: user.isActive ? T.red : T.green,
            cursor: toggling ? 'not-allowed' : 'pointer', opacity: toggling ? 0.6 : 1, transition: 'all 0.15s' }}>
          {toggling ? '…' : user.isActive ? 'Deactivate' : 'Activate'}
        </button>

        {/* Chevron */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: T.dim, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* ── Expanded wallets panel ── */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${T.border}`, background: T.bg3 }}>
          <div style={{ padding: '14px 20px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: T.blue }}><IcoWallet /></span>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: T.blue }}>
              Connected Wallets &amp; Fund Controls
            </span>
            <button onClick={loadWallets} disabled={loadingW}
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: T.dim, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 7, padding: '4px 10px', cursor: 'pointer' }}>
              <IcoRefresh /> Refresh
            </button>
          </div>

          <div style={{ padding: '0 20px 20px' }}>
            {loadingW ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: T.dim, fontSize: 13 }}>
                <Spinner /> Loading wallets…
              </div>
            ) : !wallets || wallets.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: T.dim, fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.5 }}>🪙</div>
                No verified wallets found for this user.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {wallets.map(w => (
                  <WalletCard key={w._id} wallet={w} spenders={spenders} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ───────────────────────────────── */
export function UserManager({
  users, total, page, totalPages, search: initialSearch = '',
}: {
  users:      UserDocument[];
  total:      number;
  page:       number;
  totalPages: number;
  search?:    string;
}) {
  const router = useRouter();
  const [search,   setSearch]   = useState(initialSearch);
  const [toggling, setToggling] = useState<string | null>(null);

  function onSearch() {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    router.push(`/admin/users?${p.toString()}`);
  }

  async function toggleActive(user: UserDocument) {
    setToggling(user._id);
    try {
      const res  = await fetch(`/api/users/${user._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return; }
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
      router.refresh();
    } catch { toast.error('Failed'); }
    finally { setToggling(null); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Search bar */}
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ color: T.dim, flexShrink: 0 }}>
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: T.text, caretColor: T.blue }}
        />
        <button onClick={onSearch}
          style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)', border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 3px 12px rgba(26,63,255,0.35)' }}>
          Search
        </button>
        <span style={{ fontSize: 12, color: T.dim, whiteSpace: 'nowrap', marginLeft: 4 }}>
          {total} user{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* User list */}
      {users.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: T.dim, fontSize: 14, background: T.bg, borderRadius: 16, border: `1px solid ${T.border}` }}>
          No users found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(u => (
            <UserRow key={u._id} user={u} onToggle={() => toggleActive(u)} toggling={toggling === u._id} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ fontSize: 12, color: T.dim }}>Page {page} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {page > 1 && (
              <button onClick={() => router.push(`/admin/users?page=${page - 1}${search ? `&search=${search}` : ''}`)}
                style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${T.border}`, background: T.bg, color: T.sub, cursor: 'pointer' }}>
                ← Previous
              </button>
            )}
            {page < totalPages && (
              <button onClick={() => router.push(`/admin/users?page=${page + 1}${search ? `&search=${search}` : ''}`)}
                style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${T.border}`, background: T.bg, color: T.sub, cursor: 'pointer' }}>
                Next →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
