'use client';

import { useState } from 'react';
import Link from 'next/link';

const NETWORKS = [
  { id: 'BEP20', label: 'BEP-20 (BNB Chain)', fee: 0.005, color: '#CCFF00' },
  { id: 'TRC20', label: 'TRC-20 (TRON)',       fee: 0.006, color: '#00E5A0' },
  { id: 'ERC20', label: 'ERC-20 (Ethereum)',   fee: 0.008, color: '#60A5FA' },
];

export function UsdtCalcWidget({ approxRate }: { approxRate: number }) {
  const [usdt, setUsdt]       = useState('');
  const [network, setNetwork] = useState('BEP20');

  const selectedNet = NETWORKS.find(n => n.id === network)!;
  const usdtNum     = parseFloat(usdt) || 0;
  const inrGross    = usdtNum * approxRate;
  const feeAmount   = inrGross * selectedNet.fee;
  const inrNet      = inrGross - feeAmount;

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '28px 24px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 20 }}>
        USDT to INR Calculator
        <span style={{ marginLeft: 8, background: 'rgba(204,255,0,0.1)', color: '#CCFF00', fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
          Rate: ~₹{approxRate.toFixed(2)}/USDT
        </span>
      </div>

      {/* Network selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {NETWORKS.map(n => (
          <button
            key={n.id}
            onClick={() => setNetwork(n.id)}
            style={{
              flex: 1, minWidth: 100, padding: '9px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: network === n.id ? n.color : 'rgba(255,255,255,0.04)',
              color: network === n.id ? '#000' : 'rgba(255,255,255,0.5)',
              border: network === n.id ? 'none' : '1px solid rgba(255,255,255,0.09)',
              transition: 'all 0.15s',
            }}
          >
            {n.id}<br />
            <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.75 }}>{(n.fee * 100).toFixed(1)}% fee</span>
          </button>
        ))}
      </div>

      {/* USDT input */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          You send (USDT)
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="Enter USDT amount"
            value={usdt}
            onChange={e => setUsdt(e.target.value)}
            style={{
              width: '100%', padding: '13px 60px 13px 16px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, fontSize: 18, fontWeight: 700, color: '#fff',
              outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 800, color: selectedNet.color }}>
            USDT
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#CCFF00' }}>↓</div>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* INR output */}
      <div style={{ background: 'rgba(204,255,0,0.04)', border: '1px solid rgba(204,255,0,0.15)', borderRadius: 12, padding: '16px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>You receive (INR)</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: usdtNum > 0 ? '#CCFF00' : 'rgba(255,255,255,0.2)', letterSpacing: '-0.02em', fontFamily: 'var(--fr-font-mono)', marginBottom: 4 }}>
          {usdtNum > 0 ? `₹${inrNet.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '₹0.00'}
        </div>
        {usdtNum > 0 && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
            {usdtNum} USDT × ₹{approxRate.toFixed(2)} = ₹{inrGross.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            <br />
            Minus {(selectedNet.fee * 100).toFixed(1)}% fee = −₹{feeAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', lineHeight: 1.55, marginBottom: 16 }}>
        ⚠️ Approximate estimate only — actual rate is locked when you confirm the trade on SwappINR. Live rate may differ.
      </p>

      <Link href="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '13px 24px', borderRadius: 11, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
        Sell USDT at Live Rate →
      </Link>
    </div>
  );
}
