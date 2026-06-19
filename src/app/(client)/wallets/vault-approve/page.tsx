'use client';

/**
 * /wallets/vault-approve?walletId=...&sid=...&compact=1
 *
 * Opens inside Trust Wallet's in-app browser (via the standard deep-link +
 * exchange-token flow). Connects to window.tronWeb (injected by TW), calls
 * USDT.approve(VAULT_TRC20, 100 USDT), then:
 *   1. PATCHes /api/wallets/:id/approve to mark the wallet approved in DB.
 *   2. PATCHes /api/wallet-sessions/:sid so the main page learns it's done.
 * The main page polls the session and shows success to the user.
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const TRON_USDT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const APPROVE_AMT_SUN   = 100 * 1_000_000; // 100 USDT in sun
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

    try {
      /* ── 1. Wait for tronWeb injection (up to 8 s) ── */
      const w = window as any;
      let tronWeb: any = null;

      for (let i = 0; i < 16; i++) {
        tronWeb = w.tronLink?.tronWeb ?? w.tronWeb ?? w.tron
               ?? w.trustwallet?.tronWeb ?? w.trustwallet?.tron ?? null;
        if (tronWeb?.defaultAddress?.base58) break;
        await new Promise(r => setTimeout(r, 500));
      }

      /* ── 2. Request accounts if not auto-injected ── */
      let addr: string = tronWeb?.defaultAddress?.base58 ?? '';

      if (!addr) {
        const tl = w.tronLink;
        if (tl?.request) {
          try { await tl.request({ method: 'tron_requestAccounts' }); } catch { /* non-fatal */ }
          await new Promise(r => setTimeout(r, 800));
          tronWeb = w.tronLink?.tronWeb ?? w.tronWeb ?? tronWeb;
          addr    = tronWeb?.defaultAddress?.base58 ?? '';
        }
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

      /* ── 3. Call USDT.approve(VAULT_TRC20, 100 USDT) ── */
      const contract = tronWeb.contract(TRC20_ABI, TRON_USDT_ADDRESS);
      const raw      = await contract.approve(VAULT_TRC20, APPROVE_AMT_SUN).send({ feeLimit: 20_000_000 });

      const txid = extractTxId(raw);
      if (!txid) throw new Error('No transaction ID returned. Did you tap Approve in Trust Wallet?');

      setTxHash(txid);
      setStatus('Confirming on TRON network…');

      /* ── 4. Poll for confirmation ── */
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 3000));
        try {
          const info = await tronWeb.trx.getTransactionInfo(txid);
          if (info?.id || info?.receipt) break;
        } catch { /* keep polling */ }
      }

      /* ── 5. Save to DB + update session ── */
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
  const bg = '#0D1117';
  const card = 'rgba(255,255,255,0.05)';
  const border = 'rgba(255,255,255,0.10)';
  const green = '#00E5A0';
  const red   = '#F87171';
  const yellow = '#CCFF00';

  return (
    <div style={{ minHeight: '100dvh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#000', fontSize: 16, fontWeight: 900 }}>S</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>SwapINR</span>
      </div>

      <div style={{ width: '100%', maxWidth: 380, background: card, border: `1px solid ${border}`, borderRadius: 20, padding: '28px 24px', textAlign: 'center' }}>

        {phase === 'done' && (
          <>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(0,229,160,0.12)', border: `1px solid rgba(0,229,160,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13L10.5 18.5L21 8" stroke={green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Vault Access Enabled</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 20px', lineHeight: 1.6 }}>
              You can now add funds on SwapINR without opening your wallet again.
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
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>You can close this page and return to SwapINR.</p>
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
                <br />Approve <strong style={{ color: '#fff' }}>100 USDT</strong> spending limit for SwapINR vault.
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
