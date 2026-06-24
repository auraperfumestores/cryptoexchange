'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WalletVerifyFlow } from '@/components/client/wallet-verify-flow';

type Network = 'BEP20' | 'ERC20' | 'TRC20';

function VerifyInner() {
  const searchParams   = useSearchParams();
  const network        = (searchParams.get('network') ?? 'BEP20') as Network;
  const compact        = searchParams.get('compact') === '1';
  const sid            = searchParams.get('sid') ?? '';
  const [depositAddress, setDepositAddress] = useState('');
  const [done, setDone]                     = useState(false);

  useEffect(() => {
    fetch('/api/rates', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (!j?.data) return;
        const rate = j.data.find((r: any) => r.symbol === 'USDT' && r.network === network);
        if (rate?.depositAddress) setDepositAddress(rate.depositAddress);
      })
      .catch(() => {});
  }, [network]);

  if (done) {
    return (
      <div style={{ position:'fixed', inset:0, background:'#111B42', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, zIndex:2147483647 }}>
        <div style={{ width:64, height:64, borderRadius:20, background:'rgba(0,229,160,0.1)', border:'1px solid rgba(0,229,160,0.3)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14L11 20L23 8" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 style={{ fontSize:20, fontWeight:900, color:'#fff', margin:'0 0 8px', textAlign:'center', letterSpacing:'-0.02em' }}>Wallet Verified</h2>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', margin:0, textAlign:'center', lineHeight:1.6 }}>
          Your wallet has been verified. You can return to SwappINR.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100dvh', background:'#111B42', padding: compact ? 0 : '24px 16px' }}>
      {!compact && (
        <div style={{ maxWidth:480, margin:'0 auto 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:'#CCFF00', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:'#000', fontSize:14, fontWeight:900 }}>S</span>
            </div>
            <span style={{ fontSize:16, fontWeight:900, color:'#fff' }}>SwappINR</span>
          </div>
          <h1 style={{ fontSize:20, fontWeight:900, color:'#fff', margin:'0 0 4px', letterSpacing:'-0.02em' }}>Verify Wallet</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', margin:0 }}>Connect your {network} wallet and complete ownership verification.</p>
        </div>
      )}
      <div style={{ maxWidth:480, margin:'0 auto' }}>
        <WalletVerifyFlow
          network={network}
          depositAddress={depositAddress}
          compact={compact}
          sid={sid}
          onVerified={() => setDone(true)}
          onCancel={() => window.history.back()}
        />
      </div>
    </div>
  );
}

export default function WalletVerifyPage() {
  return (
    <Suspense>
      <VerifyInner />
    </Suspense>
  );
}
