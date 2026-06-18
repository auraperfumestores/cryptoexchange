/**
 * GET /api/wallets/tron-approve?walletId=...
 *
 * Server-Sent Events endpoint. The server acts as the WalletConnect "dApp":
 *
 *   1. Creates a WC Sign v2 session proposal (URI streamed immediately).
 *   2. Waits for Trust Wallet to connect.
 *   3. Verifies connected TRON address matches the stored wallet address.
 *   4. Builds the USDT approve() tx FRESH using the confirmed session address.
 *   5. Sends tron_signTransaction.
 *   6. Broadcasts the signed tx.
 *      On SIGERROR: Trust Wallet on iOS modifies the tx before signing and
 *      only returns the signature (not the modified tx), so our broadcast
 *      fails. However TW may have already broadcast its own version — we
 *      poll for allowance change as a fallback before surfacing an error.
 *   7. Marks wallet.approved = true, streams { type:'approved', txHash }.
 *
 * Required env vars:
 *   NEXT_PUBLIC_WC_PROJECT_ID, NEXT_PUBLIC_APP_URL, VAULT_TRC20, TRONGRID_API_KEY
 */
import { NextResponse }              from 'next/server';
import { requireAuth }               from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet } from '@/lib/db';
import {
  buildApproveRawTx, broadcastSignedTx, pollTronTxGrid,
  TRON_WC_CHAIN, tronToEvmHex, getWcSignClient,
} from '@/lib/tron/wc-tron';
import { getTrc20Allowance } from '@/lib/tron/server-sign';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

const APPROVE_SUN = 100_000_000n; // 100 USDT

/** Extract TRON base58 address from WC session (strips chain prefix). */
function sessionTronAddr(session: any): string {
  const accounts: string[] = session?.namespaces?.tron?.accounts ?? [];
  return accounts[0]?.split(':').at(-1) ?? '';
}

/** Compare two TRON addresses via their 20-byte hex (handles casing differences). */
function addrEq(a: string, b: string): boolean {
  try { return tronToEvmHex(a).toLowerCase() === tronToEvmHex(b).toLowerCase(); }
  catch { return a.toLowerCase() === b.toLowerCase(); }
}

