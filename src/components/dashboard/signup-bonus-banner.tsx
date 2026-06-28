'use client';

import { useState } from 'react';
import { PhoneVerifyModal } from '@/components/ui/phone-verify-modal';
import { WavesBg } from '@/components/ui/waves-bg';

const BONUS_USDT = 5;

interface SignupBonusBannerProps {
  phone?: string;
}

export function SignupBonusBanner({ phone }: SignupBonusBannerProps) {
  const [open,    setOpen]    = useState(false);
  const [claimed, setClaimed] = useState(false);

  if (claimed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.25)', borderRadius: 'var(--fr-radius-lg)', padding: '14px 18px' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(204,255,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8L6 12L14 4" stroke="#CCFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)', margin: 0 }}>
          ${BONUS_USDT} USDT signup bonus credited to your wallet 🎉
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, border: '1px solid rgba(204,255,0,0.22)', borderRadius: 'var(--fr-radius-lg)', padding: '16px 20px' }}>
        <WavesBg />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(204,255,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1.5L12.4 6.4L17.8 7.2L13.9 11L14.8 16.4L10 13.8L5.2 16.4L6.1 11L2.2 7.2L7.6 6.4L10 1.5Z" stroke="#CCFF00" strokeWidth="1.4" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 2px' }}>
              Verify your number to get ${BONUS_USDT} USDT
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--fr-text-secondary)', margin: 0 }}>
              Confirm your mobile number and we'll add it to your wallet instantly.
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{ position: 'relative', zIndex: 1, flexShrink: 0, padding: '10px 18px', borderRadius: 'var(--fr-radius-md)', background: '#CCFF00', color: '#000', fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Verify Phone →
        </button>
      </div>

      {open && (
        <PhoneVerifyModal
          currentPhone={phone}
          bonusAmount={BONUS_USDT}
          onClose={() => setOpen(false)}
          onVerified={(_phone, bonusGranted) => {
            if (bonusGranted) setClaimed(true);
            setTimeout(() => setOpen(false), 1400);
          }}
        />
      )}
    </>
  );
}
