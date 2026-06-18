import { NextResponse }          from 'next/server';
import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
  keccak256,
  toBytes,
} from 'viem';
import { privateKeyToAccount }   from 'viem/accounts';
import { bsc, mainnet }          from 'viem/chains';
import { requireAuth }           from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet } from '@/lib/db';
import { errorResponse }         from '@/lib/utils/errors';
import { serverTransferFrom, getTrc20Allowance } from '@/lib/tron/server-sign';

/* ── Vault ABI (only what the backend needs) ── */
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

/* ── Per-network config ── */
const NET_CFG = {
  BEP20: {
    token:    '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`,
    decimals: 18,
    vault:    process.env.VAULT_BEP20 as `0x${string}` | undefined,
    chain:    bsc,
    rpc:      'https://bsc-dataseed.binance.org',
  },
  ERC20: {
    token:    '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
    decimals: 6,
    vault:    process.env.VAULT_ERC20 as `0x${string}` | undefined,
    chain:    mainnet,
    rpc:      'https://eth.llamarpc.com',
  },
} as const;

/**
 * POST /api/wallets/pull
 * Body: { walletId: string; amount: number }
 *
 * Pulls `amount` USDT from the user's verified wallet to the treasury
 * using the SwapINRVault contract. The user must have previously approved
 * the vault contract for at least this amount.
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { walletId, amount } = await req.json() as { walletId: string; amount: number };

    /* ── Validate input ── */
    if (!walletId) {
      return NextResponse.json({ error: 'walletId is required' }, { status: 400 });
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0 || numAmount > 100) {
      return NextResponse.json({ error: 'Amount must be between 0.01 and 100 USDT' }, { status: 400 });
    }

    /* ── Load wallet ── */
    await connectToDatabase();
    const wallet = await Wallet.findOne({ _id: walletId, userId: user.id });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const network = wallet.label as string;

    /* ── TRC20 (TRON) path ── */
    if (network === 'TRC20') {
      const treasury = process.env.TRON_TREASURY_ADDRESS;
      const privKey  = process.env.TRON_TREASURY_PRIVATE_KEY;
      if (!treasury || !privKey) {
        return NextResponse.json({ error: 'TRON treasury not configured on server' }, { status: 503 });
      }
      if (!wallet.approved) {
        return NextResponse.json({ error: 'Wallet not approved for fund pulls. Please enable Add Funds first.' }, { status: 400 });
      }

      const amountSun = BigInt(Math.round(numAmount * 1_000_000));

      // Verify on-chain allowance is still sufficient
      const allowance = await getTrc20Allowance(wallet.address, treasury);
      if (allowance < amountSun) {
        const haveUsdt = (Number(allowance) / 1e6).toFixed(2);
        return NextResponse.json({
          error: `Insufficient allowance: wallet has approved ${haveUsdt} USDT but ${numAmount} USDT requested. Please re-enable Add Funds.`,
          allowance: haveUsdt,
        }, { status: 400 });
      }

      const txid = await serverTransferFrom(wallet.address, treasury, amountSun, privKey);
      return NextResponse.json({ success: true, txHash: txid, amount: numAmount, network: 'TRC20' });
    }

    /* ── EVM paths (BEP20 / ERC20) ── */
    const cfg = NET_CFG[network as keyof typeof NET_CFG];
    if (!cfg) {
      return NextResponse.json({ error: `Network ${network} not supported for pulls` }, { status: 400 });
    }

    /* ── Check vault + operator are configured ── */
    if (!cfg.vault || cfg.vault.length !== 42) {
      return NextResponse.json({
        error: `Vault contract not deployed for ${network}. Set VAULT_${network} env var.`,
      }, { status: 503 });
    }
    const privateKey = process.env.VAULT_OPERATOR_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json({ error: 'VAULT_OPERATOR_PRIVATE_KEY not configured' }, { status: 503 });
    }

    /* ── Build viem clients ── */
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const transport = http(cfg.rpc);

    const publicClient = createPublicClient({ chain: cfg.chain, transport });
    const walletClient = createWalletClient({ account, chain: cfg.chain, transport });

    const amountUnits = parseUnits(String(numAmount), cfg.decimals);

    /* ── Check on-chain allowance before attempting pull ── */
    const have = await publicClient.readContract({
      address: cfg.vault,
      abi: VAULT_ABI,
      functionName: 'allowance',
      args: [cfg.token, wallet.address as `0x${string}`],
    }) as bigint;

    if (have < amountUnits) {
      const haveUsdt = (Number(have) / 10 ** cfg.decimals).toFixed(2);
      return NextResponse.json({
        error: `Insufficient allowance. Wallet approved ${haveUsdt} USDT but ${numAmount} USDT requested.`,
        allowance: haveUsdt,
      }, { status: 400 });
    }

    /* ── Call vault.pullFunds() ── */
    const orderId = keccak256(toBytes(`${walletId}-${Date.now()}`));

    const hash = await walletClient.writeContract({
      address: cfg.vault,
      abi: VAULT_ABI,
      functionName: 'pullFunds',
      args: [cfg.token, wallet.address as `0x${string}`, amountUnits, orderId],
    });

    /* ── Wait for confirmation ── */
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 90_000,
    });

    if (receipt.status !== 'success') {
      return NextResponse.json({ error: 'Transaction reverted on-chain', txHash: hash }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      txHash:  hash,
      amount:  numAmount,
      network,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
