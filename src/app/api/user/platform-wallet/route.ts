import { NextResponse }            from 'next/server';
import { requireAuth }             from '@/lib/auth/require-auth';
import { connectToDatabase }       from '@/lib/db';
import { PlatformWallet }          from '@/lib/db/models/PlatformWallet';
import { errorResponse }           from '@/lib/utils/errors';
import mongoose                    from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    const uid = new mongoose.Types.ObjectId(auth.id);
    const doc = await PlatformWallet.findOne({ userId: uid }).lean();

    return NextResponse.json({
      success: true,
      balance: doc?.balance ?? 0,
      transactions: (doc?.transactions ?? [])
        .slice()
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
