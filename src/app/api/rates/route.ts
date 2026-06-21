import { NextResponse }                    from 'next/server';
import { getServerSession }               from 'next-auth';
import { authOptions }                    from '@/lib/auth/auth';
import { connectToDatabase, Rate, rateToDocument, getWidgetLimits, User } from '@/lib/db';
import { errorResponse }                  from '@/lib/utils/errors';
import { requireAdmin }                   from '@/lib/auth/require-auth';
import { rateCreateSchema }               from '@/lib/validators/rate';

export const dynamic = 'force-dynamic';

/** GET /api/rates — list all active rates + widget limits (public).
 *  Pro users receive buy -1% / sell +1% adjusted rates. */
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const [rawRates, widgetLimits] = await Promise.all([
      Rate.find({ isActive: true }).sort({ symbol: 1, network: 1 }).lean(),
      getWidgetLimits(),
    ]);

    // Optional auth: check if caller is an active Pro member
    let isPro = false;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const dbUser = await User.findById((session.user as any).id).select('proStatus').lean();
        const ps = (dbUser as any)?.proStatus ?? {};
        isPro = !!(ps.active && ps.expiresAt && new Date(ps.expiresAt) > new Date());
      }
    } catch { /* not authenticated — serve standard rates */ }

    const data = rawRates.map(r => {
      const doc = rateToDocument(r);
      if (isPro) {
        return {
          ...doc,
          buyRate:  +(doc.buyRate  * 0.99).toFixed(2), // -1% for Pro buyers
          sellRate: +(doc.sellRate * 1.01).toFixed(2), // +1% for Pro sellers
        };
      }
      return doc;
    });

    return NextResponse.json({ success: true, data, widgetLimits, isPro });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/rates — create a new rate (admin only) */
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const parsed = rateCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const existing = await Rate.findOne({ symbol: parsed.data.symbol, network: parsed.data.network });
    if (existing) {
      return NextResponse.json({ error: 'Rate for this symbol/network already exists' }, { status: 409 });
    }

    const rate = await Rate.create({
      ...parsed.data,
      lastUpdatedBy: admin.id,
      changeLog: [{
        previousBuy: 0,
        previousSell: 0,
        newBuy: parsed.data.buyRate,
        newSell: parsed.data.sellRate,
        changedBy: admin.id,
        changedByName: admin.name || admin.email,
        changedAt: new Date().toISOString(),
        reason: 'Initial rate',
      }],
    });

    return NextResponse.json({ success: true, data: rateToDocument(rate) }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}