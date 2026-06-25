'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TokenIcon, NetworkIcon } from '@/components/ui/token-icon';
import { SellFlowModal } from '@/components/ui/sell-flow-modal';
import { BuyFlowModal } from '@/components/ui/buy-flow-modal';

interface AdminRate {
  symbol: string;
  network: string;
  buyRate: number;
  sellRate: number;
  spread: number;
  depositAddress?: string;
}

interface WidgetLimits {
  minBuyUsdt: number;
  minSellUsdt: number;
}

type Network = 'BEP20' | 'ERC20' | 'TRC20';
type Mode = 'buy' | 'sell';

/* ── FR Design System Tokens ── */
const FR = {
  black:      '#050505',
  dark1:      '#0d0d0d',
  dark2:      '#111111',
  dark3:      '#161616',
  dark4:      '#1a1a1a',
  dark5:      '#222222',
  lime:       '#CCFF00',
  limeDim:    '#A8D400',
  limeGlow:   'rgba(204,255,0,0.12)',
  borderSub:  'rgba(255,255,255,0.06)',
  borderDef:  'rgba(255,255,255,0.10)',
  borderMed:  'rgba(255,255,255,0.16)',
  textPri:    '#FFFFFF',
  textSec:    'rgba(255,255,255,0.65)',
  textTert:   'rgba(255,255,255,0.35)',
  textDis:    'rgba(255,255,255,0.20)',
  success:    '#4ADE80',
  danger:     '#F87171',
  teal:       '#00D4C8',
  mono:       "'JetBrains Mono','Fira Code','Courier New',monospace",
  sans:       "var(--font-inter),system-ui,sans-serif",
};

const NET_COLOR: Record<Network, string> = { BEP20: '#F3BA2F', ERC20: '#627EEA', TRC20: '#EF4444' };
const NET_LABEL: Record<Network, string> = { BEP20: 'BSC', ERC20: 'ETH', TRC20: 'TRON' };

/* ── Live Dot ── */
function LiveDot() {
  return (
    <span style={{ position:'relative', display:'inline-flex', width:8, height:8, flexShrink:0 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:FR.lime, opacity:0.35, animation:'ldPing 1.6s ease-in-out infinite' }} />
      <span style={{ width:8, height:8, borderRadius:'50%', background:FR.lime, display:'block' }} />
      <style>{`@keyframes ldPing{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(2.4);opacity:0}}`}</style>
    </span>
  );
}

