import { NextResponse } from 'next/server';
import { connectToDatabase, PaymentMethod, paymentMethodToDocument } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';
import { requireAdmin } from '@/lib/auth/require-auth';
import { paymentMethodSchema } from '@/lib/validators/payment';

/** GET /api/payments — list active payment methods (public) */
export async function GET() {
  try {
    await connectToDatabase();
    const methods = await PaymentMethod.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();
    return NextResponse.json({ success: true, data: methods.map(paymentMethodToDocument) });
  } catch (err) {
    return errorResponse(err);
  }
}