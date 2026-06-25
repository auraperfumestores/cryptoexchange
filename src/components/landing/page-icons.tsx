'use client';

import {
  ArrowRight, ShieldCheck, Clock, Lightning, Lock, ArrowsDownUp,
  ChartLineUp, Globe, CreditCard, Star, Check, Play, X, Crown,
  TrendUp, TrendDown, Headset, Receipt, ArrowsLeftRight,
  Buildings, Vault, Handshake, DeviceMobile,
} from '@phosphor-icons/react';

export const IconArrow  = () => <ArrowRight size={16} weight="bold" />;
export const IconShield = () => <ShieldCheck size={18} />;
export const IconClock  = () => <Clock size={18} />;
export const IconZap    = () => <Lightning size={18} />;
export const IconLock   = () => <Lock size={18} />;
export const IconSwap   = () => <ArrowsDownUp size={18} />;
export const IconChart  = () => <ChartLineUp size={18} />;
export const IconGlobe  = () => <Globe size={18} />;
export const IconUpi    = () => <CreditCard size={18} />;
export const IconStar   = () => <Star size={13} weight="fill" />;
export const IconCheck  = () => <Check size={14} weight="bold" />;
export const IconPlay   = () => <Play size={18} weight="fill" />;
export const IconX      = () => <X size={18} />;
export const IconPro    = ({ size = 16, color, weight }: { size?: number; color?: string; weight?: 'regular' | 'bold' | 'fill' | 'duotone' } = {}) =>
  <Crown size={size} color={color} weight={weight ?? 'fill'} />;
export const IconTrend  = ({ up }: { up: boolean }) =>
  up ? <TrendUp size={12} color="#4ADE80" /> : <TrendDown size={12} color="#F87171" />;

// ─── Platform Features grid ───────────────────────────────────────────────────

const FEATURES = [
  { Icon: TrendUp,         title: 'Best Rate Guaranteed', desc: 'Live inter-bank USDT/INR rate with zero hidden spread or markup.' },
  { Icon: Lightning,       title: 'Instant Settlement',   desc: 'INR credited to your UPI or bank account in under 15 minutes.' },
  { Icon: ShieldCheck,     title: 'Funds 100% Secure',    desc: 'AES-256 encryption, KYC verified operators, and multi-sig custody.' },
  { Icon: Headset,         title: '24 × 7 Live Support',  desc: 'Dedicated agents on live chat & email — every hour of every day.' },
  { Icon: Receipt,         title: 'Transparent Pricing',  desc: 'One flat fee shown upfront. No withdrawal charge, no surprise deductions.' },
  { Icon: ArrowsLeftRight, title: 'Buy & Sell USDT',      desc: 'Sell USDT for INR or buy USDT with INR — both directions, one platform.' },
];

export function PlatformFeatures() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px', marginBottom: 40 }}>
      {FEATURES.map(({ Icon, title, desc }) => (
        <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color="#CCFF00" weight="regular" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)', marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', lineHeight: 1.6 }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Payout Methods section ───────────────────────────────────────────────────

const PAYOUTS = [
  {
    Icon: DeviceMobile,    title: 'UPI',        pro: false,
    body: 'Instant transfer to any UPI ID — GPay, PhonePe, Paytm & more. Credited in minutes.',
  },
  {
    Icon: Lightning,       title: 'IMPS',       pro: false,
    body: 'Immediate Payment Service — 24×7 bank transfers, including weekends & public holidays.',
  },
  {
    Icon: ArrowsLeftRight, title: 'NEFT',       pro: false,
    body: 'National Electronic Funds Transfer — reliable settlement across all Indian banks.',
  },
  {
    Icon: Buildings,       title: 'RTGS',       pro: false,
    body: 'Real-Time Gross Settlement for large-value INR transfers — processed instantly.',
  },
  {
    Icon: Vault,           title: 'CDM',        pro: true,
    body: 'Cash Deposit Machine — deposit cash at any CDM-enabled ATM across India. Pro exclusive.',
  },
  {
    Icon: Handshake,       title: 'Cash Deals', pro: true,
    body: 'In-person INR cash payout with a verified Pro agent. Available in select cities.',
  },
];

export function PayoutMethods() {
  return (
    <div className="sc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
      {PAYOUTS.map(({ Icon, title, body, pro }) => (
        <div
          key={title}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 16,
            padding: '24px 22px',
            background: pro
              ? 'linear-gradient(140deg, rgba(204,255,0,0.09) 0%, rgba(204,255,0,0.03) 100%)'
              : 'rgba(255,255,255,0.025)',
            border: pro
              ? '1px solid rgba(204,255,0,0.5)'
              : '1px solid rgba(204,255,0,0.2)',
            boxShadow: pro ? '0 0 28px rgba(204,255,0,0.07)' : 'none',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          className="lp-hover-card"
        >
          {/* Watermark */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            bottom: -10,
            right: -8,
            fontSize: 160,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: ({ UPI: '#FF9933', IMPS: '#FFFFFF', NEFT: '#138808', RTGS: '#FF9933', CDM: '#FFFFFF', 'Cash Deals': '#138808' } as Record<string,string>)[title] ?? '#CCFF00',
            opacity: 0.07,
            userSelect: 'none',
            pointerEvents: 'none',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {title === 'Cash Deals' ? 'CASH' : title.replace(' ', '')}
          </div>

          {/* PRO badge */}
          {pro && (
            <div style={{
              position: 'absolute', top: 16, right: 16,
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: '#CCFF00', color: '#000',
              padding: '3px 9px', borderRadius: 6,
              fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              <Crown size={10} weight="fill" />
              PRO
            </div>
          )}

          {/* Icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 12, marginBottom: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: pro ? 'rgba(204,255,0,0.12)' : 'rgba(204,255,0,0.06)',
            border: pro ? '1px solid rgba(204,255,0,0.32)' : '1px solid rgba(204,255,0,0.16)',
          }}>
            <Icon size={20} color="#CCFF00" weight={pro ? 'fill' : 'regular'} />
          </div>

          <h3 style={{
            fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em',
            color: pro ? '#CCFF00' : 'rgba(255,255,255,0.92)',
          }}>
            {title}
          </h3>
          <p style={{
            fontSize: 13, lineHeight: 1.65,
            color: pro ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.42)',
          }}>
            {body}
          </p>
        </div>
      ))}
    </div>
  );
}
