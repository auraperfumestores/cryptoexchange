import { createPublicClient, fallback, http, formatUnits } from 'viem';
import { mainnet, bsc } from 'viem/chains';

const USDT_ABI = [{
  name: 'balanceOf', type: 'function' as const, stateMutability: 'view' as const,
  inputs:  [{ name: 'account', type: 'address' }],
  outputs: [{ name: '',        type: 'uint256' }],
}] as const;

const ETH_RPCS = [
  process.env.NEXT_PUBLIC_ETHEREUM_RPC,
  'https://eth.llamarpc.com',
  'https://ethereum.publicnode.com',
  'https://eth.drpc.org',
  'https://rpc.ankr.com/eth',
].filter(Boolean) as string[];

const BSC_RPCS = [
  process.env.NEXT_PUBLIC_BSC_RPC,
  'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc.drpc.org',
].filter(Boolean) as string[];

const EVM_CFG = {
  1:  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`, decimals: 6,  chain: mainnet, rpcs: ETH_RPCS },
  56: { address: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`, decimals: 18, chain: bsc,     rpcs: BSC_RPCS },
} as const;

const TRON_USDT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

/**
 * Fetch live USDT balance for a wallet on EVM (chainId 1=ETH, 56=BSC) or TRON (chainId 195).
 * Returns null if the chain is unsupported or the RPC fails.
 */
export async function fetchUsdtBalance(chainId: number, address: string): Promise<number | null> {
  if (chainId === 195) {
    const headers: Record<string, string> = {};
    if (process.env.TRONGRID_API_KEY) headers['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY;

    const res  = await fetch(`https://api.trongrid.io/v1/accounts/${address}`, { headers });
    const json = await res.json();
    const trc20: Record<string, string>[] = json?.data?.[0]?.trc20 ?? [];
    const entry = trc20.find(t => t[TRON_USDT] !== undefined);
    const raw   = entry ? BigInt(entry[TRON_USDT] || '0') : 0n;
    return Number(raw) / 1e6;
  }

  const cfg = EVM_CFG[chainId as 1 | 56];
  if (!cfg) return null;

  const transport = fallback(cfg.rpcs.map(rpc => http(rpc, { timeout: 8_000 })));
  const client    = createPublicClient({ chain: cfg.chain, transport });
  const raw       = await client.readContract({
    address: cfg.address, abi: USDT_ABI, functionName: 'balanceOf',
    args:    [address as `0x${string}`],
  });
  return parseFloat(formatUnits(raw as bigint, cfg.decimals));
}
