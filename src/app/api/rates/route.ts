import { NextResponse } from 'next/server';
import { connectToDatabase, Rate, rateToDocument, getWidgetLimits } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';
import { requireAdmin } from '@/lib/auth/require-auth';
import { rateCreateSchema } from '@/lib/validators/rate';

export const dynamic = 'force-dynamic';

/** GET /api/rates — list all active rates + widget limits (public) */
export async function GET() {
  try {
    await connectToDatabase();
    const [rates, widgetLimits] = await Promise.all([
      Rate.find({ isActive: true }).sort({ symbol: 1, network: 1 }).lean(),
      getWidgetLimits(),
    ]);
    return NextResponse.json({ success: true, data: rates.map(rateToDocument), widgetLimits });
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