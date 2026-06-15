import { NextResponse } from 'next/server';
import { connectToDatabase, PaymentMethod, paymentMethodToDocument } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';
import { requireAdmin } from '@/lib/auth/require-auth';
import { paymentMethodSchema } from '@/lib/validators/payment';

/** GET /api/payments/all — list all payment methods including inactive (admin) */
export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();
    const methods = await PaymentMethod.find({})
      .sort({ displayOrder: 1 })
      .lean();
    return NextResponse.json({ success: true, data: methods.map(paymentMethodToDocument) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/payments/all — create a new payment method (admin) */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = paymentMethodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const pm = await PaymentMethod.create({
      type: parsed.data.type,
      label: parsed.data.label,
      isActive: parsed.data.isActive ?? true,
      displayOrder: parsed.data.displayOrder ?? 0,
      details: parsed.data.details,
    });

    return NextResponse.json({ success: true, data: paymentMethodToDocument(pm) }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}