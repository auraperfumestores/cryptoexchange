'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface AdminRate {
  symbol: string;
  network: string;
  buyRate: number;
  sellRate: number;
  spread: number;
  depositAddress?: string;
}

type Network = 'BEP20' | 'ERC20' | 'TRC20';
type Mode = 'buy' | 'sell';

/* ── Design tokens ── */
const T = {
  bg:       '#0C1130',
  card:     '#111840',
  card2:    '#172055',
  border:   'rgba(255,255,255,0.08)',
  border2:  'rgba(255,255,255,0.14)',
  text:     '#FFFFFF',
  sub:      'rgba(255,255,255,0.45)',
  dim:      'rgba(255,255,255,0.22)',
  blue:     '#1A3FFF',
  blueSoft: '#2B4FFF',
  purple:   '#6B21FF',
  cyan:     '#00D4FF',
  green:    '#00E5A0',
  red:      '#FF5C7C',
  yellow:   '#F3BA2F',
};

const NET_COLOR: Record<Network, string> = { BEP20: '#F3BA2F', ERC20: '#627EEA', TRC20: '#EF4444' };
const NET_LABEL: Record<Network, string> = { BEP20: 'BSC', ERC20: 'ETH', TRC20: 'TRON' };

/* ── Tiny components ── */
function LiveDot() {
  return (
    <span style={{ position:'relative', display:'inline-flex', width:8, height:8, flexShrink:0 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:T.green, opacity:0.4, animation:'ldPing 1.4s ease-in-out infinite' }} />
      <span style={{ width:8, height:8, borderRadius:'50%', background:T.green, display:'block' }} />
      <style>{`@keyframes ldPing{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(2.2);opacity:0}}`}</style>
    </span>
  );
}

