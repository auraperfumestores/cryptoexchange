'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WavesBg } from '@/components/ui/waves-bg';

interface ReferralBonusBannerProps {
  referralId: string;
  role: 'referrer' | 'referee';
  amount: number;
  counterpartName: string;
}

/** Celebratory banner shown once per rewarded referral, per side — mirrors the
 *  visual language of SignupBonusBanner's "claimed" state, but for a reward
 *  that already happened server-side (KYC approval), not a client-triggered claim. */
export function ReferralBonusBanner({ referralId, role, amount, counterpartName }: ReferralBonusBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  function dismiss() {
    setDismissed(true);
    fetch('/api/referrals/dismiss-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralId, role }),
    }).catch(() => {});
  }

  if (dismissed) return null;

  const headline = role === 'referrer'
    ? `🎉 You earned $${amount.toFixed(2)} USDT — ${counterpartName} joined via your referral`
    : `🎉 Welcome bonus credited — $${amount.toFixed(2)} USDT added to your wallet`;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, border: '1px solid rgba(204,255,0,0.25)', borderRadius: 'var(--fr-radius-lg)', padding: '16px 40px 16px 20px' }}>
      <WavesBg />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(204,255,0,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1.5L12.4 6.4L17.8 7.2L13.9 11L14.8 16.4L10 13.8L5.2 16.4L6.1 11L2.2 7.2L7.6 6.4L10 1.5Z" stroke="#CCFF00" strokeWidth="1.4" strokeLinejoin="round"/></svg>
        </div>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fr-text-primary)', margin: 0 }}>{headline}</p>
      </div>
      <Link
        href="/dashboard"
        onClick={dismiss}
        style={{ position: 'relative', zIndex: 1, flexShrink: 0, padding: '10px 18px', borderRadius: 'var(--fr-radius-md)', background: '#CCFF00', color: '#000', fontSize: 13, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        Transact Now →
      </Link>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}
