'use client';

/**
 * /wallets/vault-approve?walletId=...&sid=...
 *
 * Opens inside Trust Wallet's in-app browser (via the standard deep-link +
 * exchange-token flow). Connects to the TRON provider (window.tronWeb,
 * window.trustwallet.request, etc.), calls USDT.approve(VAULT_TRC20, 100 USDT),
 * then:
 *   1. PATCHes /api/wallets/:id/approve to mark the wallet approved in DB.
 *   2. PATCHes /api/wallet-sessions/:sid so the main page learns it's done.
 *
 * Provider priority (mirrors startTrcVerification in wallet-verify-flow.tsx):
 *   1. window.tronWeb / window.tronLink.tronWeb  → contract.approve().send()
 *   2. window.trustwallet.request                → buildApproveRawTx + sign
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  buildApproveRawTx,
  broadcastSignedTx,
  pollTronTxGrid,
} from '@/lib/tron/wc-tron';

const TRON_USDT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const APPROVE_AMT_SUN   = 100 * 1_000_000;        // number — for contract.approve().send()
const APPROVE_AMT_BIG   = BigInt(100 * 1_000_000); // bigint — for buildApproveRawTx
const VAULT_TRC20       = process.env.NEXT_PUBLIC_VAULT_TRC20 ?? '';

const TRC20_ABI = [
  {
    name: 'approve', type: 'function', stateMutability: 'nonpayable',
    inputs:  [{ name: '_spender', type: 'address' }, { name: '_value', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

function extractTxId(r: unknown): string {
  if (typeof r === 'string' && r.length >= 60) return r;
  const o = r as any;
  return o?.txid ?? o?.txID ?? o?.transaction_id ?? o?.result?.txid ?? '';
}

// Normalize v=27/28 → 0/1 (TW uses Ethereum convention; TronGrid expects TRON)
function normSig(sig: unknown): string[] {
  const arr = Array.isArray(sig) ? sig : [sig];
  return arr.map((s: unknown) => {
    let hex = String(s ?? '').replace(/^0x/i, '');
    if (hex.length === 130) {
      const v = parseInt(hex.slice(-2), 16);
      if (v === 27 || v === 28) hex = hex.slice(0, -2) + (v - 27).toString(16).padStart(2, '0');
    }
    return hex;
  });
}

function VaultApproveInner() {
  const params   = useSearchParams();
  const sid      = params.get('sid')      ?? '';
  const walletId = params.get('walletId') ?? '';

  const [phase,   setPhase]   = useState<'connecting' | 'approving' | 'done' | 'error'>('connecting');
  const [status,  setStatus]  = useState('Connecting to Trust Wallet…');
  const [txHash,  setTxHash]  = useState('');
  const [errMsg,  setErrMsg]  = useState('');
  const ran = useRef(false);

  async function patchSession(data: object) {
    if (!sid) return;
    await fetch(`/api/wallet-sessions/${sid}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  }

  async function run() {
    if (ran.current) return;
    ran.current = true;

    const w = window as any;

    try {
      /* ── 1. Detect TRON provider (mirrors connectTronWallet) ── */
      function getTronWeb() {
        const tl: any = w.tronLink ?? null;
        return tl?.tronWeb ?? w.tronWeb ?? w.tron
            ?? w.trustwallet?.tronWeb ?? w.trustwallet?.tron ?? null;
      }
      function hasSomeTron() {
        return !!(w.tronLink) || 'tronLink' in w
            || !!(w.tronWeb)  || 'tronWeb'  in w
            || !!(w.tron)
            || !!(w.trustwallet?.tronWeb) || !!(w.trustwallet?.tron);
      }

      let tronWeb: any = getTronWeb();

      // Poll up to 4 s for async injection (Trust Wallet injects after page load)
      if (!hasSomeTron()) {
        for (let i = 0; i < 8; i++) {
          await new Promise(r => setTimeout(r, 500));
          tronWeb = getTronWeb();
          if (hasSomeTron()) break;
        }
        tronWeb = getTronWeb();
      }

      /* ── 2. Resolve wallet address ── */
      let addr: string = tronWeb?.defaultAddress?.base58 ?? '';

      if (!addr) {
        // Try tronLink.request (TronLink desktop + some TW builds)
        const tl = w.tronLink;
        if (tl?.request) {
          try { await tl.request({ method: 'tron_requestAccounts' }); } catch { /* non-fatal */ }
          await new Promise(r => setTimeout(r, 600));
          tronWeb = getTronWeb();
          addr = tronWeb?.defaultAddress?.base58 ?? '';
        }
      }

      if (!addr && w.trustwallet?.request) {
        // iOS Trust Wallet: window.tronLink not present, but window.trustwallet.request works
        try {
          const res = await w.trustwallet.request({ method: 'tron_requestAccounts' });
          addr = (typeof res === 'string' && res.startsWith('T') ? res : null)
              ?? (res as any)?.base58 ?? (res as any)?.address ?? '';
        } catch { /* non-fatal */ }
        if (!addr) {
          await new Promise(r => setTimeout(r, 600));
          tronWeb = getTronWeb();
          addr = tronWeb?.defaultAddress?.base58 ?? '';
        }
      }

      // Final 800 ms grace period
      if (!addr) {
        await new Promise(r => setTimeout(r, 800));
        tronWeb = getTronWeb();
        addr = tronWeb?.defaultAddress?.base58 ?? '';
      }

      if (!addr) {
        throw new Error('Could not read TRON address. Please unlock Trust Wallet and try again.');
      }

      if (!VAULT_TRC20) {
        throw new Error('Vault address not configured. Contact support.');
      }

      await patchSession({ status: 'connected', address: addr });
      setPhase('approving');
      setStatus('Waiting for your approval in Trust Wallet…');

      /* ── 3. Approve USDT.approve(VAULT_TRC20, 100 USDT) ── */

      // twDirect: iOS path where tronWeb is absent but window.trustwallet.request is present
      const twDirect = (!tronWeb && w.trustwallet?.request)
        ? (w.trustwallet.request.bind(w.trustwallet) as (p: object) => Promise<unknown>)
        : null;

      let txid = '';

      if (tronWeb) {
        /* ── TronLink / injected tronWeb path ── */
        const contract = tronWeb.contract(TRC20_ABI, TRON_USDT_ADDRESS);
        const raw = await contract.approve(VAULT_TRC20, APPROVE_AMT_SUN).send({ feeLimit: 20_000_000 });
        txid = extractTxId(raw);
        if (!txid) throw new Error('No transaction ID returned. Did you tap Approve in Trust Wallet?');
        setTxHash(txid);
        setStatus('Confirming on TRON network…');
        await pollTronTxGrid(txid);

      } else if (twDirect) {
        /* ── Trust Wallet direct provider (iOS in-app browser) ── */
        const rawTx = await buildApproveRawTx(addr, VAULT_TRC20, APPROVE_AMT_BIG);

        // Attempt 1: tron_signAndSendRawTransaction (sign + broadcast in one call)
        try {
          const r = await twDirect({ method: 'tron_signAndSendRawTransaction', params: { transaction: rawTx } });
          const ro = r as any;
          txid = ro?.txid ?? ro?.txID ?? ro?.transaction_id ?? (typeof r === 'string' ? r : '') ?? '';
        } catch (e1: any) {
          if (/cancel|reject|denied|dismiss/i.test(String(e1?.message ?? e1))) throw e1;
          // Non-fatal — fall through to attempt 2
        }

        if (!txid) {
          // Attempt 2: tron_signTransaction + manual TronGrid broadcast
          const signResult = await twDirect({ method: 'tron_signTransaction', params: { transaction: rawTx } });

          const isFullTx = signResult && typeof signResult === 'object'
            && ('raw_data' in (signResult as object) || 'raw_data_hex' in (signResult as object));

          let signedTx: Record<string, unknown>;
          if (isFullTx) {
            signedTx = { ...(signResult as Record<string, unknown>) };
            if (signedTx.signature) signedTx.signature = normSig(signedTx.signature);
          } else {
            const sig = (signResult as any)?.signature ?? signResult;
            signedTx = {
              txID:         (rawTx as any).txID,
              raw_data:     (rawTx as any).raw_data,
              raw_data_hex: (rawTx as any).raw_data_hex,
              signature:    normSig(sig),
            };
          }

          const { txid: bid } = await broadcastSignedTx(signedTx);
          txid = bid;
        }

        if (!txid) throw new Error('No transaction ID returned from Trust Wallet. Did you tap Approve?');
        setTxHash(txid);
        setStatus('Confirming on TRON network…');
        await pollTronTxGrid(txid);

      } else {
        throw new Error('TRON provider not found. Please open this page inside Trust Wallet.');
      }

      /* ── 4. Save to DB + update session ── */
      if (walletId) {
        await fetch(`/api/wallets/${walletId}/approve`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved: true, approvalTxHash: txid }),
        }).catch(() => {});
      }

      await patchSession({ status: 'approved', txHash: txid, address: addr });
      setPhase('done');
      setStatus('Vault access enabled!');

    } catch (e: any) {
      const msg = e?.message ?? String(e);
      const isCancel = /cancel|reject|denied|dismiss/i.test(msg);
      const display  = isCancel
        ? 'Approval cancelled. Tap "Try Again" and confirm in Trust Wallet.'
        : msg.slice(0, 200);
      setErrMsg(display);
      setPhase('error');
      await patchSession({ status: 'failed', errorMsg: display });
    }
  }

  useEffect(() => { run(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── UI ── */
  const bg     = '#0D1117';
  const card   = 'rgba(255,255,255,0.05)';
  const border = 'rgba(255,255,255,0.10)';
  const green  = '#00E5A0';
  const red    = '#F87171';
  const yellow = '#CCFF00';

  return (
    <div style={{ minHeight: '100dvh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#000', fontSize: 16, fontWeight: 900 }}>S</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>SwappINR</span>
      </div>

      <div style={{ width: '100%', maxWidth: 380, background: card, border: `1px solid ${border}`, borderRadius: 20, padding: '28px 24px', textAlign: 'center' }}>

        {phase === 'done' && (
          <>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(0,229,160,0.12)', border: `1px solid rgba(0,229,160,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13L10.5 18.5L21 8" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Vault Access Enabled</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 20px', lineHeight: 1.6 }}>
              You can now add funds on SwappINR without opening your wallet again.
            </p>
            {txHash && (
              <a
                href={`https://tronscan.org/#/transaction/${txHash}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: yellow, textDecoration: 'none', marginBottom: 20, opacity: 0.85 }}
              >
                View on TronScan ↗
              </a>
            )}
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>You can close this page and return to SwappINR.</p>
          </>
        )}

        {phase === 'error' && (
          <>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(248,113,113,0.10)', border: `1px solid rgba(248,113,113,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M8 8L18 18M18 8L8 18" stroke={red} strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Approval Failed</h2>
            <p style={{ fontSize: 13, color: 'rgba(248,113,113,0.85)', margin: '0 0 24px', lineHeight: 1.6, padding: '10px 12px', background: 'rgba(248,113,113,0.07)', borderRadius: 10, border: '1px solid rgba(248,113,113,0.18)' }}>
              {errMsg}
            </p>
            <button
              onClick={() => { ran.current = false; setPhase('connecting'); setStatus('Connecting to Trust Wallet…'); setErrMsg(''); run(); }}
              style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800, background: yellow, color: '#000', border: 'none', cursor: 'pointer' }}
            >
              Try Again
            </button>
          </>
        )}

        {(phase === 'connecting' || phase === 'approving') && (
          <>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(204,255,0,0.08)', border: `1px solid rgba(204,255,0,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(204,255,0,0.2)', borderTopColor: yellow, animation: 'spin 0.8s linear infinite' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Enable Vault Access</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 20px', lineHeight: 1.6 }}>{status}</p>

            {phase === 'approving' && (
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${border}`, borderRadius: 12, fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, textAlign: 'left' }}>
                <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Trust Wallet will ask you to confirm:</strong>
                <br />Approve <strong style={{ color: '#fff' }}>100 USDT</strong> spending limit for SwappINR vault.
                No USDT is transferred now — this just allows future withdrawals.
              </div>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function VaultApprovePage() {
  return (
    <Suspense>
      <VaultApproveInner />
    </Suspense>
  );
}
