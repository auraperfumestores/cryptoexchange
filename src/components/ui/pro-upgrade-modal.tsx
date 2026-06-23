'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import {
  Crown, Check, X, ArrowRight, Phone, Wallet,
} from '@phosphor-icons/react';
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

type FeatureValue = boolean | string;
interface FeatureRow { label: string; free: FeatureValue; pro: FeatureValue }

const FEATURES: FeatureRow[] = [
  { label: 'Exchange rate',       free: 'Standard',     pro: '+1% sell · −1% buy' },
  { label: 'Daily limit',         free: false,          pro: 'Unlimited'          },
  { label: 'Monthly limit',       free: false,          pro: 'Unlimited'          },
  { label: 'Settlement speed',    free: 'Standard',     pro: 'Under 8 minutes'    },
  { label: 'CDM deposits',        free: false,          pro: true                 },
  { label: 'Cash deals',          free: false,          pro: true                 },
  { label: 'Personal manager',    free: false,          pro: true                 },
];

/* ── Design tokens ── */
const T = {
  bg:      '#0c0c0c',
  card:    '#141414',
  card2:   '#181818',
  border:  'rgba(255,210,0,0.15)',
  text:    '#fff',
  sub:     'rgba(255,255,255,0.5)',
  dim:     'rgba(255,255,255,0.28)',
  gold:    '#FFD700',
  goldBg:  'rgba(255,210,0,0.07)',
  goldBdr: 'rgba(255,210,0,0.18)',
  lime:    '#CCFF00',
  success: '#4ADE80',
  danger:  '#F87171',
};

