import { NextResponse } from 'next/server';
import { connectToDatabase, Rate, rateToDocument } from '@/lib/db';
import { errorResponse, notFound } from '@/lib/utils/errors';
import { requireAdmin } from '@/lib/auth/require-auth';
import { rateUpdateSchema } from '@/lib/validators/rate';

type RouteParams = { params: { id: string } };

/** GET /api/rates/[id] — single rate (public) */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const rate = await Rate.findById(params.id).lean();
    if (!rate) return notFound('Rate not found');
    return NextResponse.json({ success: true, data: rateToDocument(rate) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PATCH /api/rates/[id] — update a rate (admin only) */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = rateUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const existing = await Rate.findById(params.id);
    if (!existing) return notFound('Rate not found');

    const prev = { buy: existing.buyRate, sell: existing.sellRate };

    // Apply updates
    if (parsed.data.buyRate !== undefined) existing.buyRate = parsed.data.buyRate;
    if (parsed.data.sellRate !== undefined) existing.sellRate = parsed.data.sellRate;
    if (parsed.data.spread !== undefined) existing.spread = parsed.data.spread;
    if (parsed.data.spreadType !== undefined) existing.spreadType = parsed.data.spreadType;
    if (parsed.data.useCoinGecko !== undefined) existing.useCoinGecko = parsed.data.useCoinGecko;
    if (parsed.data.coinGeckoId !== undefined) existing.coinGeckoId = parsed.data.coinGeckoId ?? undefined;
    if (parsed.data.baseSpread !== undefined) existing.baseSpread = parsed.data.baseSpread ?? undefined;
    if (parsed.data.basePrice !== undefined) existing.basePrice = parsed.data.basePrice ?? undefined;
    if (parsed.data.depositAddress !== undefined) existing.depositAddress = parsed.data.depositAddress;
    if (parsed.data.isActive !== undefined) existing.isActive = parsed.data.isActive;
    existing.lastUpdatedBy = admin.id;

    // Log the change
    existing.changeLog.push({
      previousBuy: prev.buy,
      previousSell: prev.sell,
      newBuy: existing.buyRate,
      newSell: existing.sellRate,
      changedBy: admin.id,
      changedByName: admin.name || admin.email,
      changedAt: new Date().toISOString(),
      reason: parsed.data.reason || 'Rate updated',
    });

    await existing.save();

    return NextResponse.json({ success: true, data: rateToDocument(existing) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** DELETE /api/rates/[id] — deactivate a rate (admin only, soft-delete by setting isActive=false) */
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const existing = await Rate.findById(params.id);
    if (!existing) return notFound('Rate not found');

    existing.isActive = false;
    await existing.save();

    return NextResponse.json({ success: true, message: 'Rate deactivated' });
  } catch (err) {
    return errorResponse(err);
  }
}