/* USDT coin icon */
function UsdtIcon({ size=28 }:{ size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="#26A17B" />
      <rect x="8" y="8" width="12" height="2" rx="1" fill="white" />
      <rect x="13" y="10" width="2" height="5" rx="1" fill="white" />
      <rect x="9.5" y="16" width="9" height="1.2" rx="0.6" fill="rgba(255,255,255,0.9)" />
      <rect x="10.5" y="18" width="7" height="1" rx="0.5" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}

/* INR coin icon */
function InrIcon({ size=28 }:{ size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="#FF9933" />
      <path d="M9 9H19M9 12H19M9 9C9 9 9 12 12 15L9 19" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 12C12 12 16 12 17.5 13.5C18.8 15 17.5 16.5 16 17L9 19" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* Network badge icon */
function NetIcon({ network, size=18 }:{ network:Network; size?:number }) {
  const col = NET_COLOR[network];
  if (network === 'BEP20') return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill={col} />
      <path d="M9 4L11.5 6.5L9 9L6.5 6.5L9 4Z" fill="white" />
      <path d="M4.5 9L7 6.5L9 8.5L7 11L4.5 9Z" fill="rgba(255,255,255,0.75)" />
      <path d="M13.5 9L11 6.5L9 8.5L11 11L13.5 9Z" fill="rgba(255,255,255,0.75)" />
      <path d="M9 14L11.5 11.5L9 9L6.5 11.5L9 14Z" fill="white" />
    </svg>
  );
  if (network === 'ERC20') return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill={col} />
      <path d="M9 3.5L13 8.5L9 10.5L5 8.5L9 3.5Z" fill="rgba(255,255,255,0.8)" />
      <path d="M9 3.5L13 8.5L9 10.5V3.5Z" fill="rgba(255,255,255,0.2)" />
      <path d="M9 11.5L13 9L9 14.5L5 9L9 11.5Z" fill="rgba(255,255,255,0.65)" />
      <path d="M9 11.5L13 9L9 14.5V11.5Z" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill={col} />
      <path d="M5 6L14 9L9.5 13.5L5 6Z" fill="rgba(255,255,255,0.85)" />
      <path d="M5 6L14 9L12 6.5L5 6Z" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

/* ── Main widget ── */
export default function ExchangeWidget() {
  const [mode, setMode]       = useState<Mode>('sell');
  const [network, setNetwork] = useState<Network>('BEP20');
  const [amount, setAmount]   = useState('1000');
  const [rates, setRates]     = useState<Record<Network, AdminRate | null>>({ BEP20:null, ERC20:null, TRC20:null });
  const [fetchError, setFetchError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [showSummary, setShowSummary] = useState(true);
  const fetchRef = useRef<AbortController | null>(null);

  const fetchRates = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await fetch('/api/rates', { signal, cache: 'no-store' });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const data: AdminRate[] = json.data ?? [];
      const map: Record<Network, AdminRate | null> = { BEP20:null, ERC20:null, TRC20:null };
      for (const r of data.filter(r => r.symbol === 'USDT')) {
        if (r.network in map) map[r.network as Network] = r;
      }
      setRates(map);
      setFetchError(false);
      setLastUpdate(new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }));
    } catch { if (!signal.aborted) setFetchError(true); }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchRef.current = ctrl;
    fetchRates(ctrl.signal);
    const iv = setInterval(() => {
      fetchRef.current?.abort();
      const c = new AbortController();
      fetchRef.current = c;
      fetchRates(c.signal);
    }, 15000);
    return () => { ctrl.abort(); clearInterval(iv); };
  }, [fetchRates]);

  const activeRate = rates[network];
  const rate = activeRate ? (mode === 'buy' ? activeRate.buyRate : activeRate.sellRate) : null;
  const numAmt = parseFloat(amount) || 0;
  const outputAmount = rate
    ? (mode === 'buy' ? (numAmt / rate).toFixed(4) : (numAmt * rate).toFixed(2))
    : null;

  const payCurrency  = mode === 'buy' ? 'INR' : 'USDT';
  const recvCurrency = mode === 'buy' ? 'USDT' : 'INR';

  return (
    <div style={{
      background: T.bg,
      borderRadius: 24,
      padding: '0',
      width: '100%',
      maxWidth: 420,
      fontFamily: "'Inter','Helvetica Neue',sans-serif",
      overflow: 'hidden',
    }}>
      {/* ── Header bar ── */}
      <div style={{ padding: '18px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <LiveDot />
          <span style={{ fontSize:12, fontWeight:700, color:T.green, letterSpacing:'0.01em' }}>Live Rate</span>
        </div>
        <span style={{ fontSize:11, color:T.dim }}>
          {lastUpdate ? `Updated ${lastUpdate}` : 'Connecting…'}
        </span>
      </div>

      {/* ── Mode tabs (underline style like Alchemy Pay) ── */}
      <div style={{ padding:'14px 22px 0', display:'flex', gap:0, borderBottom:`1px solid ${T.border}` }}>
        {(['buy','sell'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding:'9px 20px 11px', border:'none', background:'transparent', cursor:'pointer',
            fontSize:14, fontWeight:700, letterSpacing:'-0.01em',
            color: mode===m ? T.text : T.sub,
            borderBottom: mode===m ? `2.5px solid ${T.blue}` : '2.5px solid transparent',
            marginBottom:-1, transition:'all 0.15s',
          }}>
            {m === 'buy' ? 'Buy USDT' : 'Sell USDT'}
          </button>
        ))}
      </div>

      <div style={{ padding:'20px 22px 22px' }}>

        {/* ── YOU PAY ── */}
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:T.sub, margin:'0 0 8px' }}>
          You pay
        </p>
        <div style={{
          display:'flex', alignItems:'center',
          background: T.card, border:`1.5px solid ${T.border2}`,
          borderRadius:14, padding:'14px 14px 14px 18px',
          gap:10, marginBottom:12,
        }}>
          <input
            type="number" value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            style={{
              flex:1, background:'transparent', border:'none', outline:'none',
              fontSize:30, fontWeight:800, color:T.text,
              fontFamily:"'JetBrains Mono','Space Mono',monospace",
              minWidth:0,
              /* hide spinners */
              MozAppearance:'textfield',
            }}
          />
          {/* Currency pill */}
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            background: T.card2, borderRadius:10,
            padding:'8px 12px', flexShrink:0,
            border:`1px solid ${T.border2}`,
          }}>
            {mode==='buy' ? <InrIcon size={24} /> : <UsdtIcon size={24} />}
            <span style={{ fontSize:14, fontWeight:800, color:T.text }}>{payCurrency}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4L6 8L10 4" stroke={T.sub} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}`}</style>

        {/* ── Network selector ── */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <span style={{ fontSize:11, fontWeight:600, color:T.dim }}>Network</span>
          <div style={{ display:'flex', gap:6 }}>
            {(['BEP20','ERC20','TRC20'] as Network[]).map(n => {
              const active = network===n;
              const col = NET_COLOR[n];
              return (
                <button key={n} onClick={() => setNetwork(n)} style={{
                  display:'flex', alignItems:'center', gap:5,
                  padding:'5px 10px', borderRadius:8, cursor:'pointer',
                  border: active ? `1.5px solid ${col}` : `1.5px solid ${T.border}`,
                  background: active ? `${col}18` : 'transparent',
                  transition:'all 0.15s',
                }}>
                  <NetIcon network={n} size={14} />
                  <span style={{ fontSize:11, fontWeight:700, color: active ? col : T.sub }}>{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Swap divider ── */}
        <div style={{ position:'relative', margin:'4px 0 14px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', left:0, right:0, height:1, background:T.border }} />
          <div style={{
            position:'relative', zIndex:1,
            width:36, height:36, borderRadius:'50%',
            background: T.card2, border:`1.5px solid ${T.border2}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'transform 0.2s',
          }} onClick={() => setMode(m => m==='buy' ? 'sell' : 'buy')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L2 8L4 10M12 10L14 8L12 6M2 8H14" stroke={T.cyan} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* ── YOU RECEIVE ── */}
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:T.sub, margin:'0 0 8px' }}>
          You receive <span style={{ color:T.dim, fontWeight:500, textTransform:'none', fontSize:10 }}>(estimate)</span>
        </p>
        <div style={{
          display:'flex', alignItems:'center',
          background:'rgba(0,212,255,0.05)', border:`1.5px solid rgba(0,212,255,0.16)`,
          borderRadius:14, padding:'14px 14px 14px 18px', gap:10, marginBottom:18,
        }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{
              fontSize:30, fontWeight:800,
              color: rate ? T.cyan : T.dim,
              fontFamily:"'JetBrains Mono','Space Mono',monospace",
            }}>
              {outputAmount ?? (fetchError ? '—' : '…')}
            </div>
            {rate && (
              <p style={{ margin:'3px 0 0', fontSize:11, color:T.dim }}>
                @ ₹{rate.toFixed(2)} per USDT · {NET_LABEL[network]}
              </p>
            )}
          </div>
          {/* Receive currency pill */}
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            background:'rgba(0,229,160,0.1)', border:'1px solid rgba(0,229,160,0.22)',
            borderRadius:10, padding:'8px 12px', flexShrink:0,
          }}>
            {mode==='buy' ? <UsdtIcon size={24} /> : <InrIcon size={24} />}
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:T.green, lineHeight:1 }}>{recvCurrency}</div>
              {mode==='buy' && (
                <div style={{ fontSize:10, color:T.dim, marginTop:1, lineHeight:1 }}>{NET_LABEL[network]}</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Rate grid (all networks) ── */}
        {(rates.BEP20 || rates.ERC20 || rates.TRC20) && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
            {(['BEP20','ERC20','TRC20'] as Network[]).map(n => {
              const r = rates[n];
              const col = NET_COLOR[n];
              const active = n===network;
              return (
                <button key={n} onClick={() => setNetwork(n)} style={{
                  background: active ? `${col}12` : T.card,
                  border: active ? `1.5px solid ${col}50` : `1.5px solid ${T.border}`,
                  borderRadius:12, padding:'10px 8px', textAlign:'center',
                  cursor:'pointer', transition:'all 0.15s',
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, marginBottom:4 }}>
                    <NetIcon network={n} size={12} />
                    <span style={{ fontSize:9, fontWeight:800, color: active ? col : T.dim, letterSpacing:'0.06em', textTransform:'uppercase' }}>{n}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:800, color: active ? T.text : T.sub, fontFamily:'monospace' }}>
                    {r ? `₹${(mode==='buy' ? r.buyRate : r.sellRate).toFixed(2)}` : '—'}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Order summary (collapsible) ── */}
        {rate && outputAmount && (
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, marginBottom:16, overflow:'hidden' }}>
            <button
              onClick={() => setShowSummary(s => !s)}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', background:'transparent', border:'none', cursor:'pointer' }}
            >
              <span style={{ fontSize:12, fontWeight:600, color:T.sub }}>
                Your order
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:T.text }}>
                  {mode==='buy'
                    ? `${outputAmount} USDT for ₹${Number(amount).toLocaleString('en-IN')}`
                    : `₹${outputAmount} for ${amount} USDT`}
                </span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: showSummary ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>
                  <path d="M3 5L7 9L11 5" stroke={T.dim} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </button>

            {showSummary && (
              <div style={{ borderTop:`1px solid ${T.border}`, padding:'10px 14px', display:'flex', flexDirection:'column', gap:7 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:12, color:T.sub }}>1 USDT</span>
                  <span style={{ fontSize:12, fontWeight:700, color:T.text, fontFamily:'monospace' }}>≈ ₹{rate.toFixed(2)}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:12, color:T.sub }}>Processing fee</span>
                  <span style={{ fontSize:12, fontWeight:700, color:T.green }}>₹ 0</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:12, color:T.sub }}>Network fee</span>
                  <span style={{ fontSize:12, fontWeight:700, color:T.green }}>0 USDT</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${T.border}`, paddingTop:7, marginTop:2 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:T.text }}>Settlement</span>
                  <span style={{ fontSize:12, fontWeight:700, color:T.cyan }}>Under 30 min</span>
                </div>
              </div>
            )}
          </div>
        )}

        {fetchError && (
          <div style={{ marginBottom:14, background:'rgba(255,92,124,0.08)', border:'1px solid rgba(255,92,124,0.2)', borderRadius:12, padding:'10px 14px', fontSize:12, color:T.red, textAlign:'center' }}>
            Unable to load live rates — retrying…
          </div>
        )}

        {/* ── CTA ── */}
        <a href={`/checkout?amount=${encodeURIComponent(amount)}&mode=${mode}&network=${network}`} style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          width:'100%', padding:'16px 0', borderRadius:14,
          background:`linear-gradient(135deg,${T.blue} 0%,${T.purple} 100%)`,
          color:'#fff', fontSize:16, fontWeight:800,
          textDecoration:'none',
          boxShadow:`0 6px 28px rgba(26,63,255,0.55)`,
          letterSpacing:'-0.01em', transition:'all 0.15s',
          border:'none', cursor:'pointer',
        }}>
          {mode==='buy' ? 'Proceed · Buy USDT' : 'Proceed · Sell USDT'}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M9 4L13 8L9 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        {/* ── Payment methods strip ── */}
        <div style={{ marginTop:14, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* UPI */}
            <div style={{ padding:'4px 10px', borderRadius:6, background:'rgba(255,255,255,0.06)', border:`1px solid ${T.border}` }}>
              <span style={{ fontSize:11, fontWeight:900, color:'#00B9F1', letterSpacing:'-0.01em' }}>UPI</span>
            </div>
            {/* IMPS */}
            <div style={{ padding:'4px 10px', borderRadius:6, background:'rgba(255,255,255,0.06)', border:`1px solid ${T.border}` }}>
              <span style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)' }}>IMPS</span>
            </div>
            {/* NEFT */}
            <div style={{ padding:'4px 10px', borderRadius:6, background:'rgba(255,255,255,0.06)', border:`1px solid ${T.border}` }}>
              <span style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)' }}>NEFT</span>
            </div>
            {/* RTGS */}
            <div style={{ padding:'4px 10px', borderRadius:6, background:'rgba(255,255,255,0.06)', border:`1px solid ${T.border}` }}>
              <span style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)' }}>RTGS</span>
            </div>
            {/* Cash */}
            <div style={{ padding:'4px 10px', borderRadius:6, background:'rgba(255,255,255,0.06)', border:`1px solid ${T.border}` }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display:'inline',verticalAlign:'middle',marginRight:3 }}>
                <rect x="1" y="3" width="12" height="8" rx="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
                <circle cx="7" cy="7" r="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
              </svg>
              <span style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)' }}>Cash</span>
            </div>
          </div>
          <p style={{ fontSize:10, color:T.dim, margin:0 }}>
            No hidden fees · Non-custodial escrow · KYC compliant
          </p>
        </div>

      </div>
    </div>
  );
}
