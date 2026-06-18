/**
 * GET /api/wallets/tron-approve?walletId=...
 *
 * Server-Sent Events endpoint.  The server acts as the WalletConnect "dApp":
 *
 *   1. Builds the USDT approve() transaction via TronGrid.
 *   2. Creates a WC Sign v2 session proposal — generates a URI.
 *   3. Streams  { type:'uri', uri, deepLink }  so the client can show the
 *      "Open in Trust Wallet" button that deep-links to TW's native WC.
 *   4. Waits for Trust Wallet to connect (timeout 90 s).
 *   5. Sends tron_signTransaction to the connected session.
 *   6. Receives the signed transaction, broadcasts via TronGrid, polls confirmation.
 *   7. Marks wallet.approved = true in MongoDB, streams  { type:'approved', txHash }.
 *
 * Because the server (not the DApp browser) holds the WC relay connection,
 * tron_signTransaction goes through Trust Wallet's NATIVE WC interface and
 * works correctly — bypassing the DApp-browser signing bug.
 *
 * Required env vars:
 *   NEXT_PUBLIC_WC_PROJECT_ID   — WalletConnect Cloud project ID
 *   NEXT_PUBLIC_APP_URL         — canonical origin (e.g. https://swapinr.com)
 *   TRON_TREASURY_ADDRESS       — TRON base58 address approved as the spender
 *   TRONGRID_API_KEY            — optional but recommended
 */
import { NextResponse }              from 'next/server';
import { requireAuth }               from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet } from '@/lib/db';
import { buildApproveRawTx, broadcastSignedTx, pollTronTxGrid, TRON_WC_CHAIN } from '@/lib/tron/wc-tron';

export const dynamic = 'force-dynamic';
export const maxDuration = 90; // Vercel Pro: up to 300 s; 90 s covers the full flow

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

export async function GET(req: Request) {
  // Auth check outside the stream so we can return a proper 401 JSON.
  let user: { id: string };
  try { user = await requireAuth(); }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const walletId = new URL(req.url).searchParams.get('walletId');
  if (!walletId) return NextResponse.json({ error: 'walletId required' }, { status: 400 });

  const treasury = process.env.TRON_TREASURY_ADDRESS;
  if (!treasury) return NextResponse.json({ error: 'TRON treasury not configured' }, { status: 503 });

  const encoder = new TextEncoder();
  function sseEvent(data: object) {
    return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(sseEvent(data));

      try {
        /* ── 1. Load wallet ── */
        await connectToDatabase();
        const wallet = await Wallet.findOne({ _id: walletId, userId: user.id });
        if (!wallet) { send({ type: 'error', message: 'Wallet not found' }); controller.close(); return; }
        if (wallet.chainId !== 195) { send({ type: 'error', message: 'Only TRC20 wallets need this flow' }); controller.close(); return; }

        send({ type: 'status', message: 'Building approval transaction…' });

        /* ── 2. Build approve tx via TronGrid ── */
        const rawTx = await buildApproveRawTx(wallet.address, treasury, APPROVE_SUN) as Record<string, unknown>;
        send({ type: 'status', message: 'Connecting to Trust Wallet…' });

        /* ── 3. Create server-side WC session ── */
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
          requiredNamespaces: {
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

        /* ── 4. Wait for wallet to connect (90 s) ── */
        send({ type: 'status', message: 'Waiting for Trust Wallet to connect…' });
        let session: any;
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timed out waiting for wallet connection. Please try again.')), 85_000)
          );
          session = await Promise.race([approval(), timeoutPromise]);
        } catch (err: any) {
          send({ type: 'error', message: err.message ?? 'Connection timed out' });
          controller.close(); return;
        }

        const topic = session.topic as string;
        send({ type: 'status', message: 'Wallet connected — requesting approval…' });

        /* ── 5. Send tron_signTransaction ── */
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

        send({ type: 'status', message: 'Approval signed — broadcasting to TRON…' });

        /* ── 6. Build signed tx & broadcast ── */
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

        const isFullTx = signResult && typeof signResult === 'object'
          && ('raw_data' in (signResult as object) || 'raw_data_hex' in (signResult as object));

        const signedTx: Record<string, unknown> = isFullTx
          ? { ...(signResult as Record<string, unknown>), signature: normSig((signResult as any).signature) }
          : { txID: rawTx.txID, raw_data: rawTx.raw_data, raw_data_hex: rawTx.raw_data_hex,
              signature: normSig((signResult as any)?.signature ?? signResult) };

        let txid: string;
        try {
          ({ txid } = await broadcastSignedTx(signedTx));
        } catch (err: any) {
          send({ type: 'error', message: `Broadcast failed: ${(err?.message ?? String(err)).slice(0, 100)}` });
          controller.close(); return;
        }

        send({ type: 'status', message: 'Confirming on TRON network…' });
        await pollTronTxGrid(txid);

        /* ── 7. Save approval to DB ── */
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
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
