/**
 * GET /api/admin/users/[id]/wallet-docs
 *
 * Returns the user's wallet records from the Wallet collection (not
 * derived from transaction history), plus the spender addresses the
 * admin UI needs for on-chain allowance checks.
 */
import { NextResponse }                 from 'next/server';
import { requireAuth }                  from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet, walletToDocument } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const wallets = await Wallet.find({ userId: params.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: wallets.map(walletToDocument),
      /* Spender addresses so the client can call /api/admin/wallet-info
         without knowing server-side env vars (contract/treasury addresses
         are not secret — they are public on-chain). */
      spenders: {
        BEP20: process.env.VAULT_BEP20         ?? null,
        ERC20: process.env.VAULT_ERC20         ?? null,
        TRC20: process.env.VAULT_TRC20            ?? null,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
