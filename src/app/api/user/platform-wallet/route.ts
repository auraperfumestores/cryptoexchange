import { NextResponse }            from 'next/server';
import { requireAuth }             from '@/lib/auth/require-auth';
import { connectToDatabase }       from '@/lib/db';
import { PlatformWallet }          from '@/lib/db/models/PlatformWallet';
import { User }                    from '@/lib/db/models/User';
import { errorResponse }           from '@/lib/utils/errors';
import { getEffectiveMinWithdraw } from '@/lib/wallet/withdrawal-limits';
import mongoose                    from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    const uid = new mongoose.Types.ObjectId(auth.id);
    const [doc, userDoc, minWithdrawUsdt] = await Promise.all([
      PlatformWallet.findOne({ userId: uid }).lean(),
      User.findById(auth.id).select('platformWalletFallback').lean<{ platformWalletFallback?: boolean }>(),
      getEffectiveMinWithdraw(auth.id),
    ]);

    return NextResponse.json({
      success:         true,
      balance:         doc?.balance ?? 0,
      fallbackEnabled: userDoc?.platformWalletFallback ?? false,
      minWithdrawUsdt,
      transactions: (doc?.transactions ?? [])
        .slice()
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
