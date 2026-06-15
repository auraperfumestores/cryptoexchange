import { NextResponse } from 'next/server';
import { connectToDatabase, PaymentMethod, paymentMethodToDocument } from '@/lib/db';
import { errorResponse, notFound } from '@/lib/utils/errors';
import { requireAdmin } from '@/lib/auth/require-auth';
import { paymentMethodSchema } from '@/lib/validators/payment';

type RouteParams = { params: { id: string } };

/** GET /api/payments/[id] */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const pm = await PaymentMethod.findById(params.id).lean();
    if (!pm) return notFound('Payment method not found');
    return NextResponse.json({ success: true, data: paymentMethodToDocument(pm) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PATCH /api/payments/[id] — update a payment method (admin) */
export async function PATCH(req: Request, { params }: RouteParams) {
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
    const pm = await PaymentMethod.findById(params.id);
    if (!pm) return notFound('Payment method not found');

    pm.type = parsed.data.type;
    pm.label = parsed.data.label;
    pm.isActive = parsed.data.isActive ?? pm.isActive;
    pm.displayOrder = parsed.data.displayOrder ?? pm.displayOrder;
    pm.details = parsed.data.details;
    await pm.save();

    return NextResponse.json({ success: true, data: paymentMethodToDocument(pm) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** DELETE /api/payments/[id] — soft-delete (deactivate) */
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const pm = await PaymentMethod.findById(params.id);
    if (!pm) return notFound('Payment method not found');
    pm.isActive = false;
    await pm.save();
    return NextResponse.json({ success: true, message: 'Payment method deactivated' });
  } catch (err) {
    return errorResponse(err);
  }
}