/** Normalise sig: strip 0x, convert Ethereum-style v (27/28) → TRON (0/1). */
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
 * Poll USDT.allowance(owner, vault) until it becomes > 0 or timeout.
 * Used as fallback when our broadcast gets SIGERROR — Trust Wallet iOS
 * likely signed and broadcast its own version of the tx successfully.
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

        send({ type: 'status', message: 'Connecting to Trust Wallet…' });

        /* ── 2. Create WC session using the module singleton ── */
        // Use getWcSignClient() so SignClient.init() is called at most once per warm
        // Vercel instance — avoids "Core already initialized" state corruption.
        const client = await getWcSignClient();

        const { uri, approval } = await client.connect({
          optionalNamespaces: {
            tron: {
              chains:  [TRON_WC_CHAIN],
              methods: ['tron_signTransaction'],
              events:  ['accountsChanged'],
            },
          },
        });

        if (!uri) { send({ type: 'error', message: 'WalletConnect did not generate a URI' }); controller.close(); return; }

        const deepLink = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`;
        send({ type: 'uri', uri, deepLink });

        /* ── 3. Wait for wallet to connect ── */
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

        /* ── 4. Verify address ── */
        const sessionAddr = sessionTronAddr(session);
        if (!sessionAddr) {
          send({ type: 'error', message: 'No TRON address found in wallet session.' });
          controller.close(); return;
        }
        if (!addrEq(sessionAddr, wallet.address)) {
          send({
            type: 'error',
            message: `Wrong wallet connected. Please switch to ${wallet.address.slice(0, 8)}…${wallet.address.slice(-6)} in Trust Wallet, then try again.`,
          });
          try { await client.disconnect({ topic, reason: { code: 6000, message: 'wrong address' } }); } catch { /* ok */ }
          controller.close(); return;
        }

        send({ type: 'status', message: 'Wallet connected — building approval transaction…' });

        /* ── 5. Build rawTx FRESH after connect ── */
        // Building after connect: owner_address in tx == signing key; tx is fresh (no expiry window).
        let rawTx: Record<string, unknown>;
        try {
          rawTx = await buildApproveRawTx(sessionAddr, vault, APPROVE_SUN) as Record<string, unknown>;
        } catch (err: any) {
          send({ type: 'error', message: `Failed to build transaction: ${(err?.message ?? String(err)).slice(0, 100)}` });
          controller.close(); return;
        }

        send({ type: 'status', message: 'Requesting approval in Trust Wallet…' });

        /* ── 6. Sign ── */
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

        // Log full result — critical for diagnosing iOS TW sign format.
        const signStr = JSON.stringify(signResult) ?? 'null';
        console.log('[tron-approve] signResult:', signStr.slice(0, 500));
        if (signStr.length > 500) console.log('[tron-approve] signResult (cont):', signStr.slice(500, 1000));

        /* ── 7. Assemble signed tx ── */
        // TW on iOS often modifies the tx (updates timestamp/ref_block) and returns
        // only the signature — not the full signed tx. Unwrap nested wrappers first.
        const inner: Record<string, unknown> =
          (signResult && typeof signResult === 'object' && 'transaction' in (signResult as object))
            ? (signResult as any).transaction
            : (signResult as Record<string, unknown>);

        const isFullTx = inner && typeof inner === 'object'
          && ('raw_data' in inner || 'raw_data_hex' in inner);

        const signedTx: Record<string, unknown> = isFullTx
          ? {
              ...inner,
              raw_data_hex: (inner.raw_data_hex ?? rawTx.raw_data_hex) as unknown,
              signature: normSig(inner.signature),
            }
          : {
              txID:         rawTx.txID,
              raw_data:     rawTx.raw_data,
              raw_data_hex: rawTx.raw_data_hex,
              signature:    normSig((inner as any)?.signature ?? signResult),
            };

        const sig0 = Array.isArray(signedTx.signature) ? String(signedTx.signature[0]) : '';
        console.log('[tron-approve] isFullTx:', isFullTx, 'v byte:', sig0 ? parseInt(sig0.slice(-2), 16) : 'n/a', 'txID:', String(signedTx.txID).slice(0, 16));

        send({ type: 'status', message: 'Broadcasting to TRON network…' });

        /* ── 8. Broadcast + fallback ── */
        let txid: string | null = null;

        const tryBroadcast = async (tx: Record<string, unknown>): Promise<string | null> => {
          try {
            const r = await broadcastSignedTx(tx);
            return r.txid;
          } catch { return null; }
        };

        txid = await tryBroadcast(signedTx);

        // If failed and v byte is 0 or 1, retry with the alternate v.
        if (!txid && sig0) {
          const v    = parseInt(sig0.slice(-2), 16);
          const altV = v === 0 ? 1 : v === 1 ? 0 : v === 27 ? 28 : v === 28 ? 27 : -1;
          if (altV >= 0) {
            console.log('[tron-approve] retrying broadcast with v:', altV);
            txid = await tryBroadcast({
              ...signedTx,
              signature: [sig0.slice(0, -2) + altV.toString(16).padStart(2, '0')],
            });
          }
        }

        // Both broadcasts failed.
        // Trust Wallet iOS may have modified the tx before signing and broadcast
        // its own version internally. Poll allowance as a fallback.
        if (!txid) {
          console.log('[tron-approve] broadcast failed both ways — polling allowance for TW self-broadcast');
          send({ type: 'status', message: 'Verifying approval on TRON…' });

          const approved = await pollForAllowance(wallet.address, vault, 60_000);
          if (!approved) {
            send({ type: 'error', message: 'Approval could not be confirmed on-chain. Please try again.' });
            controller.close(); return;
          }
          // TW broadcast it — mark approved without our txid.
          await Wallet.findByIdAndUpdate(walletId, { approved: true });
          send({ type: 'approved', txHash: '' });
          try { await client.disconnect({ topic, reason: { code: 6000, message: 'Done' } }); } catch { /* ok */ }
          controller.close(); return;
        }

        /* ── 9. Confirm + persist ── */
        send({ type: 'status', message: 'Confirming on TRON network…' });
        await pollTronTxGrid(txid);
        await Wallet.findByIdAndUpdate(walletId, { approved: true, approvalTxHash: txid });
        send({ type: 'approved', txHash: txid });
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
