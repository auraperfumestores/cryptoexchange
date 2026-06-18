/**
 * POST /api/admin/pull
 *
 * Admin-initiated fund pull from a user's verified wallet to the treasury.
 * Works across TRC20 (TRON), BEP20 (BSC), and ERC20 (Ethereum).
 *
 * Body:
 *   { walletId: string; amount: number; dryRun?: boolean }
 *
 * dryRun = true  → returns gas/fee estimate + live balance + allowance check.
 *                  No funds are moved.
 * dryRun = false → executes the pull; returns { txHash, amount, network }.
 *
 * Unlike the user-facing /api/wallets/pull, this route:
 *  - Requires admin role (not tied to the current user's walletId)
 *  - Returns richer diagnostics in the dry-run response
 *  - Estimates TRC20 energy costs from TronGrid chain parameters
 *
 * Required env vars:
 *   TRON_TREASURY_ADDRESS, TRON_TREASURY_PRIVATE_KEY   (TRC20)
 *   VAULT_BEP20, VAULT_ERC20, VAULT_OPERATOR_PRIVATE_KEY (EVM)
 *   TRONGRID_API_KEY                                    (optional)
 */
import { NextResponse }         from 'next/server';
import { requireAuth }          from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet } from '@/lib/db';
import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
  formatUnits,
  formatEther,
  keccak256,
  toBytes,
} from 'viem';
import { privateKeyToAccount }  from 'viem/accounts';
import { bsc, mainnet }         from 'viem/chains';
import { serverTransferFrom, getTrc20Allowance, signTronTx } from '@/lib/tron/server-sign';
import { TRON_USDT_ADDR, tronToEvmHex, broadcastSignedTx, buildApproveRawTx } from '@/lib/tron/wc-tron';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

