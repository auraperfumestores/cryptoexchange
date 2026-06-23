import { NextResponse }                              from 'next/server';
import { createPublicClient, fallback, http, parseAbi, getAddress, formatUnits } from 'viem';
import { bsc, mainnet }                              from 'viem/chains';
import { requireAuth }                               from '@/lib/auth/require-auth';
import { connectToDatabase, User, ProPayment, getProSettings } from '@/lib/db';
import { errorResponse }                             from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

const EVM_CFG = {
  BEP20: {
    token: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`,
    decimals: 18, chain: bsc,
    rpcs: [process.env.NEXT_PUBLIC_BSC_RPC, 'https://bsc-dataseed.binance.org', 'https://bsc.drpc.org'].filter(Boolean) as string[],
  },
  ERC20: {
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
    decimals: 6, chain: mainnet,
    rpcs: [process.env.NEXT_PUBLIC_ETHEREUM_RPC, 'https://eth.llamarpc.com', 'https://eth.drpc.org'].filter(Boolean) as string[],
  },
};

const TRANSFER_ABI = parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)']);
const TRON_USDT     = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const AMOUNT_EPSILON = 0.0008; // tight match against the decorated unique amount

/** Scans incoming USDT transfers to the shared treasury address and matches the
 *  exact decorated amount — sender address is not known/required in advance. */
async function checkEvmPayment(
  net: 'BEP20' | 'ERC20',
  toAddress: string,
  exactUsdt: number,
): Promise<{ found: boolean; txHash?: string; fromAddress?: string }> {
  const cfg = EVM_CFG[net];
  const transport = fallback(cfg.rpcs.map(r => http(r, { timeout: 12_000 })));
  const client = createPublicClient({ chain: cfg.chain, transport });

  const latestBlock = await client.getBlockNumber();
  const blocksPerHour = net === 'BEP20' ? 1200n : 300n;
  const fromBlock = latestBlock > blocksPerHour ? latestBlock - blocksPerHour : 0n;

  const logs = await client.getLogs({
    address: cfg.token,
    event: TRANSFER_ABI[0],
    args: { to: getAddress(toAddress) as `0x${string}` },
    fromBlock,
    toBlock: 'latest',
  });

  for (const log of logs) {
    const amount = parseFloat(formatUnits((log.args as any).value ?? 0n, cfg.decimals));
    if (Math.abs(amount - exactUsdt) <= AMOUNT_EPSILON) {
      return { found: true, txHash: log.transactionHash ?? undefined, fromAddress: (log.args as any).from };
    }
  }
  return { found: false };
}

async function checkTrc20Payment(
  toAddress: string,
  exactUsdt: number,
  sinceTimestamp: number,
): Promise<{ found: boolean; txHash?: string; fromAddress?: string }> {
  const headers: Record<string, string> = {};
  if (process.env.TRONGRID_API_KEY) headers['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY;

  const url = `https://api.trongrid.io/v1/accounts/${toAddress}/transactions/trc20` +
    `?contract_address=${TRON_USDT}&limit=50&only_to=true&min_timestamp=${sinceTimestamp}`;
  const res  = await fetch(url, { headers });
  const json = await res.json();
  const txs: any[] = json?.data ?? [];

  for (const tx of txs) {
    if (tx.to !== toAddress) continue;
    const amount = Number(tx.value ?? 0) / 1e6;
    if (Math.abs(amount - exactUsdt) <= AMOUNT_EPSILON) {
      return { found: true, txHash: tx.transaction_id, fromAddress: tx.from };
    }
  }
  return { found: false };
}

/** GET /api/pro/poll — checks blockchain for payment, activates Pro on success.
 *  If payment is detected but the user's phone isn't verified yet, activation is
 *  held (status: 'awaiting_phone') until they verify — checked again on each poll. */
export async function GET() {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    const payment = await ProPayment.findOne({
      userId: String(auth.id),
      status: { $in: ['pending', 'awaiting_phone'] },
    }).lean();

    if (!payment) {
      const user = await User.findById(auth.id).select('proStatus').lean();
      const ps   = (user as any)?.proStatus ?? {};
      const active = ps.active && ps.expiresAt && new Date(ps.expiresAt) > new Date();
      return NextResponse.json({ status: active ? 'confirmed' : 'none' });
    }

    const pid = (payment as any)._id;

    /* Payment already detected on-chain — just waiting on phone verification */
    if (payment.status === 'awaiting_phone') {
      const user = await User.findById(auth.id).select('phoneVerified').lean();
      if (!(user as any)?.phoneVerified) {
        return NextResponse.json({ status: 'awaiting_phone', txHash: payment.txHash });
      }
      const proSettings = await getProSettings();
      const activatedAt = new Date();
      const expiresAt   = new Date(activatedAt.getTime() + proSettings.durationDays * 24 * 60 * 60 * 1000);
      await Promise.all([
        ProPayment.updateOne({ _id: pid }, { $set: { status: 'confirmed', confirmedAt: activatedAt } }),
        User.updateOne({ _id: auth.id }, { $set: { proStatus: { active: true, activatedAt, expiresAt, paymentId: String(pid) } } }),
      ]);
      return NextResponse.json({ status: 'confirmed', txHash: payment.txHash, expiresAt });
    }

    // Expired
    if (new Date() > payment.expiresAt) {
      await ProPayment.updateOne({ _id: pid }, { $set: { status: 'expired' } });
      return NextResponse.json({ status: 'expired' });
    }

    // Check blockchain
    let result: { found: boolean; txHash?: string; fromAddress?: string } = { found: false };
    try {
      if (payment.network === 'TRC20') {
        result = await checkTrc20Payment(
          payment.depositAddress, payment.amountUsdt,
          (payment as any).createdAt.getTime(),
        );
      } else {
        result = await checkEvmPayment(
          payment.network as 'BEP20' | 'ERC20',
          payment.depositAddress, payment.amountUsdt,
        );
      }
    } catch {
      // RPC error — keep polling
      return NextResponse.json({ status: 'pending', depositAddress: payment.depositAddress, amountUsdt: payment.amountUsdt, expiresAt: payment.expiresAt });
    }

    if (result.found) {
      const user = await User.findById(auth.id).select('phoneVerified').lean();
      const phoneVerified = !!(user as any)?.phoneVerified;

      if (!phoneVerified) {
        await ProPayment.updateOne(
          { _id: pid },
          { $set: { status: 'awaiting_phone', txHash: result.txHash ?? null, fromAddress: result.fromAddress ?? '' } },
        );
        return NextResponse.json({ status: 'awaiting_phone', txHash: result.txHash });
      }

      const proSettings = await getProSettings();
      const activatedAt = new Date();
      const expiresAt   = new Date(activatedAt.getTime() + proSettings.durationDays * 24 * 60 * 60 * 1000);

      await Promise.all([
        ProPayment.updateOne(
          { _id: pid },
          { $set: { status: 'confirmed', txHash: result.txHash ?? null, fromAddress: result.fromAddress ?? '', confirmedAt: activatedAt } },
        ),
        User.updateOne(
          { _id: auth.id },
          { $set: { proStatus: { active: true, activatedAt, expiresAt, paymentId: String(pid) } } },
        ),
      ]);

      return NextResponse.json({ status: 'confirmed', txHash: result.txHash, expiresAt });
    }

    return NextResponse.json({
      status:         'pending',
      depositAddress: payment.depositAddress,
      amountUsdt:     payment.amountUsdt,
      network:        payment.network,
      expiresAt:      payment.expiresAt,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
