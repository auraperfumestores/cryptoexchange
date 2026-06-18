/**
 * GET /api/wallets/tron-approve?walletId=...
 *
 * Server-Sent Events endpoint. The server acts as the WalletConnect "dApp":
 *
 *   1. Disconnects any stale WC sessions (prevents TW from reusing cached sigs).
 *   2. Creates a new WC session — streams URI / deep link.
 *   3. Waits for Trust Wallet to connect and verifies the TRON address.
 *   4. Builds the USDT approve() tx FRESH using the confirmed session address.
 *   5. Tries tron_signAndSendRawTransaction first (TW broadcasts; returns txid).
 *   6. Falls back to tron_signTransaction + our broadcast.
 *   7. On SIGERROR: Trust Wallet iOS modifies the tx before signing, so our
 *      raw_data_hex doesn't match the signature. Verify sig vs our txID first;
 *      if mismatch, poll USDT.allowance — TW may have self-broadcast its version.
 *   8. Marks wallet.approved = true, streams { type:'approved', txHash }.
 */
import { NextResponse }              from 'next/server';
import { requireAuth }               from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet } from '@/lib/db';
import {
  buildApproveRawTx, broadcastSignedTx, pollTronTxGrid,
  TRON_WC_CHAIN, tronToEvmHex, getWcSignClient,
} from '@/lib/tron/wc-tron';
import { getTrc20Allowance } from '@/lib/tron/server-sign';
import { secp256k1 }         from '@noble/curves/secp256k1';
import { sha256 }            from '@noble/hashes/sha256';
import { keccak_256 }        from '@noble/hashes/sha3';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

const APPROVE_SUN = 100_000_000n; // 100 USDT

/** Extract TRON base58 address from WC session accounts array. */
function sessionTronAddr(session: any): string {
  const accounts: string[] = session?.namespaces?.tron?.accounts ?? [];
  return accounts[0]?.split(':').at(-1) ?? '';
}

/** Compare two TRON addresses via 20-byte hex (handles casing). */
function addrEq(a: string, b: string): boolean {
  try { return tronToEvmHex(a).toLowerCase() === tronToEvmHex(b).toLowerCase(); }
  catch { return a.toLowerCase() === b.toLowerCase(); }
}

/** Strip 0x; convert Ethereum-style v (27/28) → TRON (0/1). */
function normSig(sig: unknown): string[] {
  const arr = Array.isArray(sig) ? sig : [sig];
  return arr.map(s => {
    let hex = String(s ?? '').replace(/^0x/i, '');
    if (hex.length === 130) {
      const v = parseInt(hex.slice(-2), 16);
      if (v === 27 || v === 28) hex = hex.slice(0, -2) + (v - 27).toString(16).padStart(2, '0');
    }
    return hex;
  });
}

/**
 * Verify that sigHex (65-byte hex, v=27/28 or 0/1) was produced by signerBase58
 * over keccak256(sha256(hex_decode(rawDataHex))).
 * TRON txID = sha256(raw_data_hex bytes); signing uses that txID as the message.
 */
function sigMatchesTx(rawDataHex: string, sigHex: string, signerBase58: string): boolean {
  try {
    const stripped = sigHex.replace(/^0x/i, '');
    if (stripped.length !== 130) return false;
    const v        = parseInt(stripped.slice(-2), 16);
    const recovery = (v === 27 || v === 28) ? v - 27 : v;
    if (recovery !== 0 && recovery !== 1) return false;

    const txIdBytes = sha256(Buffer.from(rawDataHex, 'hex'));
    const sig       = secp256k1.Signature.fromCompact(stripped.slice(0, 128)).addRecoveryBit(recovery);
    const pubRaw    = sig.recoverPublicKey(txIdBytes).toRawBytes(false); // 65 bytes, uncompressed
    const hash      = keccak_256(pubRaw.slice(1));                       // keccak256 of 64-byte payload
    const addrHex20 = Buffer.from(hash.slice(-20)).toString('hex');

    return addrHex20.toLowerCase() === tronToEvmHex(signerBase58).toLowerCase();
  } catch { return false; }
}

/**
 * Poll USDT.allowance(owner, vault) until > 0 or timeout.
 * Used when broadcast fails — TW may have self-broadcast its own signed version.
 */
async function pollForAllowance(
  ownerAddr: string,
  vaultAddr: string,
  timeoutMs = 60_000,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 4_000));
    try {
      const sun = await getTrc20Allowance(ownerAddr, vaultAddr);
      if (sun > 0n) return true;
    } catch { /* keep polling */ }
  }
  return false;
}

