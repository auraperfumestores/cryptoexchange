import { NextResponse }                                from 'next/server';
import { requireAuth }                                 from '@/lib/auth/require-auth';
import { connectToDatabase, SiteSetting, DEFAULT_EXCHANGE_LIMITS, getExchangeLimits } from '@/lib/db';
import { errorResponse }                               from '@/lib/utils/errors';
import type { ExchangeLimits }                         from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/admin/settings — returns all site settings */
export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectToDatabase();
    const limits = await getExchangeLimits();

    return NextResponse.json({ success: true, data: { exchangeLimits: limits } });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PATCH /api/admin/settings — update site settings */
export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json() as { exchangeLimits?: ExchangeLimits };

    await connectToDatabase();

    if (body.exchangeLimits) {
      await SiteSetting.findOneAndUpdate(
        { key: 'exchangeLimits' },
        { $set: { value: body.exchangeLimits } },
        { upsert: true, new: true },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