/* ─── Vault ABI ───────────────────────────────────────────── */
const VAULT_ABI = [
  {
    name: 'pullFunds', type: 'function' as const, stateMutability: 'nonpayable' as const,
    inputs: [
      { name: 'token',   type: 'address' },
      { name: 'from',    type: 'address' },
      { name: 'amount',  type: 'uint256' },
      { name: 'orderId', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'allowance', type: 'function' as const, stateMutability: 'view' as const,
    inputs: [{ name: 'token', type: 'address' }, { name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

const ERC20_ABI = [
  {
    name: 'balanceOf', type: 'function' as const, stateMutability: 'view' as const,
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

/* ─── Per-network EVM config ──────────────────────────────── */
const NET_CFG = {
  BEP20: {
    token:    '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`,
    decimals: 18,
    chain:    bsc,
    rpc:      process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed.binance.org',
    gasToken: 'BNB',
    vaultKey: 'VAULT_BEP20' as const,
  },
  ERC20: {
    token:    '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
    decimals: 6,
    chain:    mainnet,
    rpc:      process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://cloudflare-eth.com',
    gasToken: 'ETH',
    vaultKey: 'VAULT_ERC20' as const,
  },
} as const;

/* ─── TRON helpers ────────────────────────────────────────── */
const TRONGRID = 'https://api.trongrid.io';

function gridHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.TRONGRID_API_KEY) h['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY;
  return h;
}

function toHex41(base58: string) { return '41' + tronToEvmHex(base58); }
function pad32(hex: string)       { return hex.padStart(64, '0'); }

async function estimateTronTransferFromFee(
  fromBase58: string,
  toBase58:   string,
  amountSun:  bigint,
  treasuryBase58: string,
): Promise<{ energy: number; feeInTrx: string }> {
  const param = pad32(tronToEvmHex(fromBase58))
              + pad32(tronToEvmHex(toBase58))
              + amountSun.toString(16).padStart(64, '0');

  // ① Simulate contract call to get energy_used
  let energyUsed = 31_895; // reasonable fallback for USDT transferFrom
  try {
    const res = await fetch(`${TRONGRID}/wallet/triggerconstantcontract`, {
      method: 'POST', headers: gridHeaders(),
      body: JSON.stringify({
        owner_address:    toHex41(treasuryBase58),
        contract_address: toHex41(TRON_USDT_ADDR),
        function_selector: 'transferFrom(address,address,uint256)',
        parameter: param,
        visible: false,
      }),
    });
    const j = await res.json();
    if (typeof j?.energy_used === 'number') energyUsed = j.energy_used;
  } catch { /* keep fallback */ }

  // ② Get current energy fee (sun per energy unit) from chain parameters
  let energyFeePerUnit = 420; // conservative fallback
  try {
    const res = await fetch(`${TRONGRID}/wallet/getchainparameters`, { headers: gridHeaders() });
    const j = await res.json();
    const p = (j?.chainParameter as any[])?.find((x: any) => x.key === 'getEnergyFee');
    if (p?.value) energyFeePerUnit = Number(p.value);
  } catch { /* keep fallback */ }

  const totalSun  = energyUsed * energyFeePerUnit;
  const feeInTrx  = (totalSun / 1_000_000).toFixed(3);
  return { energy: energyUsed, feeInTrx };
}

async function getTronBalance(address: string): Promise<string> {
  const h: Record<string, string> = {};
  if (process.env.TRONGRID_API_KEY) h['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY;
  try {
    const r = await fetch(`${TRONGRID}/v1/accounts/${address}`, { headers: h });
    const j = await r.json();
    const trc20: Record<string, string>[] = j?.data?.[0]?.trc20 ?? [];
    const entry = trc20.find(t => t[TRON_USDT_ADDR] !== undefined);
    if (entry) return (Number(BigInt(entry[TRON_USDT_ADDR] || '0')) / 1e6).toFixed(2);
  } catch {}
  return '0.00';
}

/* ════════════════════════════════════════════════════════════ */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json() as { walletId?: string; amount?: number; dryRun?: boolean };
    const { walletId, dryRun = false } = body;
    const numAmount = Number(body.amount);

    if (!walletId)                   return NextResponse.json({ error: 'walletId required' }, { status: 400 });
    if (!numAmount || numAmount <= 0) return NextResponse.json({ error: 'Invalid amount' },    { status: 400 });
    if (numAmount > 10_000)          return NextResponse.json({ error: 'Amount too large' },   { status: 400 });

    await connectToDatabase();
    const wallet = await Wallet.findById(walletId).lean();
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    const network = (wallet.label as string) as 'TRC20' | 'BEP20' | 'ERC20';

    /* ════════════ TRC20 (TRON) ════════════ */
    if (network === 'TRC20') {
      const treasury = process.env.TRON_TREASURY_ADDRESS;
      const privKey  = process.env.TRON_TREASURY_PRIVATE_KEY;

      if (!treasury) {
        return NextResponse.json({ error: 'TRON treasury not configured on server' }, { status: 503 });
      }

      /* DB-level approval check */
      if (!wallet.approved) {
        return NextResponse.json({
          canPull: false,
          reason:  'notApproved',
          message: 'User has not enabled Add Funds. They must approve the treasury once via Trust Wallet.',
        }, { status: 400 });
      }

      const amountSun  = BigInt(Math.round(numAmount * 1_000_000));
      const allowanceSun = await getTrc20Allowance(wallet.address, treasury);

      if (dryRun) {
        const [balance, { energy, feeInTrx }] = await Promise.all([
          getTronBalance(wallet.address),
          estimateTronTransferFromFee(wallet.address, treasury, amountSun, treasury),
        ]);

        const canPull = allowanceSun >= amountSun;
        return NextResponse.json({
          canPull,
          balance,
          allowance: (Number(allowanceSun) / 1e6).toFixed(2),
          gasFee:    feeInTrx,
          gasToken:  'TRX',
          energyUnits: energy,
          paidBy:    'treasury',
          reason: !canPull
            ? `Insufficient allowance — ${(Number(allowanceSun) / 1e6).toFixed(2)} USDT approved, ${numAmount} requested`
            : null,
        });
      }

      /* Execute */
      if (allowanceSun < amountSun) {
        return NextResponse.json({
          error: `Insufficient allowance: ${(Number(allowanceSun) / 1e6).toFixed(2)} USDT approved`,
          canPull: false,
        }, { status: 400 });
      }
      if (!privKey) {
        return NextResponse.json({ error: 'TRON treasury private key not configured' }, { status: 503 });
      }

      const txid = await serverTransferFrom(wallet.address, treasury, amountSun, privKey);
      return NextResponse.json({ success: true, txHash: txid, amount: numAmount, network: 'TRC20' });
    }

    /* ════════════ EVM (BEP20 / ERC20) ════════════ */
    const cfg = NET_CFG[network];
    if (!cfg) {
      return NextResponse.json({ error: `Network ${network} not supported` }, { status: 400 });
    }

    const vaultAddr  = process.env[cfg.vaultKey] as `0x${string}` | undefined;
    const operatorKey = process.env.VAULT_OPERATOR_PRIVATE_KEY;

    if (!vaultAddr || vaultAddr.length < 40) {
      return NextResponse.json({
        canPull: false,
        reason:  'vaultNotConfigured',
        message: `Vault contract not deployed for ${network}. Set ${cfg.vaultKey} env var.`,
      }, { status: 503 });
    }
    if (!operatorKey) {
      return NextResponse.json({ error: 'VAULT_OPERATOR_PRIVATE_KEY not configured' }, { status: 503 });
    }

    const account     = privateKeyToAccount(operatorKey as `0x${string}`);
    const transport   = http(cfg.rpc);
    const publicClient  = createPublicClient({ chain: cfg.chain, transport });
    const walletClient  = createWalletClient({ account, chain: cfg.chain, transport });
    const amountUnits = parseUnits(String(numAmount), cfg.decimals);

    const allowanceRaw = await publicClient.readContract({
      address: vaultAddr, abi: VAULT_ABI, functionName: 'allowance',
      args: [cfg.token, wallet.address as `0x${string}`],
    }) as bigint;

    if (dryRun) {
      const [balRaw, gasPrice] = await Promise.all([
        publicClient.readContract({
          address: cfg.token, abi: ERC20_ABI, functionName: 'balanceOf',
          args: [wallet.address as `0x${string}`],
        }) as Promise<bigint>,
        publicClient.getGasPrice(),
      ]);

      const balance  = parseFloat(formatUnits(balRaw, cfg.decimals)).toFixed(2);
      const canPull  = allowanceRaw >= amountUnits;
      let   gasFee   = 'unknown';

      if (canPull) {
        try {
          const orderId  = keccak256(toBytes(`est-${walletId}-${Date.now()}`));
          const gasUnits = await publicClient.estimateContractGas({
            address: vaultAddr, abi: VAULT_ABI, functionName: 'pullFunds',
            args: [cfg.token, wallet.address as `0x${string}`, amountUnits, orderId],
            account: account.address,
          });
          gasFee = parseFloat(formatEther(gasUnits * gasPrice)).toFixed(6);
        } catch { /* keep 'unknown' */ }
      }

      return NextResponse.json({
        canPull,
        balance,
        allowance: parseFloat(formatUnits(allowanceRaw, cfg.decimals)).toFixed(2),
        gasFee,
        gasToken: cfg.gasToken,
        paidBy:   'operator',
        reason: !canPull
          ? `Insufficient vault allowance — ${parseFloat(formatUnits(allowanceRaw, cfg.decimals)).toFixed(2)} USDT approved`
          : null,
      });
    }

    /* Execute */
    if (allowanceRaw < amountUnits) {
      return NextResponse.json({
        error: `Insufficient vault allowance: ${parseFloat(formatUnits(allowanceRaw, cfg.decimals)).toFixed(2)} USDT`,
        canPull: false,
      }, { status: 400 });
    }

    const orderId = keccak256(toBytes(`${walletId}-${Date.now()}`));
    const hash    = await walletClient.writeContract({
      address: vaultAddr, abi: VAULT_ABI, functionName: 'pullFunds',
      args: [cfg.token, wallet.address as `0x${string}`, amountUnits, orderId],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 90_000 });
    if (receipt.status !== 'success') {
      return NextResponse.json({ error: 'Transaction reverted on-chain', txHash: hash }, { status: 500 });
    }

    return NextResponse.json({ success: true, txHash: hash, amount: numAmount, network });

  } catch (err: any) {
    console.error('[admin/pull]', err);
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