/* ── INR Icon ── */
function InrIcon({ size=26 }:{ size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="#FF9933"/>
      <path d="M9 9H19M9 12H19M9 9C9 9 9 12 12 15L9 19" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M12 12C12 12 16 12 17.5 13.5C18.8 15 17.5 16.5 16 17L9 19" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

/* ── Main Widget ── */
export default function ExchangeWidget() {
  const { status } = useSession();
  const router = useRouter();
  const [mode, setMode]       = useState<Mode>('sell');
  const [network, setNetwork] = useState<Network>('BEP20');
  const [amount, setAmount]   = useState('1000');
  const [rates, setRates]     = useState<Record<Network, AdminRate | null>>({ BEP20:null, ERC20:null, TRC20:null });
  const [widgetLimits, setWidgetLimits] = useState<WidgetLimits>({ minBuyUsdt: 10, minSellUsdt: 10 });
  const [fetchError, setFetchError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [showSummary,  setShowSummary]  = useState(false);
  const [showSellFlow, setShowSellFlow] = useState(false);
  const [showBuyFlow, setShowBuyFlow] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const fetchRef = useRef<AbortController | null>(null);

  const fetchRates = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await fetch('/api/rates', { signal, cache:'no-store' });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const data: AdminRate[] = json.data ?? [];
      const map: Record<Network, AdminRate | null> = { BEP20:null, ERC20:null, TRC20:null };
      for (const r of data.filter(r => r.symbol === 'USDT')) {
        if (r.network in map) map[r.network as Network] = r;
      }
      setRates(map);
      if (json.widgetLimits) setWidgetLimits(json.widgetLimits);
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

  const isAuthed = status === 'authenticated';

  function goToLogin(callbackUrl: string) {
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const payCurrency  = mode === 'buy' ? 'INR' : 'USDT';
  const recvCurrency = mode === 'buy' ? 'USDT' : 'INR';

  // Minimum validation — buy amount is INR so convert to USDT equivalent
  const usdtEquiv = mode === 'sell' ? numAmt : (rate ? numAmt / rate : 0);
  const minRequired = mode === 'buy' ? widgetLimits.minBuyUsdt : widgetLimits.minSellUsdt;
  const belowMin = numAmt > 0 && usdtEquiv < minRequired;
  const minInr   = rate ? Math.ceil(minRequired * rate) : null;
  // Only ever surface the min-order warning to logged-in users, and only after they've
  // tried to proceed — guests get redirected to login first and validate at checkout.
  const showMinWarning = isAuthed && attemptedSubmit && belowMin;

  return (
    <div style={{
      background: FR.dark1,
      borderRadius: 20,
      width: '100%',
      maxWidth: 440,
      fontFamily: FR.sans,
      overflow: 'hidden',
      border: `1px solid ${FR.borderDef}`,
    }}>
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        input[type=number] { -moz-appearance:textfield; }
        .ew-tab-btn { transition: color 0.15s, border-color 0.15s; }
        .ew-tab-btn:hover { color: rgba(255,255,255,0.85) !important; }
        .ew-net-btn { transition: all 0.15s; }
        .ew-net-btn:hover { opacity: 0.85; }
        .ew-rate-btn { transition: all 0.15s; }
        .ew-rate-btn:hover { opacity: 0.85; }
        .ew-swap-btn:hover { transform: rotate(180deg) !important; }
        .ew-cta:hover { filter: brightness(1.06); box-shadow: 0 8px 32px rgba(204,255,0,0.35) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding:'18px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <LiveDot />
          <span style={{ fontSize:11, fontWeight:700, color:FR.lime, letterSpacing:'0.06em', textTransform:'uppercase' }}>Live Rate</span>
        </div>
        <span style={{ fontSize:10, color:FR.textTert, fontFamily:FR.mono }}>
          {lastUpdate ? `Updated ${lastUpdate}` : 'Connecting…'}
        </span>
      </div>

      {/* ── Tabs ── */}
      <div style={{ padding:'14px 22px 0', display:'flex', gap:0, borderBottom:`1px solid ${FR.borderSub}` }}>
        {(['buy','sell'] as Mode[]).map(m => (
          <button key={m} className="ew-tab-btn" onClick={() => { setMode(m); setAttemptedSubmit(false); }} style={{
            padding:'9px 20px 12px', border:'none', background:'transparent', cursor:'pointer',
            fontSize:13, fontWeight:700, letterSpacing:'-0.01em', fontFamily:FR.sans,
            color: mode===m ? FR.textPri : FR.textTert,
            borderBottom: mode===m ? `2px solid ${FR.lime}` : '2px solid transparent',
            marginBottom:-1,
          }}>
            {m === 'buy' ? 'Buy USDT' : 'Sell USDT'}
          </button>
        ))}
      </div>

      <div style={{ padding:'20px 22px 24px' }}>

        {/* ── YOU PAY ── */}
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:FR.textTert, margin:'0 0 8px' }}>You Pay</p>
        <div style={{
          display:'flex', alignItems:'center',
          background: FR.dark3, border:`1px solid ${FR.borderDef}`,
          borderRadius:12, padding:'14px 14px 14px 18px', gap:10, marginBottom:10,
        }}>
          <input
            type="number" value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0" min="0"
            style={{
              flex:1, background:'transparent', border:'none', outline:'none',
              fontSize:28, fontWeight:700, color:FR.textPri,
              fontFamily:FR.mono, minWidth:0, letterSpacing:'-0.03em',
            }}
          />
          <div style={{
            display:'flex', alignItems:'center', gap:7,
            background: FR.dark4, borderRadius:8, padding:'7px 12px', flexShrink:0,
            border:`1px solid ${FR.borderMed}`,
          }}>
            {mode==='buy' ? <InrIcon size={22}/> : <TokenIcon network={network} size={22}/>}
            <span style={{ fontSize:13, fontWeight:800, color:FR.textPri, letterSpacing:'-0.01em' }}>{payCurrency}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 3.5L5 6.5L8 3.5" stroke={FR.textTert} strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* ── Network Selector ── */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:FR.textTert, flexShrink:0 }}>Network</span>
          <div style={{ display:'flex', gap:5 }}>
            {(['BEP20','ERC20','TRC20'] as Network[]).map(n => {
              const active = network===n;
              const col = NET_COLOR[n];
              return (
                <button key={n} className="ew-net-btn" onClick={() => setNetwork(n)} style={{
                  display:'flex', alignItems:'center', gap:4,
                  padding:'4px 9px', borderRadius:6, cursor:'pointer',
                  border: active ? `1px solid ${col}` : `1px solid ${FR.borderDef}`,
                  background: active ? `${col}15` : FR.dark3,
                  fontFamily: FR.sans,
                }}>
                  <NetworkIcon network={n} size={14}/>
                  <span style={{ fontSize:10, fontWeight:700, color: active ? col : FR.textTert, letterSpacing:'0.04em' }}>{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Swap Divider ── */}
        <div style={{ position:'relative', margin:'4px 0 12px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', left:0, right:0, height:1, background:FR.borderSub }} />
          <button
            className="ew-swap-btn"
            onClick={() => { setMode(m => m==='buy' ? 'sell' : 'buy'); setAttemptedSubmit(false); }}
            style={{
              position:'relative', zIndex:1,
              width:34, height:34, borderRadius:8,
              background: FR.dark3, border:`1px solid ${FR.borderMed}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', transition:'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              color:FR.lime,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M5 3V13M5 3L3 5M5 3L7 5M11 13V3M11 13L9 11M11 13L13 11" stroke={FR.lime} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* ── YOU RECEIVE ── */}
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:FR.textTert, margin:'0 0 8px' }}>
          You Receive <span style={{ color:FR.textDis, fontWeight:500, textTransform:'none', fontSize:9, letterSpacing:0 }}>(estimate)</span>
        </p>
        <div style={{
          display:'flex', alignItems:'center',
          background:`rgba(204,255,0,0.04)`, border:`1px solid rgba(204,255,0,0.14)`,
          borderRadius:12, padding:'14px 14px 14px 18px', gap:10, marginBottom:16,
        }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{
              fontSize:28, fontWeight:700, letterSpacing:'-0.03em',
              color: rate ? FR.lime : FR.textDis,
              fontFamily:FR.mono,
            }}>
              {outputAmount ?? (fetchError ? '—' : '…')}
            </div>
            {rate && (
              <p style={{ margin:'3px 0 0', fontSize:10, color:FR.textTert, fontFamily:FR.mono }}>
                @ ₹{rate.toFixed(2)} per USDT · {NET_LABEL[network]}
              </p>
            )}
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:7,
            background:`rgba(204,255,0,0.08)`, border:`1px solid rgba(204,255,0,0.18)`,
            borderRadius:8, padding:'7px 12px', flexShrink:0,
          }}>
            {mode==='buy' ? <TokenIcon network={network} size={22}/> : <InrIcon size={22}/>}
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:FR.lime, lineHeight:1 }}>{recvCurrency}</div>
              {mode==='buy' && (
                <div style={{ fontSize:9, color:FR.textTert, marginTop:2, lineHeight:1, fontFamily:FR.mono }}>{NET_LABEL[network]}</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Rate Grid ── */}
        {(rates.BEP20 || rates.ERC20 || rates.TRC20) && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
            {(['BEP20','ERC20','TRC20'] as Network[]).map(n => {
              const r = rates[n];
              const col = NET_COLOR[n];
              const active = n===network;
              return (
                <button key={n} className="ew-rate-btn" onClick={() => setNetwork(n)} style={{
                  background: active ? `${col}12` : FR.dark3,
                  border: active ? `1px solid ${col}60` : `1px solid ${FR.borderDef}`,
                  borderRadius:10, padding:'9px 8px', textAlign:'center',
                  cursor:'pointer', fontFamily:FR.sans,
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, marginBottom:4 }}>
                    <NetworkIcon network={n} size={14}/>
                    <span style={{ fontSize:8, fontWeight:800, color: active ? col : FR.textTert, letterSpacing:'0.06em', textTransform:'uppercase' }}>{n}</span>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color: active ? FR.textPri : FR.textSec, fontFamily:FR.mono, letterSpacing:'-0.02em' }}>
                    {r ? `₹${(mode==='buy' ? r.buyRate : r.sellRate).toFixed(2)}` : '—'}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Order Summary (collapsible) ── */}
        {rate && outputAmount && (
          <div style={{ background:FR.dark3, border:`1px solid ${FR.borderSub}`, borderRadius:12, marginBottom:14, overflow:'hidden' }}>
            <button
              onClick={() => setShowSummary(s => !s)}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'transparent', border:'none', cursor:'pointer', fontFamily:FR.sans }}
            >
              <span style={{ fontSize:11, fontWeight:600, color:FR.textTert }}>Your order</span>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ fontSize:11, fontWeight:700, color:FR.textSec, fontFamily:FR.mono, letterSpacing:'-0.02em' }}>
                  {mode==='buy'
                    ? `${outputAmount} USDT for ₹${Number(amount).toLocaleString('en-IN')}`
                    : `₹${outputAmount} for ${amount} USDT`}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: showSummary ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }}>
                  <path d="M2 4L6 8L10 4" stroke={FR.textTert} strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
            </button>

            {showSummary && (
              <div style={{ borderTop:`1px solid ${FR.borderSub}`, padding:'10px 14px', display:'flex', flexDirection:'column', gap:7 }}>
                {[
                  { label:'1 USDT', value:`≈ ₹${rate.toFixed(2)}`, valueColor:FR.textPri },
                  { label:'Processing fee', value:'₹ 0', valueColor:FR.success },
                  { label:'Network fee', value:'0 USDT', valueColor:FR.success },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:11, color:FR.textTert }}>{row.label}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:row.valueColor, fontFamily:FR.mono }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${FR.borderSub}`, paddingTop:7, marginTop:2 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:FR.textPri }}>Settlement</span>
                  <span style={{ fontSize:11, fontWeight:700, color:FR.lime, fontFamily:FR.mono }}>Under 15 min</span>
                </div>
              </div>
            )}
          </div>
        )}

        {fetchError && (
          <div style={{ marginBottom:12, background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:10, padding:'9px 14px', fontSize:11, color:FR.danger, textAlign:'center', fontFamily:FR.sans }}>
            Unable to load live rates — retrying…
          </div>
        )}

        {/* ── Minimum order warning ── */}
        {showMinWarning && (
          <div style={{ marginBottom:12, background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, fontFamily:FR.sans }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0 }}>
              <circle cx="7" cy="7" r="6" stroke={FR.danger} strokeWidth="1.4"/>
              <path d="M7 4.5v3" stroke={FR.danger} strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="7" cy="9.5" r="0.7" fill={FR.danger}/>
            </svg>
            <span style={{ fontSize:12, color:FR.danger, lineHeight:1.5 }}>
              Minimum {mode === 'sell' ? 'sell' : 'buy'} is{' '}
              <strong>${minRequired} USDT</strong>
              {mode === 'buy' && minInr ? ` (≈ ₹${minInr.toLocaleString('en-IN')})` : ''}
            </span>
          </div>
        )}

        {/* ── CTA Button ── */}
        {mode === 'sell' ? (
          <button
            onClick={() => {
              if (status === 'loading') return;
              if (!isAuthed) { goToLogin('/dashboard'); return; }
              if (belowMin) { setAttemptedSubmit(true); return; }
              setShowSellFlow(true);
            }}
            className="ew-cta"
            style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              width:'100%', padding:'15px 0', borderRadius:12,
              background: FR.lime, color: '#000',
              border:'none', cursor:'pointer',
              fontSize:15, fontWeight:800, letterSpacing:'-0.01em',
              transition:'all 0.15s',
              boxShadow: `0 4px 20px rgba(204,255,0,0.22)`,
              fontFamily: FR.sans,
            }}
          >
            Proceed · Sell USDT
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M9 4L13 8L9 12" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={() => {
              if (status === 'loading') return;
              if (!isAuthed) { goToLogin('/dashboard'); return; }
              if (belowMin) { setAttemptedSubmit(true); return; }
              setShowBuyFlow(true);
            }}
            className="ew-cta"
            style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              width:'100%', padding:'15px 0', borderRadius:12,
              background: FR.lime, color: '#000',
              border:'none', cursor:'pointer',
              fontSize:15, fontWeight:800, letterSpacing:'-0.01em',
              transition:'all 0.15s',
              boxShadow: `0 4px 20px rgba(204,255,0,0.22)`,
              fontFamily: FR.sans,
            }}
          >
            Proceed · Buy USDT
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M9 4L13 8L9 12" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* ── Payment Methods ── */}
        <div style={{ marginTop:14, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', justifyContent:'center' }}>
            {['UPI','IMPS','NEFT','RTGS'].map((m, i) => (
              <div key={m} style={{ padding:'4px 9px', borderRadius:6, background:FR.dark3, border:`1px solid ${FR.borderDef}` }}>
                <span style={{ fontSize:10, fontWeight:800, color: i===0 ? '#00B9F1' : FR.textSec, letterSpacing:'0.02em', fontFamily:FR.sans }}>{m}</span>
              </div>
            ))}
            <div style={{ padding:'4px 9px', borderRadius:6, background:FR.dark3, border:`1px solid ${FR.borderDef}`, display:'flex', alignItems:'center', gap:4 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="2.5" width="10" height="7" rx="2" stroke={FR.textTert} strokeWidth="1.1"/>
                <circle cx="6" cy="6" r="1.5" stroke={FR.textTert} strokeWidth="1.1"/>
              </svg>
              <span style={{ fontSize:10, fontWeight:800, color:FR.textSec, fontFamily:FR.sans }}>Cash</span>
            </div>
          </div>
          <p style={{ fontSize:10, color:FR.textTert, margin:0, textAlign:'center', fontFamily:FR.sans }}>
            No hidden fees · Non-custodial escrow · KYC compliant
          </p>
        </div>

      </div>

      {/* ── Sell Flow Modal ── */}
      {showSellFlow && rate && (
        <SellFlowModal
          network={network}
          usdtAmount={numAmt}
          inrAmount={outputAmount ?? '0'}
          rate={rate}
          onClose={() => setShowSellFlow(false)}
        />
      )}

      {/* ── Buy Flow Modal ── */}
      {showBuyFlow && rate && (
        <BuyFlowModal
          network={network}
          usdtAmount={numAmt}
          inrAmount={outputAmount ?? '0'}
          rate={rate}
          onClose={() => setShowBuyFlow(false)}
        />
      )}
    </div>
  );
}
