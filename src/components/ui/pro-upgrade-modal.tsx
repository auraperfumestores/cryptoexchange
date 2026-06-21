'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Crown, Check, X, ArrowRight, Phone, Wallet } from '@phosphor-icons/react';
import { QRCodeSVG } from 'qrcode.react';

type ProNetwork = 'BEP20' | 'ERC20' | 'TRC20';
type Screen = 'loading' | 'alreadyPro' | 'prereq' | 'payment' | 'verifying' | 'success';

interface PendingPayment {
  id?: string;
  network: ProNetwork;
  depositAddress: string;
  amountUsdt: number;
  fromAddress: string;
  expiresAt: string;
}

interface ProStatus {
  isPro: boolean;
  expiresAt: string | null;
  phoneVerified: boolean;
  hasWallet: boolean;
  priceUsdt: number;
  durationDays: number;
  managerTelegram: string;
  pendingPayment: PendingPayment | null;
}

const NET_LABEL: Record<ProNetwork, string> = { BEP20: 'BNB Smart Chain', ERC20: 'Ethereum', TRC20: 'TRON' };
const NET_COLOR: Record<ProNetwork, string> = { BEP20: '#F3BA2F', ERC20: '#627EEA', TRC20: '#EF4444' };
const NET_TOKEN: Record<ProNetwork, string> = { BEP20: 'USDT (BEP20)', ERC20: 'USDT (ERC20)', TRC20: 'USDT (TRC20)' };

/* ── Design tokens ── */
const T = {
  bg:      '#0e0e0e',
  card:    '#141414',
  border:  'rgba(255,210,0,0.18)',
  text:    '#fff',
  sub:     'rgba(255,255,255,0.55)',
  dim:     'rgba(255,255,255,0.3)',
  gold:    '#FFD700',
  goldBg:  'rgba(255,210,0,0.08)',
  goldBdr: 'rgba(255,210,0,0.2)',
  lime:    '#CCFF00',
  success: '#4ADE80',
  danger:  '#F87171',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`, color: copied ? T.success : T.sub, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
    >
      {copied
        ? <><Check size={11} weight="bold" />Copied</>
        : <><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1" y="3" width="7" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><path d="M4 3V2C4 1.4 4.4 1 5 1H10C10.6 1 11 1.4 11 2V8C11 8.6 10.6 9 10 9H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>Copy</>}
    </button>
  );
}

function LoaderBars({ color = T.gold }: { color?: string }) {
  return (
    <>
      <style>{`@keyframes pb-bar{0%,100%{transform:scaleY(.35);opacity:.35}50%{transform:scaleY(1);opacity:1}}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 3, height: 16, borderRadius: 99, background: color, transformOrigin: 'center', animation: `pb-bar 0.75s ease-in-out ${i * 0.13}s infinite` }} />
        ))}
      </div>
    </>
  );
}

function GoldBar() {
  return <div style={{ height: 3, background: 'linear-gradient(90deg,transparent,#FFD700 30%,#FFB800 70%,transparent)' }} />;
}

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <X size={14} weight="bold" />
    </button>
  );
}

