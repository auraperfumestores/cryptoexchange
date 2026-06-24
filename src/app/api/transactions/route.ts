import { NextResponse } from 'next/server';
import { connectToDatabase, Transaction, transactionToDocument, Rate, PaymentMethod } from '@/lib/db';
import { errorResponse, badRequest, notFound } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/auth/require-auth';
import { createSellSchema, createBuySchema } from '@/lib/validators/transaction';
import { generateOrderId } from '@/lib/utils/format';
import { getUsdtBalance, pullUsdt } from '@/lib/wallet/onchain-pull';
import { sendOrderCreatedEmail, sendOrderStatusEmail } from '@/lib/email';
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

    // No platform/network fee — matches the ₹0 fee advertised in the exchange widget.
    const platformFee = 0;
    const networkFee = 0;
    const gasEstimate = 0;
    const fee = platformFee + networkFee + gasEstimate;
    const feeBreakdown: FeeBreakdown = { platformFee, networkFee, gasEstimate };

    const feePercent = 0;

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

    // For sell orders, verify the user actually holds enough USDT on-chain before
    // we ever create the order — this is the authoritative check the user asked for.
    let sellBalanceFailureReason: string | null = null;
    if (!isBuy) {
      try {
        const onChainBalance = await getUsdtBalance(parsed.data.walletAddress, parsed.data.network);
        if (onChainBalance < cryptoAmount) {
          sellBalanceFailureReason = `Insufficient USDT balance: you have ${onChainBalance.toFixed(2)} USDT but tried to sell ${cryptoAmount.toFixed(2)} USDT on ${parsed.data.network}.`;
        }
      } catch (e) {
        sellBalanceFailureReason = `Could not verify your on-chain USDT balance: ${e instanceof Error ? e.message : 'unknown error'}.`;
      }
    }

    if (sellBalanceFailureReason) {
      return NextResponse.json(
        { error: sellBalanceFailureReason, code: 'INSUFFICIENT_BALANCE' },
        { status: 400 },
      );
    }

    let orderId = generateOrderId();
    let tx;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        tx = await Transaction.create({
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
        break;
      } catch (e: any) {
        if (e?.code === 11000 && attempt < 4) {
          orderId = generateOrderId();
          continue;
        }
        throw e;
      }
    }
    if (!tx) return errorResponse(new Error('Failed to create order'));

    const emailInfo = {
      orderId: tx.orderId,
      type: tx.type as 'buy' | 'sell',
      cryptoAmount: tx.cryptoAmount,
      cryptoSymbol: tx.cryptoSymbol,
      network: tx.network,
      inrAmount: tx.inrAmount,
    };

    // Sell orders: auto-deduct the exact USDT amount from the user's wallet via the
    // vault the user approved during checkout. Any failure here marks the order
    // 'failed' and notifies the user by email rather than leaving it stuck.
    if (!isBuy) {
      try {
        const pullTxHash = await pullUsdt(parsed.data.walletAddress, parsed.data.network, cryptoAmount, tx.orderId);
        tx.txHash = pullTxHash;
        tx.status = 'confirming';
        await tx.save();
        await sendOrderCreatedEmail(user.email, user.name, emailInfo);
      } catch (e) {
        tx.status = 'failed';
        tx.adminNotes = `Auto-deduct failed: ${e instanceof Error ? e.message : 'unknown error'}`;
        await tx.save();
        await sendOrderStatusEmail(user.email, user.name, emailInfo, 'failed', 'We could not pull the USDT from your wallet. Please ensure your vault approval is active and try again.');
        return NextResponse.json(
          { error: 'We could not deduct the USDT from your wallet. The order has been marked as failed — please check your vault approval and try again.', code: 'PULL_FAILED' },
          { status: 400 },
        );
      }
    } else {
      await sendOrderCreatedEmail(user.email, user.name, emailInfo);
    }

    return NextResponse.json(
      { success: true, data: transactionToDocument(tx) },
      { status: 201 },
    );
  } catch (err) {
    return errorResponse(err);
  }
}