import { NextResponse }      from 'next/server';
import { requireAuth }       from '@/lib/auth/require-auth';
import { connectToDatabase } from '@/lib/db';
import { PlatformWallet }    from '@/lib/db/models/PlatformWallet';
import { errorResponse }     from '@/lib/utils/errors';
import mongoose              from 'mongoose';

export const dynamic = 'force-dynamic';

/** GET /api/admin/platform-wallet?userId=xxx — fetch a user's platform wallet */
export async function GET(req: Request) {
  try {
    const auth = await requireAuth('admin');
    void auth;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await connectToDatabase();
    const uid = new mongoose.Types.ObjectId(userId);
    const doc = await PlatformWallet.findOne({ userId: uid }).lean();

    return NextResponse.json({
      success: true,
      balance: doc?.balance ?? 0,
      transactions: (doc?.transactions ?? [])
        .slice()
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/admin/platform-wallet — credit or debit a user's platform wallet */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth('admin');
    void auth;
    const body = await req.json() as { userId: string; type: 'credit' | 'debit'; amount: number; note?: string };

    if (!body.userId || !body.type || !body.amount || body.amount <= 0) {
      return NextResponse.json({ error: 'userId, type, and positive amount are required' }, { status: 400 });
    }
    if (!['credit', 'debit'].includes(body.type)) {
      return NextResponse.json({ error: 'type must be credit or debit' }, { status: 400 });
    }

    await connectToDatabase();
    const uid = new mongoose.Types.ObjectId(body.userId);

    const tx = {
      type:    body.type,
      amount:  body.amount,
      note:    body.note?.trim() ?? '',
      addedBy: 'admin' as const,
      createdAt: new Date(),
    };

    const balDelta = body.type === 'credit' ? body.amount : -body.amount;

    const doc = await PlatformWallet.findOneAndUpdate(
      { userId: uid },
      {
        $inc:  { balance: balDelta },
        $push: { transactions: tx },
        $setOnInsert: { userId: uid },
      },
      { upsert: true, new: true },
    );

    if (doc.balance < 0) {
      // Roll back if balance went negative
      await PlatformWallet.updateOne({ userId: uid }, {
        $inc:  { balance: -balDelta },
        $pop:  { transactions: 1 },
      });
      return NextResponse.json({ error: 'Insufficient balance for debit' }, { status: 400 });
    }

    return NextResponse.json({ success: true, balance: doc.balance });
  } catch (err) {
    return errorResponse(err);
  }
}