function ProBenefitRow({ label, value }: { label: string; value: string | boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 10 }}>
      <div style={{ width: 20, height: 20, borderRadius: 6, background: T.goldBg, border: `1px solid ${T.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Check size={11} weight="bold" color={T.gold} />
      </div>
      <span style={{ fontSize: 12, color: T.sub, flex: 1 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: T.gold }}>
        {typeof value === 'boolean' ? <Check size={13} weight="bold" color={T.gold} /> : value}
      </span>
    </div>
  );
}

export function ProUpgradeModal({ onClose }: { onClose: () => void }) {
  const [screen,     setScreen]     = useState<Screen>('loading');
  const [proStatus,  setProStatus]  = useState<ProStatus | null>(null);
  const [network,    setNetwork]    = useState<ProNetwork>('BEP20');
  const [payment,    setPayment]    = useState<PendingPayment | null>(null);
  const [initiating, setInitiating] = useState(false);
  const [error,      setError]      = useState('');
  const [countdown,  setCountdown]  = useState('');
  const [txHash,     setTxHash]     = useState('');
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  /* Fetch status on mount */
  useEffect(() => {
    fetchStatus();
    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function fetchStatus() {
    try {
      const res  = await fetch('/api/pro/status');
      const json = await res.json();
      if (!mountedRef.current) return;
      const data: ProStatus = json.data;
      setProStatus(data);

      if (data.isPro) { setScreen('alreadyPro'); return; }
      if (data.pendingPayment) {
        setPayment(data.pendingPayment);
        setNetwork(data.pendingPayment.network);
        startPolling();
        setScreen('verifying');
        return;
      }
      if (!data.phoneVerified || !data.hasWallet) { setScreen('prereq'); return; }
      setScreen('payment');
    } catch {
      setScreen('prereq'); // fail safe
    }
  }

  /* Countdown timer */
  useEffect(() => {
    if (!payment?.expiresAt) return;
    const tick = () => {
      const diff = new Date(payment.expiresAt).getTime() - Date.now();
      if (diff <= 0) { setCountdown('Expired'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${m}:${s.toString().padStart(2, '0')}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [payment?.expiresAt]);

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        const res  = await fetch('/api/pro/poll');
        const json = await res.json();
        if (!mountedRef.current) return;
        if (json.status === 'confirmed') {
          clearInterval(pollRef.current!);
          setTxHash(json.txHash ?? '');
          setScreen('success');
        } else if (json.status === 'expired') {
          clearInterval(pollRef.current!);
          setScreen('payment');
          setPayment(null);
        }
      } catch { /* keep polling */ }
    }, 10_000);
  }

  async function initiatePayment() {
    setInitiating(true); setError('');
    try {
      const res  = await fetch('/api/pro/initiate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ network }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      const p: PendingPayment = { ...json.data, id: json.data.paymentId };
      setPayment(p);
      setNetwork(p.network);
      startPolling();
      setScreen('verifying');
    } catch (e: any) {
      setError(e.message ?? 'Failed to initiate payment');
    } finally {
      setInitiating(false);
    }
  }

  /* ── Shared shell ── */
  const shell = (content: React.ReactNode) => (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div style={{ width: '100%', maxWidth: 420, maxHeight: '92dvh', overflowY: 'auto', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'pm-in 0.26s cubic-bezier(0.34,1.1,0.64,1)' }}>
        {/* Ambient orbs */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }}>
          <div style={{ position: 'absolute', top: -100, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,200,0,0.08) 0%,transparent 65%)', animation: 'pm-orb1 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,160,0,0.05) 0%,transparent 65%)', animation: 'pm-orb2 18s ease-in-out infinite' }} />
        </div>
        <GoldBar />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {content}
        </div>
      </div>
      <style>{`
        @keyframes pm-in   { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:none} }
        @keyframes pm-orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-18px,18px) scale(1.1)} }
        @keyframes pm-orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(14px,-14px) scale(1.08)} }
        @keyframes pm-spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );

  /* ── Header row (reused) ── */
  const header = (title: string, sub: string) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px 0', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,rgba(255,210,0,0.18),rgba(255,150,0,0.1))', border: '1.5px solid rgba(255,210,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Crown size={22} weight="fill" color={T.gold} />
        </div>
        <div>
          <p style={{ fontSize: 17, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>{title}</p>
          <p style={{ fontSize: 11, color: T.dim, margin: '2px 0 0' }}>{sub}</p>
        </div>
      </div>
      <CloseBtn onClose={onClose} />
    </div>
  );

  /* ══ SCREENS ══════════════════════════════════════════════════════════════ */

  /* Loading */
  if (screen === 'loading') return shell(
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
      <LoaderBars />
    </div>
  );

  /* Already PRO */
  if (screen === 'alreadyPro' && proStatus) return shell(
    <div style={{ padding: '22px 22px 28px' }}>
      {header('SwapINR PRO', 'Your membership is active')}
      <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,rgba(255,210,0,0.2),rgba(255,150,0,0.12))', border: '2px solid rgba(255,210,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Crown size={34} weight="fill" color={T.gold} />
        </div>
        <p style={{ fontSize: 20, fontWeight: 900, color: T.gold, margin: '0 0 6px', letterSpacing: '-0.02em' }}>You are a PRO member!</p>
        <p style={{ fontSize: 13, color: T.sub, margin: 0 }}>Enjoy your exclusive benefits</p>
        {proStatus.expiresAt && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '6px 14px', background: T.goldBg, border: `1px solid ${T.goldBdr}`, borderRadius: 99, fontSize: 11, color: T.gold, fontWeight: 700 }}>
            Active until {new Date(proStatus.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>
      <div style={{ background: T.card, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 14, padding: '4px 16px', marginBottom: 20 }}>
        <ProBenefitRow label="Exchange rate"  value="+1% better sell · -1% on buy" />
        <ProBenefitRow label="Daily limit"    value="Unlimited" />
        <ProBenefitRow label="Settlement"     value="< 8 min*" />
        <ProBenefitRow label="CDM & Cash"     value={true} />
        <ProBenefitRow label="Payout methods" value="UPI · NEFT · RTGS · IMPS · CDM · Cash" />
        <ProBenefitRow label="Dedicated manager" value={true} />
      </div>
      {proStatus.managerTelegram && (
        <a href={proStatus.managerTelegram} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 12, background: 'rgba(0,136,204,0.1)', border: '1px solid rgba(0,136,204,0.3)', color: '#0088cc', fontSize: 14, fontWeight: 800, textDecoration: 'none', marginBottom: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.248 13.78l-2.95-.924c-.64-.204-.657-.64.136-.954l11.498-4.431c.535-.194 1.003.131.63.777z"/></svg>
          Contact Your Manager
        </a>
      )}
      <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 12, background: T.goldBg, border: `1px solid ${T.goldBdr}`, color: T.gold, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
        Got it
      </button>
    </div>
  );

  /* Prerequisites not met */
  if (screen === 'prereq' && proStatus) return shell(
    <div style={{ padding: '22px 22px 28px' }}>
      {header('Upgrade to PRO', 'Complete these steps to unlock payment')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {[
          {
            done: proStatus.phoneVerified,
            icon: <Phone size={18} weight="fill" color={proStatus.phoneVerified ? T.success : T.dim} />,
            label: 'Verify your phone number',
            sub: proStatus.phoneVerified ? 'Completed' : 'Required for Pro access',
            href: '/settings',
          },
          {
            done: proStatus.hasWallet,
            icon: <Wallet size={18} weight="fill" color={proStatus.hasWallet ? T.success : T.dim} />,
            label: 'Connect a verified wallet',
            sub: proStatus.hasWallet ? 'Completed' : 'Need at least one verified USDT wallet',
            href: '/wallets',
          },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: step.done ? 'rgba(74,222,128,0.04)' : T.goldBg, border: `1px solid ${step.done ? 'rgba(74,222,128,0.2)' : T.goldBdr}`, borderRadius: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: step.done ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${step.done ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {step.done ? <Check size={18} weight="bold" color={T.success} /> : step.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: step.done ? T.success : T.text, margin: 0 }}>{step.label}</p>
              <p style={{ fontSize: 11, color: T.dim, margin: '2px 0 0' }}>{step.sub}</p>
            </div>
            {!step.done && (
              <a href={step.href} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: T.gold, textDecoration: 'none' }}>
                Go <ArrowRight size={12} weight="bold" />
              </a>
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 16px', background: T.goldBg, border: `1px solid ${T.goldBdr}`, borderRadius: 12, marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: T.gold, margin: 0, lineHeight: 1.65, display: 'flex', gap: 8 }}>
          <Crown size={14} weight="fill" style={{ flexShrink: 0, marginTop: 1 }} />
          Complete both steps above, then return here to pay {proStatus.priceUsdt} USDT and activate {proStatus.durationDays}-day Pro membership.
        </p>
      </div>
      <button onClick={onClose} style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: T.sub, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        Close
      </button>
    </div>
  );

  /* Payment screen — network select + initiate */
  if (screen === 'payment' && proStatus) return shell(
    <div style={{ padding: '22px 22px 28px' }}>
      {header('Upgrade to PRO', `Pay ${proStatus.priceUsdt} USDT · Instant activation`)}

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.dim, margin: '0 0 10px' }}>Select payment network</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {(['BEP20', 'ERC20', 'TRC20'] as ProNetwork[]).map(n => {
          const active = network === n;
          const col    = NET_COLOR[n];
          return (
            <button key={n} onClick={() => setNetwork(n)} style={{ flex: 1, padding: '10px 6px', borderRadius: 12, border: `1px solid ${active ? col : 'rgba(255,255,255,0.1)'}`, background: active ? `${col}18` : 'rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: active ? col : T.sub, letterSpacing: '0.06em' }}>{n}</div>
              <div style={{ fontSize: 9, color: T.dim, marginTop: 2 }}>{NET_LABEL[n].split(' ')[0]}</div>
            </button>
          );
        })}
      </div>

      <div style={{ background: T.goldBg, border: `1px solid ${T.goldBdr}`, borderRadius: 14, padding: '14px 18px', marginBottom: 22 }}>
        {[
          { label: 'Amount',  value: `${proStatus.priceUsdt} USDT` },
          { label: 'Token',   value: NET_TOKEN[network] },
          { label: 'Network', value: NET_LABEL[network] },
          { label: 'Period',  value: `${proStatus.durationDays} days` },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 12 }}>
            <span style={{ color: T.dim }}>{r.label}</span>
            <span style={{ color: T.text, fontWeight: 700, fontFamily: 'monospace' }}>{r.value}</span>
          </div>
        ))}
      </div>

      {error && <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, fontSize: 12, color: T.danger }}>{error}</div>}

      <button
        onClick={initiatePayment}
        disabled={initiating}
        style={{ width: '100%', padding: '15px', borderRadius: 13, background: initiating ? 'rgba(255,210,0,0.2)' : 'linear-gradient(135deg,#FFD700,#FFB800)', color: '#000', fontSize: 15, fontWeight: 900, border: 'none', cursor: initiating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(255,200,0,0.28)' }}
      >
        {initiating
          ? <><LoaderBars color="#000" />Generating QR…</>
          : <><Crown size={16} weight="fill" />Generate Payment QR</>}
      </button>
      <p style={{ fontSize: 11, color: T.dim, textAlign: 'center', margin: '10px 0 0' }}>QR code expires in 60 minutes after generation</p>
    </div>
  );

  /* Verifying — QR code + live polling */
  if ((screen === 'verifying') && payment) {
    const timeLeft = countdown || '—';
    const qrData   = payment.depositAddress;
    return shell(
      <div style={{ padding: '22px 22px 28px' }}>
        {header('Send Payment', 'Scan QR or copy address to pay')}

        {/* Live status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 10, marginBottom: 18 }}>
          <LoaderBars color={T.lime} />
          <p style={{ fontSize: 12, color: T.lime, margin: 0, fontWeight: 700 }}>Watching blockchain — expires in {timeLeft}</p>
        </div>

        {/* QR code */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{ padding: 14, background: '#fff', borderRadius: 16 }}>
            <QRCodeSVG value={qrData} size={160} level="M" />
          </div>
        </div>

        {/* Amount */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: T.gold, fontFamily: 'monospace', letterSpacing: '-0.03em' }}>{payment.amountUsdt} USDT</span>
          <p style={{ fontSize: 12, color: T.dim, margin: '4px 0 0' }}>{NET_TOKEN[payment.network]} · {NET_LABEL[payment.network]}</p>
        </div>

        {/* Address */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.dim, margin: '0 0 6px' }}>Send to address</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: T.text, flex: 1, wordBreak: 'break-all', lineHeight: 1.5 }}>{payment.depositAddress}</span>
            <CopyButton text={payment.depositAddress} />
          </div>
        </div>

        {/* From wallet */}
        <div style={{ padding: '10px 14px', background: T.goldBg, border: `1px solid ${T.goldBdr}`, borderRadius: 10, marginBottom: 18 }}>
          <p style={{ fontSize: 11, color: T.gold, margin: 0, lineHeight: 1.6 }}>
            Send <strong>exactly {payment.amountUsdt} USDT</strong> from your verified wallet:
            <br />
            <span style={{ fontFamily: 'monospace', fontSize: 10, opacity: 0.7, wordBreak: 'break-all' }}>{payment.fromAddress}</span>
          </p>
        </div>

        {/* Network selector to switch */}
        <p style={{ fontSize: 11, color: T.dim, margin: '0 0 8px' }}>Wrong network? Start over with a different one:</p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {(['BEP20', 'ERC20', 'TRC20'] as ProNetwork[]).map(n => {
            const active = payment.network === n;
            return (
              <button key={n} disabled={active} onClick={async () => { setPayment(null); setNetwork(n); setScreen('payment'); if (pollRef.current) clearInterval(pollRef.current); }} style={{ flex: 1, padding: '7px 4px', borderRadius: 9, border: `1px solid ${active ? NET_COLOR[n] : 'rgba(255,255,255,0.1)'}`, background: active ? `${NET_COLOR[n]}18` : 'transparent', color: active ? NET_COLOR[n] : T.dim, fontSize: 10, fontWeight: 700, cursor: active ? 'default' : 'pointer' }}>{n}</button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: T.sub, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Close (payment continues)
          </button>
        </div>
        <p style={{ fontSize: 10, color: T.dim, textAlign: 'center', margin: '10px 0 0' }}>You can close this window — we&apos;ll verify in the background and activate your account.</p>
      </div>
    );
  }

  /* Success */
  if (screen === 'success') return shell(
    <div style={{ padding: '22px 22px 28px', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg,rgba(255,210,0,0.2),rgba(255,150,0,0.12))', border: '2px solid rgba(255,210,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px auto 18px' }}>
        <Crown size={38} weight="fill" color={T.gold} />
      </div>
      <p style={{ fontSize: 24, fontWeight: 900, color: T.gold, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Welcome to PRO!</p>
      <p style={{ fontSize: 14, color: T.sub, margin: '0 0 24px', lineHeight: 1.6 }}>Your membership is now active. Enjoy better rates, unlimited limits, and exclusive payout methods.</p>
      {txHash && (
        <div style={{ marginBottom: 18, padding: '10px 14px', background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10 }}>
          <p style={{ fontSize: 10, color: T.success, margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Transaction confirmed</p>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: T.sub, wordBreak: 'break-all' }}>{txHash}</span>
        </div>
      )}
      <div style={{ background: T.card, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '4px 16px', marginBottom: 20, textAlign: 'left' }}>
        <ProBenefitRow label="+1% sell / -1% buy rates" value={true} />
        <ProBenefitRow label="Unlimited daily & monthly limits" value={true} />
        <ProBenefitRow label="CDM & Cash deposits" value={true} />
        <ProBenefitRow label="Dedicated manager" value={true} />
      </div>
      <button onClick={() => { window.location.reload(); }} style={{ width: '100%', padding: '14px', borderRadius: 13, background: 'linear-gradient(135deg,#FFD700,#FFB800)', color: '#000', fontSize: 15, fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,200,0,0.3)' }}>
        Start Trading as PRO
      </button>
    </div>
  );

  return null;
}
