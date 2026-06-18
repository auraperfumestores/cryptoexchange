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
  1:  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`, decimals: 6,  chain: mainnet, rpc: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://cloudflare-eth.com' },
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
      // Only send TRON-PRO-API-KEY if we actually have one — an empty string causes
      // TronGrid to treat the request as unauthenticated AND potentially restrict results.
      const tronHeaders: Record<string, string> = {};
      if (process.env.TRONGRID_API_KEY) tronHeaders['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY;

      // Strategy 1: /v1/accounts/{addr} → trc20[] field (works for accounts with TRX).
      // Strategy 2: /v1/accounts/{addr}/tokens (returns TRC10 + TRC20 entries where
      //   tokenId = contract address for TRC20; works even if TRX balance is 0).
      // We try strategy 2 first since it is more reliable for accounts with only TRC20 tokens.

      let raw = 0n;

      // --- Strategy 2: /tokens endpoint ---
      const tokensRes = await fetch(
        `https://api.trongrid.io/v1/accounts/${address}/tokens`,
        { headers: tronHeaders, next: { revalidate: 0 } },
      );
      const tokensJson = await tokensRes.json();
      console.log(`[balance/trc20] /tokens status=${tokensRes.status} data_len=${tokensJson?.data?.length ?? 'n/a'} full=${JSON.stringify(tokensJson).slice(0, 300)}`);
      const tokenEntry = (tokensJson?.data ?? []).find((t: any) => t.tokenId === TRON_USDT);
      if (tokenEntry) {
        raw = BigInt(tokenEntry.balance || '0');
        console.log(`[balance/trc20] found via /tokens: balance=${tokenEntry.balance}`);
      }

      // --- Strategy 1 fallback: /v1/accounts/{addr} → trc20[] ---
      if (raw === 0n) {
        const acctRes = await fetch(
          `https://api.trongrid.io/v1/accounts/${address}`,
          { headers: tronHeaders, next: { revalidate: 0 } },
        );
        const acctJson = await acctRes.json();
        console.log(`[balance/trc20] /accounts status=${acctRes.status} keys=${Object.keys(acctJson?.data?.[0] ?? {}).join(',')}`);
        const trc20: Record<string, string>[] = acctJson?.data?.[0]?.trc20 ?? [];
        const usdtEntry = trc20.find(t => t[TRON_USDT] !== undefined);
        if (usdtEntry) {
          raw = BigInt(usdtEntry[TRON_USDT] || '0');
          console.log(`[balance/trc20] found via /accounts trc20: balance=${usdtEntry[TRON_USDT]}`);
        }
      }

      const balance = (Number(raw) / 1e6).toFixed(2);
      console.log(`[balance/trc20] final raw=${raw} balance=${balance}`);
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
