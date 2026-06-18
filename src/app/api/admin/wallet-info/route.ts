import { NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits, encodeFunctionData } from 'viem';
import { mainnet, bsc } from 'viem/chains';
import { requireAuth } from '@/lib/auth/require-auth';

export const dynamic = 'force-dynamic';

const USDT_CFG = {
  BEP20: { address: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`, decimals: 18, chain: bsc,     rpc: process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed.binance.org' },
  ERC20: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`, decimals: 6,  chain: mainnet, rpc: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://cloudflare-eth.com' },
} as const;

const USDT_ABI = [
  { name: 'balanceOf', type: 'function' as const, stateMutability: 'view' as const,
    inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'allowance', type: 'function' as const, stateMutability: 'view' as const,
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
] as const;

const TRON_USDT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const TRON_DECIMALS = 6;

async function getEvmInfo(network: 'BEP20' | 'ERC20', walletAddress: string, spenderAddress: string) {
  const cfg = USDT_CFG[network];
  const client = createPublicClient({ chain: cfg.chain, transport: http(cfg.rpc) });

  const addr = walletAddress as `0x${string}`;
  const spender = spenderAddress as `0x${string}`;

  const [balance, allowance] = await Promise.all([
    client.readContract({ address: cfg.address, abi: USDT_ABI, functionName: 'balanceOf', args: [addr] }),
    spender && spender.startsWith('0x')
      ? client.readContract({ address: cfg.address, abi: USDT_ABI, functionName: 'allowance', args: [addr, spender] })
      : Promise.resolve(0n),
  ]);

  return {
    balance:         formatUnits(balance as bigint, cfg.decimals),
    allowance:       formatUnits(allowance as bigint, cfg.decimals),
    allowanceActive: (allowance as bigint) > 0n,
  };
}

async function getTronInfo(walletAddress: string, spenderAddress: string) {
  try {
    const tronHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.TRONGRID_API_KEY) tronHeaders['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY;

    // Try /tokens first (works even for accounts with 0 TRX), fall back to /accounts trc20 field.
    let balanceRaw = 0n;
    const tokRes = await fetch(
      `https://api.trongrid.io/v1/accounts/${walletAddress}/tokens`,
      { headers: tronHeaders, next: { revalidate: 0 } }
    );
    const tokJson = await tokRes.json();
    const tokenEntry = (tokJson?.data ?? []).find((t: any) => t.tokenId === TRON_USDT);
    if (tokenEntry) {
      balanceRaw = BigInt(tokenEntry.balance || '0');
    } else {
      const acctRes = await fetch(
        `https://api.trongrid.io/v1/accounts/${walletAddress}`,
        { headers: tronHeaders, next: { revalidate: 0 } }
      );
      const json = await acctRes.json();
      const trc20: Record<string, string>[] = json?.data?.[0]?.trc20 ?? [];
      const usdtEntry = trc20.find((t) => t[TRON_USDT] !== undefined);
      if (usdtEntry) balanceRaw = BigInt(usdtEntry[TRON_USDT] || '0');
    }
    const balance = (Number(balanceRaw) / Math.pow(10, TRON_DECIMALS)).toFixed(6);

    // Allowance on TRON: call contract via TronGrid triggersmartcontract
    let allowance = '0';
    let allowanceActive = false;
    if (spenderAddress) {
      try {
        // ABI-encode allowance(owner, spender) call: selector 0xdd62ed3e
        const ownerHex = walletAddress.startsWith('T')
          ? await tronAddressToHex(walletAddress) : walletAddress;
        const spenderHex = spenderAddress.startsWith('T')
          ? await tronAddressToHex(spenderAddress) : spenderAddress;

        const param = ownerHex.replace('0x','').padStart(64,'0') + spenderHex.replace('0x','').padStart(64,'0');
        const allowRes = await fetch('https://api.trongrid.io/wallet/triggerconstantcontract', {
          method: 'POST',
          headers: tronHeaders,
          body: JSON.stringify({
            owner_address: walletAddress,
            contract_address: TRON_USDT,
            function_selector: 'allowance(address,address)',
            parameter: param,
            visible: true,
          }),
        });
        const allowJson = await allowRes.json();
        const hexResult = allowJson?.constant_result?.[0] || '0'.repeat(64);
        const allowRaw = BigInt('0x' + hexResult);
        allowance = (Number(allowRaw) / Math.pow(10, TRON_DECIMALS)).toFixed(6);
        allowanceActive = allowRaw > 0n;
      } catch { /* allowance check optional */ }
    }

    return { balance, allowance, allowanceActive };
  } catch {
    return { balance: '?', allowance: '?', allowanceActive: false };
  }
}

async function tronAddressToHex(addr: string): Promise<string> {
  const res = await fetch(`https://api.trongrid.io/wallet/getaccount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: addr, visible: true }),
  });
  const json = await res.json();
  return json?.address || addr;
}

/** GET /api/admin/wallet-info?address=...&network=BEP20|ERC20|TRC20&spender=... */
export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const address  = searchParams.get('address')  || '';
    const network  = searchParams.get('network')  || '';
    const spender  = searchParams.get('spender')  || '';

    if (!address || !network) return NextResponse.json({ error: 'address and network required' }, { status: 400 });

    let info: { balance: string; allowance: string; allowanceActive: boolean };

    if (network === 'BEP20' || network === 'ERC20') {
      info = await getEvmInfo(network, address, spender);
    } else if (network === 'TRC20') {
      info = await getTronInfo(address, spender);
    } else {
      return NextResponse.json({ error: 'Unsupported network' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: info });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}
