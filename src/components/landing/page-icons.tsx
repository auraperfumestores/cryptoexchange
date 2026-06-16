'use client';

import {
  ArrowRight, ShieldCheck, Clock, Lightning, Lock, ArrowsDownUp,
  ChartLineUp, Globe, CreditCard, Star, Check, Play, X, Crown,
  TrendUp, TrendDown, Headset, Receipt, ArrowsLeftRight,
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
export const IconPro    = () => <Crown size={16} />;
export const IconTrend  = ({ up }: { up: boolean }) =>
  up ? <TrendUp size={12} color="#4ADE80" /> : <TrendDown size={12} color="#F87171" />;

const FEATURES = [
  { Icon: TrendUp,         title: 'Best Rate Guaranteed', desc: 'Live inter-bank USDT/INR rate with zero hidden spread or markup.' },
  { Icon: Lightning,       title: 'Instant Settlement',   desc: 'INR credited to your UPI or bank account in under 15 minutes.' },
  { Icon: ShieldCheck,     title: 'Funds 100% Secure',    desc: 'AES-256 encryption, KYC verified operators, and multi-sig custody.' },
  { Icon: Headset,         title: '24 × 7 Live Support',  desc: 'Dedicated agents on chat, WhatsApp & email — every hour of every day.' },
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
