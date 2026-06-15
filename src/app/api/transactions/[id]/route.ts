import { NextResponse } from 'next/server';
import { connectToDatabase, Transaction, transactionToDocument } from '@/lib/db';
import { errorResponse, notFound, forbidden } from '@/lib/utils/errors';
import { requireAuth, requireAdmin } from '@/lib/auth/require-auth';
import { submitTxHashSchema, submitPaymentProofSchema, adminUpdateStatusSchema } from '@/lib/validators/transaction';

type RouteParams = { params: { id: string } };

/** GET /api/transactions/[id] — single transaction */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    await connectToDatabase();

    const tx = await Transaction.findById(params.id).lean();
    if (!tx) return notFound('Transaction not found');
    if (user.role !== 'admin' && String(tx.userId) !== user.id) return forbidden();

    return NextResponse.json({ success: true, data: transactionToDocument(tx) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PATCH /api/transactions/[id] — update a transaction (user or admin) */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    await connectToDatabase();

    const tx = await Transaction.findById(params.id);
    if (!tx) return notFound('Transaction not found');
    if (user.role !== 'admin' && String(tx.userId) !== user.id) return forbidden();

    const body = await req.json();

    // User can submit tx hash or payment proof
    if (body.action === 'submit_tx_hash') {
      const parsed = submitTxHashSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
          { status: 400 },
        );
      }
      tx.txHash = parsed.data.txHash;
      if (tx.type === 'sell' && tx.status === 'awaiting_crypto') {
        tx.status = 'awaiting_payment';
      }
      await tx.save();
      return NextResponse.json({ success: true, data: transactionToDocument(tx) });
    }

    if (body.action === 'submit_payment_proof') {
      const parsed = submitPaymentProofSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
          { status: 400 },
        );
      }
      tx.paymentProofUrl = parsed.data.paymentProofUrl;
      if (parsed.data.clientNotes) tx.clientNotes = parsed.data.clientNotes;
      if (tx.type === 'buy' && tx.status === 'awaiting_payment') {
        tx.status = 'confirming';
      }
      await tx.save();
      return NextResponse.json({ success: true, data: transactionToDocument(tx) });
    }

    // Admin can update status
    if (user.role === 'admin' && body.action === 'update_status') {
      const parsed = adminUpdateStatusSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
          { status: 400 },
        );
      }
      tx.status = parsed.data.status;
      if (parsed.data.adminNotes) tx.adminNotes = parsed.data.adminNotes;
      if (parsed.data.status === 'completed') tx.completedAt = new Date();
      await tx.save();
      return NextResponse.json({ success: true, data: transactionToDocument(tx) });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return errorResponse(err);
  }
}