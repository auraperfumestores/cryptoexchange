import { NextResponse } from 'next/server';
import { connectToDatabase, getWidgetLimits } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/public/limits — returns publicly visible trading limits */
export async function GET() {
  try {
    await connectToDatabase();
    const limits = await getWidgetLimits();
    return NextResponse.json({
      success: true,
      data: {
        minBuyUsdt:      limits.minBuyUsdt,
        minSellUsdt:     limits.minSellUsdt,
        minCashSellUsdt: limits.minCashSellUsdt,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
