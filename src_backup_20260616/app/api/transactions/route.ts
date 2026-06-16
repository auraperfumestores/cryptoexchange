import { NextResponse } from 'next/server';
import { connectToDatabase, Transaction, transactionToDocument, Rate, PaymentMethod } from '@/lib/db';
import { errorResponse, badRequest, notFound } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/auth/require-auth';
import { createSellSchema, createBuySchema } from '@/lib/validators/transaction';
import { generateOrderId } from '@/lib/utils/format';
import type { TransactionStatus, FeeBreakdown } from '@/types';

/** GET /api/transactions — list transactions for the current user, or all for admin */
export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const status = searchParams.get('status') as TransactionStatus | null;
    const type = searchParams.get('type') as 'buy' | 'sell' | null;

    const filter: any = {};
    if (user.role !== 'admin') filter.userId = user.id;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const [docs, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: docs.map(transactionToDocument),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/transactions — create a buy or sell order */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const isBuy = body.type === 'buy';
    const schema = isBuy ? createBuySchema : createSellSchema;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Fetch the current rate
    const rate = await Rate.findOne({
      symbol: parsed.data.cryptoSymbol,
      network: parsed.data.network,
      isActive: true,
    });

    if (!rate) return badRequest('No active rate for this crypto/network');

    const cryptoAmount = parsed.data.cryptoAmount;
    const applicableRate = isBuy ? rate.buyRate : rate.sellRate;
    const inrAmount = parseFloat((cryptoAmount * applicableRate).toFixed(2));

    // Simple fee: 0.5% platform fee
    const platformFee = parseFloat((inrAmount * 0.005).toFixed(2));
    const networkFee = 0;
    const gasEstimate = 0;
    const fee = platformFee + networkFee + gasEstimate;
    const feeBreakdown: FeeBreakdown = { platformFee, networkFee, gasEstimate };

    const feePercent = parseFloat((((fee) / inrAmount) * 100).toFixed(2));

    // For sell: user receives netInrAmount after fee deduction
    // For buy: user pays inrAmount, fee is included
    const netInrAmount = isBuy ? inrAmount : parseFloat((inrAmount - fee).toFixed(2));

    let initialStatus: TransactionStatus = isBuy ? 'awaiting_payment' : 'awaiting_crypto';

    // For buy orders, a payment method is required
    let paymentMethodType: string | undefined;
    if (isBuy && parsed.data.paymentMethodId) {
      try {
        const pm = await PaymentMethod.findById(parsed.data.paymentMethodId);
        if (pm && pm.isActive) {
          paymentMethodType = pm.type;
        }
      } catch { /* invalid ObjectId format — payment method ID was a free-text reference */ }
    }

    const orderId = generateOrderId();

    const tx = await Transaction.create({
      orderId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: isBuy ? 'buy' : 'sell',
      cryptoSymbol: parsed.data.cryptoSymbol,
      network: parsed.data.network,
      cryptoAmount,
      inrAmount,
      rate: applicableRate,
      fee,
      feeBreakdown,
      status: initialStatus,
      walletAddress: parsed.data.walletAddress,
      depositAddress: rate.depositAddress,
      verificationTxHash: (parsed.data as any).verificationTxHash || undefined,
      paymentMethodId: isBuy ? parsed.data.paymentMethodId : undefined,
      paymentMethodType,
      clientNotes: parsed.data.clientNotes,
    });

    return NextResponse.json(
      { success: true, data: transactionToDocument(tx) },
      { status: 201 },
    );
  } catch (err) {
    return errorResponse(err);
  }
}