/* ── Helpers ── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 8, background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.07)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.12)'}`, color: copied ? T.success : T.sub, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0, whiteSpace: 'nowrap' }}
    >
      {copied ? <><Check size={11} weight="bold" />Copied</> : <>Copy</>}
    </button>
  );
}

function FeatureCell({ value, accent }: { value: FeatureValue; accent: boolean }) {
  if (value === true)  return <Check size={13} weight="bold" color={accent ? T.gold : T.success} />;
  if (value === false) return <X size={12} weight="bold" color={accent ? 'rgba(255,210,0,0.3)' : 'rgba(255,255,255,0.18)'} />;
  return <span style={{ fontSize: 10.5, fontWeight: 800, color: accent ? T.gold : T.dim, lineHeight: 1.3 }}>{value}</span>;
}

function ComparisonTable({ compact = false }: { compact?: boolean }) {
  const pad = compact ? '7px 6px' : '11px 8px';
  const labelSize = compact ? 10.5 : 12;
  const headSize  = compact ? 9 : 10;
  return (
    <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.95fr' }}>
        {/* Header row */}
        <div style={{ padding: pad, background: T.card2 }} />
        <div style={{ padding: pad, background: T.card2, borderLeft: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', fontSize: headSize, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.dim }}>
          Free
        </div>
        <div style={{ padding: pad, background: 'linear-gradient(135deg,rgba(255,210,0,0.18),rgba(255,150,0,0.09))', borderLeft: `1px solid ${T.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: headSize, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.gold }}>
          <Crown size={compact ? 10 : 11} weight="fill" />Pro
        </div>

        {FEATURES.map((f, i) => (
          <Fragment key={f.label}>
            <div style={{ padding: pad, background: i % 2 ? T.card2 : T.card, fontSize: labelSize, fontWeight: 650, color: T.sub, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
              {f.label}
            </div>
            <div style={{ padding: pad, background: i % 2 ? T.card2 : T.card, borderTop: '1px solid rgba(255,255,255,0.05)', borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FeatureCell value={f.free} accent={false} />
            </div>
            <div style={{ padding: pad, background: i % 2 ? 'rgba(255,210,0,0.05)' : 'rgba(255,210,0,0.08)', borderTop: `1px solid ${T.goldBdr}`, borderLeft: `1px solid ${T.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FeatureCell value={f.pro} accent />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function Bars({ color = T.gold }: { color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: 3, height: 14, borderRadius: 99, background: color, transformOrigin: 'center', animation: `pb-bar 0.75s ease-in-out ${i*0.13}s infinite` }} />
      ))}
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
  const pollRef    = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    fetchStatus();
    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function fetchStatus() {
    try {
      const json = await fetch('/api/pro/status').then(r => r.json());
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
    } catch { setScreen('prereq'); }
  }

  useEffect(() => {
    if (!payment?.expiresAt) return;
    const tick = () => {
      const diff = new Date(payment.expiresAt).getTime() - Date.now();
      if (diff <= 0) { setCountdown('Expired'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${m}:${s.toString().padStart(2,'0')}`);
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
        const json = await fetch('/api/pro/poll').then(r => r.json());
        if (!mountedRef.current) return;
        if (json.status === 'confirmed') {
          clearInterval(pollRef.current!);
          setTxHash(json.txHash ?? '');
          setScreen('success');
        } else if (json.status === 'expired') {
          clearInterval(pollRef.current!);
          setPayment(null);
          setScreen('payment');
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
    } finally { setInitiating(false); }
  }

  /* ── Shell wrapper ── */
  const shell = (content: React.ReactNode, wide = false) => (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      <div style={{ width: '100%', maxWidth: wide ? 460 : 420, maxHeight: '94dvh', overflowY: 'auto', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 28, position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,210,0,0.06)', animation: 'pm-in 0.28s cubic-bezier(0.34,1.1,0.64,1)' }}>
        {/* Ambient glow */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }}>
          <div style={{ position: 'absolute', top: -120, right: -80, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,195,0,0.09) 0%,transparent 65%)', animation: 'pm-orb1 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: -100, left: -70, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,140,0,0.06) 0%,transparent 65%)', animation: 'pm-orb2 18s ease-in-out infinite' }} />
        </div>
        {/* Gold top rule */}
        <div style={{ height: 3, borderRadius: '28px 28px 0 0', background: 'linear-gradient(90deg,transparent,#FFD700 25%,#FFE566 50%,#FFB800 75%,transparent)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>{content}</div>
      </div>
      <style>{`
        @keyframes pm-in   { from{opacity:0;transform:scale(0.93) translateY(10px)} to{opacity:1;transform:none} }
        @keyframes pm-orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,20px) scale(1.1)} }
        @keyframes pm-orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(16px,-16px) scale(1.08)} }
        @keyframes pb-bar  { 0%,100%{transform:scaleY(.3);opacity:.3} 50%{transform:scaleY(1);opacity:1} }
        @keyframes pm-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pm-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,204,0,0)} 50%{box-shadow:0 0 0 6px rgba(255,204,0,0.08)} }
      `}</style>
    </div>
  );

  /* Close button */
  const closeBtn = (
    <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: T.dim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
      <X size={14} weight="bold" />
    </button>
  );

  /* ═══════════════════════════════════════════════════════════════
     LOADING
  ════════════════════════════════════════════════════════════════ */
  if (screen === 'loading') return shell(
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
      <Bars />
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     ALREADY PRO
  ════════════════════════════════════════════════════════════════ */
  if (screen === 'alreadyPro' && proStatus) return shell(
    <div style={{ padding: '24px 24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg,rgba(255,210,0,0.2),rgba(255,150,0,0.12))', border: '1.5px solid rgba(255,210,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Crown size={24} weight="fill" color={T.gold} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>SwapINR <span style={{ color: T.gold }}>PRO</span></p>
            <p style={{ fontSize: 11, color: T.dim, margin: '2px 0 0' }}>Your membership is active</p>
          </div>
        </div>
        {closeBtn}
      </div>

      {/* Status pill */}
      {proStatus.expiresAt && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', background: T.goldBg, border: `1px solid ${T.goldBdr}`, borderRadius: 12, marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.gold, boxShadow: '0 0 8px rgba(255,210,0,0.6)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.gold }}>
            Active until {new Date(proStatus.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      )}

      {/* Feature comparison */}
      <div style={{ marginBottom: 16 }}>
        <ComparisonTable />
      </div>

      {proStatus.managerTelegram && (
        <a href={proStatus.managerTelegram} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'rgba(0,136,204,0.07)', border: '1px solid rgba(0,136,204,0.2)', borderRadius: 14, textDecoration: 'none', marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,136,204,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.248 13.78l-2.95-.924c-.64-.204-.657-.64.136-.954l11.498-4.431c.535-.194 1.003.131.63.777z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#29B6F6', margin: 0 }}>Personal Manager</p>
            <p style={{ fontSize: 11, color: T.dim, margin: '2px 0 0' }}>Direct Telegram access · Priority support</p>
          </div>
          <ArrowRight size={14} color="rgba(0,136,204,0.5)" />
        </a>
      )}

      <button onClick={onClose} style={{ width: '100%', padding: '13px', borderRadius: 13, background: 'linear-gradient(135deg,#FFD700,#FFB800)', color: '#000', fontSize: 14, fontWeight: 900, border: 'none', cursor: 'pointer', letterSpacing: '-0.01em' }}>
        Continue Trading as PRO
      </button>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     PREREQUISITES
  ════════════════════════════════════════════════════════════════ */
  if (screen === 'prereq' && proStatus) return shell(
    <div style={{ padding: '24px 24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Crown size={20} weight="fill" color={T.gold} />
          <p style={{ fontSize: 17, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Upgrade to <span style={{ color: T.gold }}>PRO</span></p>
        </div>
        {closeBtn}
      </div>
      <p style={{ fontSize: 12, color: T.dim, margin: '0 0 22px' }}>Complete these steps to unlock the payment page</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {[
          { done: proStatus.phoneVerified, Icon: Phone, label: 'Verify your phone number', sub: proStatus.phoneVerified ? 'Completed' : 'Go to Settings → Profile', href: '/settings' },
          { done: proStatus.hasWallet,     Icon: Wallet, label: 'Connect a verified wallet',  sub: proStatus.hasWallet ? 'Completed' : 'Go to Wallets and verify one', href: '/wallets' },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: step.done ? 'rgba(74,222,128,0.04)' : T.card2, border: `1.5px solid ${step.done ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: step.done ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${step.done ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {step.done ? <Check size={18} weight="bold" color={T.success} /> : <step.Icon size={18} weight="fill" color={T.dim} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: step.done ? T.success : T.text, margin: 0 }}>{step.label}</p>
              <p style={{ fontSize: 11, color: T.dim, margin: '3px 0 0' }}>{step.sub}</p>
            </div>
            {!step.done && (
              <a href={step.href} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: T.goldBg, border: `1px solid ${T.goldBdr}`, fontSize: 11, fontWeight: 800, color: T.gold, textDecoration: 'none' }}>
                Go <ArrowRight size={11} weight="bold" />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Mini comparison teaser */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: T.gold, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>What you unlock</p>
        <ComparisonTable compact />
      </div>

      <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: T.dim, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        Maybe Later
      </button>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     PAYMENT  — benefits first, then network + proceed
  ════════════════════════════════════════════════════════════════ */
  if (screen === 'payment' && proStatus) return shell(
    <div>
      {/* ── Hero ── */}
      <div style={{ padding: '24px 24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 46, height: 46, borderRadius: 15, background: 'linear-gradient(135deg,rgba(255,215,0,0.22),rgba(255,140,0,0.14))', border: '1.5px solid rgba(255,210,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pm-pulse 3s ease-in-out infinite' }}>
              <Crown size={24} weight="fill" color={T.gold} />
            </div>
            <div>
              <p style={{ fontSize: 19, fontWeight: 900, margin: 0, letterSpacing: '-0.025em', color: T.text }}>
                SwapINR <span style={{ color: T.gold }}>PRO</span>
              </p>
              <p style={{ fontSize: 11, color: T.dim, margin: '2px 0 0' }}>One-time · {proStatus.durationDays} days</p>
            </div>
          </div>
          {closeBtn}
        </div>

        {/* Price display */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'linear-gradient(135deg,rgba(255,210,0,0.09),rgba(255,140,0,0.05))', border: '1px solid rgba(255,210,0,0.2)', borderRadius: 16, marginBottom: 22 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.dim, margin: '0 0 4px' }}>Membership fee</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: T.gold, letterSpacing: '-0.04em', lineHeight: 1, fontFamily: 'monospace' }}>{proStatus.priceUsdt}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,210,0,0.6)' }}>USDT</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, background: 'rgba(255,210,0,0.12)', border: '1px solid rgba(255,210,0,0.3)', fontSize: 11, fontWeight: 800, color: T.gold, letterSpacing: '0.04em', animation: 'pm-shimmer 6s linear infinite', backgroundSize: '300% 100%' }}>
              <Crown size={11} weight="fill" />30-DAY ACCESS
            </div>
            <p style={{ fontSize: 10, color: T.dim, margin: '6px 0 0' }}>Activates instantly on payment</p>
          </div>
        </div>
      </div>

      {/* ── Feature comparison ── */}
      <div style={{ padding: '0 24px 20px' }}>
        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.dim, margin: '0 0 12px' }}>Free vs Pro</p>
        <ComparisonTable />
      </div>

      {/* ── Network selector ── */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 20 }} />
        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.dim, margin: '0 0 10px' }}>Select payment network</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
          {(['BEP20','ERC20','TRC20'] as ProNetwork[]).map(n => {
            const active = network === n;
            const col    = NET_COLOR[n];
            return (
              <button key={n} onClick={() => setNetwork(n)} style={{ padding: '11px 6px', borderRadius: 12, border: `1.5px solid ${active ? col : 'rgba(255,255,255,0.08)'}`, background: active ? `${col}14` : T.card2, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: active ? col : T.sub, letterSpacing: '0.04em' }}>{n}</div>
                <div style={{ fontSize: 9, color: T.dim, marginTop: 3, fontWeight: 600 }}>{NET_LABEL[n].split(' ')[0]}</div>
              </button>
            );
          })}
        </div>

        {/* Summary line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: T.card2, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: NET_COLOR[network] }} />
            <span style={{ fontSize: 12, color: T.sub }}>{NET_TOKEN[network]}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: T.text, fontFamily: 'monospace' }}>{proStatus.priceUsdt} USDT</span>
        </div>

        {error && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, fontSize: 12, color: T.danger }}>{error}</div>
        )}

        <button
          onClick={initiatePayment}
          disabled={initiating}
          style={{ width: '100%', padding: '16px', borderRadius: 14, background: initiating ? 'rgba(255,210,0,0.18)' : 'linear-gradient(135deg,#FFD700 0%,#FFB800 100%)', color: '#000', fontSize: 15, fontWeight: 900, border: 'none', cursor: initiating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: initiating ? 'none' : '0 6px 24px rgba(255,195,0,0.35)', letterSpacing: '-0.01em', transition: 'all 0.2s' }}
        >
          {initiating
            ? <><Bars color="#6b5200" />Preparing payment…</>
            : <><Crown size={17} weight="fill" />Proceed to Payment →</>}
        </button>
        <p style={{ fontSize: 11, color: T.dim, textAlign: 'center', margin: '10px 0 0', lineHeight: 1.6 }}>
          A QR code with the deposit address will appear next.
          <br />Payment window is valid for <strong style={{ color: T.sub }}>60 minutes</strong>.
        </p>
      </div>
    </div>
  , true);

  /* ═══════════════════════════════════════════════════════════════
     VERIFYING — QR + live polling
  ════════════════════════════════════════════════════════════════ */
  if (screen === 'verifying' && payment) return shell(
    <div style={{ padding: '24px 24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 17, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Send <span style={{ color: T.gold }}>{payment.amountUsdt} USDT</span></p>
          <p style={{ fontSize: 11, color: T.dim, margin: '3px 0 0' }}>{NET_TOKEN[payment.network]} · {NET_LABEL[payment.network]}</p>
        </div>
        {closeBtn}
      </div>

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(204,255,0,0.04)', border: '1px solid rgba(204,255,0,0.15)', borderRadius: 10, marginBottom: 18 }}>
        <Bars color={T.lime} />
        <div>
          <p style={{ fontSize: 12, color: T.lime, margin: 0, fontWeight: 800 }}>Monitoring blockchain for your payment</p>
          <p style={{ fontSize: 10, color: 'rgba(204,255,0,0.5)', margin: '2px 0 0' }}>Expires in {countdown || '—'} · checks every 10 sec</p>
        </div>
      </div>

      {/* QR */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <div style={{ padding: 14, background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <QRCodeSVG value={payment.depositAddress} size={168} level="M" />
        </div>
      </div>

      {/* Amount badge */}
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: T.gold, fontFamily: 'monospace', letterSpacing: '-0.04em' }}>{payment.amountUsdt} USDT</span>
        <p style={{ fontSize: 11, color: T.dim, margin: '4px 0 0' }}>Send exactly this amount — no more, no less</p>
      </div>

      {/* Address */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.dim, margin: '0 0 7px' }}>Deposit address</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: T.card2, border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12 }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: T.text, flex: 1, wordBreak: 'break-all', lineHeight: 1.6 }}>{payment.depositAddress}</span>
          <CopyButton text={payment.depositAddress} />
        </div>
      </div>

      {/* From wallet notice */}
      <div style={{ padding: '11px 14px', background: T.goldBg, border: `1px solid ${T.goldBdr}`, borderRadius: 12, marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: T.gold, margin: '0 0 4px', fontWeight: 800 }}>Send from your verified wallet only</p>
        <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,210,0,0.5)', margin: 0, wordBreak: 'break-all', lineHeight: 1.6 }}>{payment.fromAddress}</p>
      </div>

      {/* Switch network */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 10, color: T.dim, margin: '0 0 7px', fontWeight: 600 }}>Wrong network? Switch and start fresh:</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['BEP20','ERC20','TRC20'] as ProNetwork[]).map(n => {
            const active = payment.network === n;
            return (
              <button key={n} disabled={active} onClick={() => { if (pollRef.current) clearInterval(pollRef.current); setPayment(null); setNetwork(n); setScreen('payment'); }}
                style={{ flex: 1, padding: '7px', borderRadius: 9, border: `1px solid ${active ? NET_COLOR[n] : 'rgba(255,255,255,0.08)'}`, background: active ? `${NET_COLOR[n]}14` : 'transparent', color: active ? NET_COLOR[n] : T.dim, fontSize: 10, fontWeight: 800, cursor: active ? 'default' : 'pointer' }}>
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={onClose} style={{ width: '100%', padding: '13px', borderRadius: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: T.sub, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        Close — verification continues in background
      </button>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     SUCCESS
  ════════════════════════════════════════════════════════════════ */
  if (screen === 'success') return shell(
    <div style={{ padding: '28px 24px 32px', textAlign: 'center' }}>
      {/* Glow crown */}
      <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 22px' }}>
        <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,210,0,0.25) 0%,transparent 70%)' }} />
        <div style={{ width: 90, height: 90, borderRadius: 28, background: 'linear-gradient(135deg,rgba(255,215,0,0.22),rgba(255,140,0,0.14))', border: '2px solid rgba(255,210,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Crown size={42} weight="fill" color={T.gold} />
        </div>
      </div>

      <p style={{ fontSize: 26, fontWeight: 900, color: T.gold, margin: '0 0 6px', letterSpacing: '-0.03em' }}>Welcome to PRO!</p>
      <p style={{ fontSize: 13, color: T.sub, margin: '0 0 22px', lineHeight: 1.7 }}>
        Your membership is active. Better rates, unlimited limits,<br />and exclusive payout methods are now unlocked.
      </p>

      {txHash && (
        <div style={{ marginBottom: 18, padding: '10px 14px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: 12, textAlign: 'left' }}>
          <p style={{ fontSize: 10, color: T.success, margin: '0 0 4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em' }}>✓ Transaction confirmed</p>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: T.dim, wordBreak: 'break-all', lineHeight: 1.6 }}>{txHash}</span>
        </div>
      )}

      <div style={{ marginBottom: 22, textAlign: 'left' }}>
        <ComparisonTable compact />
      </div>

      <button onClick={() => window.location.reload()} style={{ width: '100%', padding: '15px', borderRadius: 14, background: 'linear-gradient(135deg,#FFD700,#FFB800)', color: '#000', fontSize: 15, fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 6px 24px rgba(255,195,0,0.35)', letterSpacing: '-0.01em' }}>
        Start Trading as PRO →
      </button>
    </div>
  );

  return null;
}
