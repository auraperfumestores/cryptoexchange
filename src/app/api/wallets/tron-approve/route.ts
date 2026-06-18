/**
 * GET /api/wallets/tron-approve?walletId=...
 *
 * Server-Sent Events endpoint.  The server acts as the WalletConnect "dApp":
 *
 *   1. Creates a WC Sign v2 session proposal — generates a URI.
 *   2. Streams  { type:'uri', uri, deepLink }  so the client can show the
 *      "Open in Trust Wallet" deep link.
 *   3. Waits for Trust Wallet to connect (timeout 90 s).
 *   4. Verifies the connected TRON address matches the stored wallet address.
 *   5. Builds the USDT approve() tx FRESH using the confirmed session address
 *      (avoids expiry + guarantees signing address == tx owner address).
 *   6. Sends tron_signTransaction; normalises + broadcasts; retries on SIGERROR.
 *   7. Marks wallet.approved = true in MongoDB, streams  { type:'approved', txHash }.
 *
 * Required env vars:
 *   NEXT_PUBLIC_WC_PROJECT_ID   — WalletConnect Cloud project ID
 *   NEXT_PUBLIC_APP_URL         — canonical origin (e.g. https://swapinr.com)
 *   VAULT_TRC20                 — SwapINRVault contract address on TRON (spender)
 *   TRONGRID_API_KEY            — optional but recommended
 */
import { NextResponse }              from 'next/server';
import { requireAuth }               from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet } from '@/lib/db';
import {
  buildApproveRawTx, broadcastSignedTx, pollTronTxGrid,
  TRON_WC_CHAIN, tronToEvmHex,
} from '@/lib/tron/wc-tron';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

const APPROVE_SUN = 100_000_000n; // 100 USDT

function makeMemStorage() {
  const s = new Map<string, unknown>();
  return {
    getKeys:    async () => Array.from(s.keys()),
    getEntries: async () => Array.from(s.entries()) as [string, unknown][],
    getItem:    async (key: string) => s.get(key),
    setItem:    async (key: string, v: unknown) => { s.set(key, v); },
    removeItem: async (key: string) => { s.delete(key); },
  };
}

/** Extract TRON base58 address from WC session (strips chain prefix). */
function sessionTronAddr(session: any): string {
  const accounts: string[] = session?.namespaces?.tron?.accounts ?? [];
  return accounts[0]?.split(':').at(-1) ?? '';
}

/** Normalise: convert base58 → 20-byte lowercase hex for comparison. */
function addrKey(base58: string): string {
  try { return tronToEvmHex(base58).toLowerCase(); } catch { return base58.toLowerCase(); }
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

        /* ── 2. Create WC session (URI first — rawTx is built after connect) ── */
        const { SignClient } = await import('@walletconnect/sign-client');
        const client = await SignClient.init({
          projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '',
          metadata: {
            name:        'SwapINR',
            description: 'USDT ↔ INR Exchange',
            url:         process.env.NEXT_PUBLIC_APP_URL ?? '',
            icons:       [`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/logo.png`],
          },
          storage: makeMemStorage() as any,
        });

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
            new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Timed out waiting for wallet connection. Please try again.')), 85_000)),
          ]);
        } catch (err: any) {
          send({ type: 'error', message: err.message ?? 'Connection timed out' });
          controller.close(); return;
        }

        const topic = session.topic as string;

        /* ── 4. Verify connected address matches registered wallet ── */
        const sessionAddr = sessionTronAddr(session);
        if (!sessionAddr) {
          send({ type: 'error', message: 'No TRON address found in wallet session.' });
          controller.close(); return;
        }
        if (addrKey(sessionAddr) !== addrKey(wallet.address)) {
          send({
            type: 'error',
            message: `Wrong wallet connected. Please open Trust Wallet and switch to address ${wallet.address.slice(0, 8)}…${wallet.address.slice(-6)}, then try again.`,
          });
          try { await client.disconnect({ topic, reason: { code: 6000, message: 'wrong address' } }); } catch { /* ok */ }
          controller.close(); return;
        }

        send({ type: 'status', message: 'Wallet connected — building approval transaction…' });

        /* ── 5. Build rawTx FRESH with the confirmed session address ── */
        // Building after connect means: no expiry window, and owner_address === signing key.
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

        /* ── 7. Assemble signed tx ── */
        const isFullTx = signResult && typeof signResult === 'object'
          && ('raw_data' in (signResult as object) || 'raw_data_hex' in (signResult as object));

        const signedTx: Record<string, unknown> = isFullTx
          ? {
              ...(signResult as Record<string, unknown>),
              raw_data_hex: (signResult as any).raw_data_hex ?? rawTx.raw_data_hex,
              signature: normSig((signResult as any).signature),
            }
          : {
              txID:        rawTx.txID,
              raw_data:    rawTx.raw_data,
              raw_data_hex: rawTx.raw_data_hex,
              signature:   normSig((signResult as any)?.signature ?? signResult),
            };

        const sig0 = Array.isArray(signedTx.signature) ? String(signedTx.signature[0]) : '';
        console.log('[tron-approve] isFullTx:', isFullTx, 'v byte:', sig0 ? parseInt(sig0.slice(-2), 16) : 'n/a', 'txID:', String(signedTx.txID).slice(0, 16));

        send({ type: 'status', message: 'Broadcasting to TRON network…' });

        /* ── 8. Broadcast (retry with flipped v on SIGERROR) ── */
        let txid: string;
        try {
          ({ txid } = await broadcastSignedTx(signedTx));
        } catch (broadcastErr: any) {
          const errMsg = String(broadcastErr?.message ?? broadcastErr);
          if (errMsg.toUpperCase().includes('SIGERROR') && sig0) {
            const v    = parseInt(sig0.slice(-2), 16);
            const altV = v === 0 ? 1 : v === 1 ? 0 : v === 27 ? 28 : v === 28 ? 27 : -1;
            if (altV >= 0) {
              console.log('[tron-approve] SIGERROR — retrying v:', v, '→', altV);
              try {
                ({ txid } = await broadcastSignedTx({
                  ...signedTx,
                  signature: [sig0.slice(0, -2) + altV.toString(16).padStart(2, '0')],
                }));
              } catch (retryErr: any) {
                send({ type: 'error', message: `Broadcast failed: ${(retryErr?.message ?? String(retryErr)).slice(0, 120)}` });
                controller.close(); return;
              }
            } else {
              send({ type: 'error', message: `Broadcast failed (SIGERROR v=${v}): contact support` });
              controller.close(); return;
            }
          } else {
            send({ type: 'error', message: `Broadcast failed: ${errMsg.slice(0, 120)}` });
            controller.close(); return;
          }
        }

        send({ type: 'status', message: 'Confirming on TRON network…' });
        await pollTronTxGrid(txid);

        /* ── 9. Persist approval ── */
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
