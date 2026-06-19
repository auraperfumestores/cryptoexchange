/**
 * GET  /api/wallets/tron-deposit        → { address: string }
 * POST /api/wallets/tron-deposit        → { txHash, amount } | 404
 *
 * GET returns the treasury TRC20 deposit address (VAULT_TRC20).
 *
 * POST polls TronGrid for a confirmed TRC20 USDT transfer
 * FROM wallet.address TO the treasury, with value >= requested amount,
 * that occurred after `since` (ms timestamp, default 30 min ago).
 *
 * Called repeatedly by the frontend every 5 s while the user's deposit
 * confirmation is pending. Returns 404 while not yet found.
 */
import { NextResponse }              from 'next/server';
import { requireAuth }               from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet } from '@/lib/db';

export const dynamic   = 'force-dynamic';
export const maxDuration = 30;

const TRONGRID   = 'https://api.trongrid.io';
const TRON_USDT  = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // Mainnet USDT TRC20

function gridHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  const key = process.env.TRONGRID_API_KEY || process.env.NEXT_PUBLIC_TRONGRID_API_KEY;
  if (key) h['TRON-PRO-API-KEY'] = key;
  return h;
}

/* ── GET: return deposit address ─────────────────────────────── */
export async function GET() {
  const address = process.env.VAULT_TRC20;
  if (!address) {
    return NextResponse.json({ error: 'VAULT_TRC20 not configured' }, { status: 503 });
  }
  return NextResponse.json({ address });
}

/* ── POST: check for incoming transfer ───────────────────────── */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json() as { walletId?: string; amount?: number; since?: number };

    const { walletId, since } = body;
    const amount = Number(body.amount);

    if (!walletId) return NextResponse.json({ error: 'walletId required' }, { status: 400 });
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    await connectToDatabase();
    const wallet = await Wallet.findOne({ _id: walletId, userId: user.id }).lean();
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    const vault = process.env.VAULT_TRC20;
    if (!vault) return NextResponse.json({ error: 'VAULT_TRC20 not configured' }, { status: 503 });

    const amountSun = BigInt(Math.round(amount * 1_000_000));
    const minTs     = since ?? (Date.now() - 30 * 60 * 1000);

    // TronGrid TRC20 transfer history for the treasury address
    const url = `${TRONGRID}/v1/accounts/${vault}/transactions/trc20?` +
      `only_confirmed=true&min_timestamp=${minTs}` +
      `&contract_address=${TRON_USDT}&limit=50`;

    const res  = await fetch(url, { headers: gridHeaders() });
    if (!res.ok) {
      console.error('[tron-deposit] TronGrid error', res.status);
      return NextResponse.json({ found: false }, { status: 404 });
    }

    const json = await res.json() as { data?: unknown[] };
    const txs: any[] = json?.data ?? [];

    // Find transfer FROM user's verified wallet TO vault with sufficient value
    const match = txs.find(tx =>
      typeof tx.from === 'string' &&
      tx.from.toLowerCase() === wallet.address.toLowerCase() &&
      typeof tx.to === 'string' &&
      tx.to.toLowerCase() === vault.toLowerCase() &&
      BigInt(tx.value ?? '0') >= amountSun,
    );

    if (!match) return NextResponse.json({ found: false }, { status: 404 });

    const detectedAmount = Number(BigInt(match.value ?? '0')) / 1_000_000;
    const txHash: string = match.transaction_id ?? '';

    console.log('[tron-deposit] confirmed:', txHash.slice(0, 16), detectedAmount, 'USDT from', wallet.address.slice(0, 10));

    return NextResponse.json({ found: true, txHash, amount: detectedAmount });
  } catch (err: any) {
    console.error('[tron-deposit]', err);
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