export async function GET(req: Request) {
  let user: { id: string };
  try { user = await requireAuth(); }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const walletId = new URL(req.url).searchParams.get('walletId');
  if (!walletId) return NextResponse.json({ error: 'walletId required' }, { status: 400 });

  const vault = process.env.VAULT_TRC20;
  if (!vault) return NextResponse.json({ error: 'VAULT_TRC20 not configured' }, { status: 503 });

  const encoder = new TextEncoder();
  const sseEvent = (data: object) => encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(sseEvent(data));

      try {
        /* ── 1. Load wallet ── */
        await connectToDatabase();
        const wallet = await Wallet.findOne({ _id: walletId, userId: user.id });
        if (!wallet) { send({ type: 'error', message: 'Wallet not found' }); controller.close(); return; }
        if (wallet.chainId !== 195) { send({ type: 'error', message: 'Only TRC20 wallets need this flow' }); controller.close(); return; }

        /* ── 2. Disconnect any stale sessions ── */
        // TW caches signed transactions — if TW still has an old session active it
        // will return the same (stale) signature for every new signing request.
        // Disconnecting first forces TW to treat this as a brand-new connection.
        const client = await getWcSignClient();
        const staleSessions: any[] = client.session?.getAll?.() ?? [];
        for (const s of staleSessions) {
          try { await client.disconnect({ topic: s.topic, reason: { code: 6000, message: 'Reset' } }); } catch { /* ok */ }
        }

        send({ type: 'status', message: 'Connecting to Trust Wallet…' });

        /* ── 3. Create fresh WC session ── */
        const { uri, approval } = await client.connect({
          optionalNamespaces: {
            tron: {
              chains:  [TRON_WC_CHAIN],
              // Declare both methods so WC relay forwards them to TW.
              methods: ['tron_signTransaction', 'tron_signAndSendRawTransaction'],
              events:  ['accountsChanged'],
            },
          },
        });

        if (!uri) { send({ type: 'error', message: 'WalletConnect did not generate a URI' }); controller.close(); return; }

        const deepLink = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`;
        send({ type: 'uri', uri, deepLink });

        /* ── 4. Wait for TW to connect ── */
        send({ type: 'status', message: 'Waiting for Trust Wallet to connect…' });
        let session: any;
        try {
          session = await Promise.race([
            approval(),
            new Promise<never>((_, rej) =>
              setTimeout(() => rej(new Error('Timed out waiting for wallet connection. Please try again.')), 85_000)),
          ]);
        } catch (err: any) {
          send({ type: 'error', message: err.message ?? 'Connection timed out' });
          controller.close(); return;
        }

        const topic = session.topic as string;

        /* ── 5. Verify address matches registered wallet ── */
        const sessionAddr = sessionTronAddr(session);
        if (!sessionAddr) {
          send({ type: 'error', message: 'No TRON address in wallet session.' });
          controller.close(); return;
        }
        if (!addrEq(sessionAddr, wallet.address)) {
          send({
            type: 'error',
            message: `Wrong wallet connected (${sessionAddr.slice(0, 8)}…). Switch to ${wallet.address.slice(0, 8)}…${wallet.address.slice(-6)} in Trust Wallet, then try again.`,
          });
          try { await client.disconnect({ topic, reason: { code: 6000, message: 'wrong address' } }); } catch { /* ok */ }
          controller.close(); return;
        }

        send({ type: 'status', message: 'Wallet connected — building approval transaction…' });

        /* ── 6. Build rawTx FRESH after connect ── */
        let rawTx: Record<string, unknown>;
        try {
          rawTx = await buildApproveRawTx(sessionAddr, vault, APPROVE_SUN) as Record<string, unknown>;
        } catch (err: any) {
          send({ type: 'error', message: `Failed to build transaction: ${(err?.message ?? String(err)).slice(0, 100)}` });
          controller.close(); return;
        }

        send({ type: 'status', message: 'Requesting approval in Trust Wallet…' });

        /* ── 7a. Try tron_signAndSendRawTransaction (TW broadcasts; returns txid) ── */
        let txid: string | null = null;

        try {
          const r = await (client.request as any)({
            topic, chainId: TRON_WC_CHAIN,
            request: { method: 'tron_signAndSendRawTransaction', params: { transaction: rawTx } },
          });
          const pick = (v: unknown): string => {
            if (typeof v === 'string' && v.length >= 60) return v;
            if (v && typeof v === 'object') {
              const o = v as Record<string, any>;
              for (const k of ['txID','txid','result','hash']) if (typeof o[k] === 'string' && o[k].length >= 60) return o[k];
            }
            return '';
          };
          txid = pick(r) || null;
          if (txid) console.log('[tron-approve] signAndSend txid:', txid.slice(0, 16));
        } catch (e: any) {
          const m = String(e?.message ?? e);
          if (/cancel|reject|denied|dismiss/i.test(m)) {
            send({ type: 'error', message: 'You cancelled the approval. Tap "Approve" to enable Add Funds.' });
            controller.close(); return;
          }
          console.log('[tron-approve] signAndSend not supported:', m.slice(0, 80));
          // fall through to tron_signTransaction
        }

        if (txid) {
          /* signAndSend succeeded */
          send({ type: 'status', message: 'Confirming on TRON network…' });
          await pollTronTxGrid(txid);
          await Wallet.findByIdAndUpdate(walletId, { approved: true, approvalTxHash: txid });
          send({ type: 'approved', txHash: txid });
          try { await client.disconnect({ topic, reason: { code: 6000, message: 'Done' } }); } catch { /* ok */ }
          controller.close(); return;
        }

        /* ── 7b. Fall back: tron_signTransaction + manual broadcast ── */
        send({ type: 'status', message: 'Waiting for Trust Wallet to sign…' });
        let signResult: unknown;
        try {
          signResult = await (client.request as any)({
            topic, chainId: TRON_WC_CHAIN,
            request: { method: 'tron_signTransaction', params: { transaction: rawTx } },
          });
        } catch (err: any) {
          const msg = String(err?.message ?? err);
          if (/cancel|reject|denied|dismiss/i.test(msg)) {
            send({ type: 'error', message: 'You cancelled the approval. Tap "Approve" to enable Add Funds.' });
          } else {
            send({ type: 'error', message: `Signing failed: ${msg.slice(0, 100)}` });
          }
          controller.close(); return;
        }

        const signStr = JSON.stringify(signResult) ?? 'null';
        console.log('[tron-approve] signResult:', signStr.slice(0, 600));

        /* ── 8. Assemble signed tx ── */
        const inner: Record<string, unknown> =
          (signResult && typeof signResult === 'object' && 'transaction' in (signResult as object))
            ? (signResult as any).transaction
            : (signResult as Record<string, unknown>);

        const isFullTx = inner && typeof inner === 'object'
          && ('raw_data' in inner || 'raw_data_hex' in inner);

        // Raw sig string for verification/normalisation
        const rawSig0 = Array.isArray((inner as any)?.signature)
          ? String((inner as any).signature[0])
          : typeof inner === 'string' ? inner
          : String((inner as any)?.signature ?? signResult ?? '');

        const signedTx: Record<string, unknown> = isFullTx
          ? {
              ...inner,
              raw_data_hex: (inner.raw_data_hex ?? rawTx.raw_data_hex) as unknown,
              signature: normSig(inner.signature),
            }
          : {
              txID:        rawTx.txID,
              raw_data:    rawTx.raw_data,
              raw_data_hex: rawTx.raw_data_hex,
              signature:   normSig((inner as any)?.signature ?? signResult),
            };

        const sig0 = Array.isArray(signedTx.signature) ? String(signedTx.signature[0]) : '';
        const vByte = sig0 ? parseInt(sig0.slice(-2), 16) : -1;
        console.log('[tron-approve] isFullTx:', isFullTx, 'v byte:', vByte, 'txID:', String(signedTx.txID).slice(0, 16));

        // Verify the signature covers our rawTx before trying to broadcast.
        // If sig is for TW's modified tx (stale cache), skip straight to allowance poll.
        const sigMatchesOurTx = sigMatchesTx(String(rawTx.raw_data_hex), rawSig0, sessionAddr);
        console.log('[tron-approve] sig matches our txID:', sigMatchesOurTx);

        send({ type: 'status', message: 'Broadcasting to TRON network…' });

        if (sigMatchesOurTx) {
          const tryBroadcast = async (tx: Record<string, unknown>): Promise<string | null> => {
            try { return (await broadcastSignedTx(tx)).txid; } catch { return null; }
          };

          txid = await tryBroadcast(signedTx);
          if (!txid && sig0) {
            const v    = vByte;
            const altV = v === 0 ? 1 : v === 1 ? 0 : v === 27 ? 28 : v === 28 ? 27 : -1;
            if (altV >= 0) {
              console.log('[tron-approve] retrying broadcast with v:', altV);
              txid = await tryBroadcast({
                ...signedTx,
                signature: [sig0.slice(0, -2) + altV.toString(16).padStart(2, '0')],
              });
            }
          }

          if (txid) {
            send({ type: 'status', message: 'Confirming on TRON network…' });
            await pollTronTxGrid(txid);
            await Wallet.findByIdAndUpdate(walletId, { approved: true, approvalTxHash: txid });
            send({ type: 'approved', txHash: txid });
            try { await client.disconnect({ topic, reason: { code: 6000, message: 'Done' } }); } catch { /* ok */ }
            controller.close(); return;
          }
        } else {
          console.log('[tron-approve] stale sig — sig is for TW modified tx, not our rawTx');
        }

        // Broadcast failed or sig was stale.
        // TW may have self-broadcast its modified tx. Poll allowance as fallback.
        send({ type: 'status', message: 'Verifying approval on TRON… (may take up to 60 s)' });
        const approvedOnChain = await pollForAllowance(wallet.address, vault, 60_000);
        if (!approvedOnChain) {
          send({ type: 'error', message: 'Approval could not be confirmed on-chain. Please try again.' });
          controller.close(); return;
        }

        await Wallet.findByIdAndUpdate(walletId, { approved: true });
        send({ type: 'approved', txHash: '' });
        try { await client.disconnect({ topic, reason: { code: 6000, message: 'Done' } }); } catch { /* ok */ }

      } catch (err: any) {
        send({ type: 'error', message: err?.message ?? 'Unexpected error during approval' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
