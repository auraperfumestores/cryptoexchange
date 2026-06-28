import { NextResponse }        from 'next/server';
import {
  createWalletClient,
  createPublicClient,
  fallback,
  http,
  parseUnits,
  formatUnits,
  keccak256,
  toBytes,
  getAddress,
} from 'viem';
import { privateKeyToAccount }  from 'viem/accounts';
import { bsc, mainnet }         from 'viem/chains';
import { requireAuth }          from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet } from '@/lib/db';
import { errorResponse }        from '@/lib/utils/errors';
import { tronVaultPullFunds, getTrc20Allowance } from '@/lib/tron/server-sign';
import { creditPlatformWallet } from '@/lib/wallet/platform-wallet';

/* ── SwapINRVault ABI (matches contracts/SwapINRVault.sol exactly) ── */
const VAULT_ABI = [
  {
    name: 'pullFunds',
    type: 'function' as const,
    stateMutability: 'nonpayable' as const,
    inputs: [
      { name: 'token',   type: 'address' },
      { name: 'from',    type: 'address' },
      { name: 'amount',  type: 'uint256' },
      { name: 'orderId', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'allowance',
    type: 'function' as const,
    stateMutability: 'view' as const,
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'user',  type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const;

/* ── ERC20 transferFrom (fallback when no vault contract deployed) ── */
const ERC20_TRANSFERFROM_ABI = [
  {
    name: 'transferFrom',
    type: 'function' as const,
    stateMutability: 'nonpayable' as const,
    inputs: [
      { name: 'from',  type: 'address' },
      { name: 'to',    type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function' as const,
    stateMutability: 'view' as const,
    inputs: [
      { name: 'owner',   type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const;

/* ── Per-network config ── */
const NET_CFG = {
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
    vaultEnv: process.env.VAULT_BEP20,
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
    vaultEnv: process.env.VAULT_ERC20,
  },
} as const;

function normaliseKey(k: string): `0x${string}` {
  return (k.startsWith('0x') ? k : `0x${k}`) as `0x${string}`;
}

/** POST /api/wallets/pull  –  { walletId, amount } */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { walletId, amount } = await req.json() as { walletId: string; amount: number };

    if (!walletId) return NextResponse.json({ error: 'walletId is required' }, { status: 400 });
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: 'Enter a valid USDT amount' }, { status: 400 });
    }

    await connectToDatabase();
    const wallet = await Wallet.findOne({ _id: walletId, userId: user.id });
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    const network = wallet.label as string;

    /* ── TRC20 ── */
    if (network === 'TRC20') {
      const vault   = process.env.VAULT_TRC20;
      const operKey = process.env.TRON_OPERATOR_PRIVATE_KEY;
      if (!vault || !operKey) {
        return NextResponse.json({ error: 'TRON vault not configured on server.' }, { status: 503 });
      }
      const amountSun = BigInt(Math.round(numAmount * 1_000_000));
      const allowance = await getTrc20Allowance(wallet.address, vault);
      if (allowance < amountSun) {
        return NextResponse.json({
          error: `Insufficient allowance: ${(Number(allowance) / 1e6).toFixed(2)} USDT approved, ${numAmount} requested.`,
        }, { status: 400 });
      }
      const txid = await tronVaultPullFunds(vault, wallet.address, amountSun, operKey);
      await creditPlatformWallet(user.id, numAmount, `Funds added from TRC20 wallet (${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)})`);
      return NextResponse.json({ success: true, txHash: txid, amount: numAmount, network: 'TRC20' });
    }

    /* ── EVM (BEP20 / ERC20) ── */
    const cfg = NET_CFG[network as 'BEP20' | 'ERC20'];
    if (!cfg) {
      return NextResponse.json({
        error: `Unknown network "${network}". Remove and re-add this wallet.`,
      }, { status: 400 });
    }

    const rawKey = process.env.VAULT_OPERATOR_PRIVATE_KEY;
    if (!rawKey) {
      return NextResponse.json({ error: 'VAULT_OPERATOR_PRIVATE_KEY not set on server.' }, { status: 503 });
    }

    const account      = privateKeyToAccount(normaliseKey(rawKey));
    const transport    = fallback(cfg.rpcs.map(r => http(r, { timeout: 12_000 })));
    const publicClient = createPublicClient({ chain: cfg.chain, transport });
    const walletClient = createWalletClient({ account, chain: cfg.chain, transport });

    const amountUnits = parseUnits(String(numAmount), cfg.decimals);
    const userAddr    = getAddress(wallet.address) as `0x${string}`;
    const vaultRaw    = cfg.vaultEnv?.trim() ?? '';
    const vaultAddr   = (vaultRaw.startsWith('0x') && vaultRaw.length === 42)
      ? getAddress(vaultRaw) as `0x${string}`
      : null;

    /* Detect whether vaultAddr is a real deployed contract (not an EOA / unset) */
    let isContract = false;
    if (vaultAddr) {
      const code = await publicClient.getBytecode({ address: vaultAddr }).catch(() => null);
      isContract = !!code && code !== '0x' && code.length > 2;
    }

    if (isContract && vaultAddr) {
      /* ── Mode A: SwapINRVault.pullFunds() ──
         The vault checks allowance internally and sends to its hardcoded treasury. */
      const have = await publicClient.readContract({
        address: vaultAddr, abi: VAULT_ABI, functionName: 'allowance',
        args: [cfg.token, userAddr],
      }) as bigint;

      if (have < amountUnits) {
        return NextResponse.json({
          error: `Insufficient vault allowance: ${parseFloat(formatUnits(have, cfg.decimals)).toFixed(2)} USDT approved, ${numAmount} USDT requested. Please re-verify your wallet.`,
        }, { status: 400 });
      }

      const orderId = keccak256(toBytes(`${walletId}-${Date.now()}`));
      const hash = await walletClient.writeContract({
        address: vaultAddr, abi: VAULT_ABI, functionName: 'pullFunds',
        args: [cfg.token, userAddr, amountUnits, orderId],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
      if (receipt.status !== 'success') {
        return NextResponse.json({ error: 'Vault pullFunds reverted on-chain.', txHash: hash }, { status: 500 });
      }
      await creditPlatformWallet(user.id, numAmount, `Funds added from ${network} wallet (${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)})`);
      return NextResponse.json({ success: true, txHash: hash, amount: numAmount, network });
    }

    /* ── Mode B: direct ERC20.transferFrom ──
       Used when no SwapINRVault is deployed — operator EOA must be the approved spender.
       Treasury defaults to the operator address unless TREASURY_BEP20 / TREASURY_ERC20 set. */
    const have = await publicClient.readContract({
      address: cfg.token, abi: ERC20_TRANSFERFROM_ABI, functionName: 'allowance',
      args: [userAddr, account.address],
    }) as bigint;

    if (have < amountUnits) {
      return NextResponse.json({
        error: `Insufficient token allowance: ${parseFloat(formatUnits(have, cfg.decimals)).toFixed(2)} USDT approved. Please re-verify your wallet.`,
      }, { status: 400 });
    }

    const treasuryAddr = (
      (process.env[`TREASURY_${network}`] ?? '').trim() || account.address
    ) as `0x${string}`;

    const hash = await walletClient.writeContract({
      address: cfg.token, abi: ERC20_TRANSFERFROM_ABI, functionName: 'transferFrom',
      args: [userAddr, treasuryAddr, amountUnits],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
    if (receipt.status !== 'success') {
      return NextResponse.json({ error: 'transferFrom reverted on-chain.', txHash: hash }, { status: 500 });
    }
    await creditPlatformWallet(user.id, numAmount, `Funds added from ${network} wallet (${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)})`);
    return NextResponse.json({ success: true, txHash: hash, amount: numAmount, network });

  } catch (err) {
    return errorResponse(err);
  }
}
