import { NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, bsc } from 'viem/chains';
import { requireAuth } from '@/lib/auth/require-auth';

export const dynamic = 'force-dynamic';

const USDT_ABI = [{
  name: 'balanceOf', type: 'function' as const, stateMutability: 'view' as const,
  inputs:  [{ name: 'account', type: 'address' }],
  outputs: [{ name: '',        type: 'uint256' }],
}] as const;

const EVM_CFG = {
  1:  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`, decimals: 6,  chain: mainnet, rpc: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com' },
  56: { address: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`, decimals: 18, chain: bsc,     rpc: process.env.NEXT_PUBLIC_BSC_RPC     || 'https://bsc-dataseed.binance.org' },
} as const;

const TRON_USDT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

/** GET /api/wallets/balance?chainId=1|56|195&address=... */
export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const chainId = Number(searchParams.get('chainId') || '0');
    const address = (searchParams.get('address') || '').trim();

    if (!address || !chainId) {
      return NextResponse.json({ error: 'chainId and address required' }, { status: 400 });
    }

    if (chainId === 195) {
      const tronHeaders: Record<string, string> = {};
      if (process.env.TRONGRID_API_KEY) tronHeaders['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY;

      const acctRes = await fetch(
        `https://api.trongrid.io/v1/accounts/${address}`,
        { headers: tronHeaders, next: { revalidate: 0 } },
      );
      const acctJson = await acctRes.json();
      const trc20: Record<string, string>[] = acctJson?.data?.[0]?.trc20 ?? [];
      const usdtEntry = trc20.find(t => t[TRON_USDT] !== undefined);
      const raw = usdtEntry ? BigInt(usdtEntry[TRON_USDT] || '0') : 0n;
      const balance = (Number(raw) / 1e6).toFixed(2);
      return NextResponse.json({ balance });
    }

    const cfg = EVM_CFG[chainId as 1 | 56];
    if (!cfg) return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });

    const client = createPublicClient({ chain: cfg.chain, transport: http(cfg.rpc) });
    const raw    = await client.readContract({
      address: cfg.address, abi: USDT_ABI, functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });
    const balance = parseFloat(formatUnits(raw as bigint, cfg.decimals)).toFixed(2);
    return NextResponse.json({ balance });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 });
  }
}
