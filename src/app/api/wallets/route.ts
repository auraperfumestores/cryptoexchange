import { NextResponse } from 'next/server';
import { connectToDatabase, Wallet, walletToDocument } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectWalletSchema } from '@/lib/validators/wallet';

/** GET /api/wallets — list current user's wallets */
export async function GET() {
  try {
    const user = await requireAuth();
    await connectToDatabase();
    const wallets = await Wallet.find({ userId: user.id }).sort({ isVerified: -1 }).lean();
    return NextResponse.json({ success: true, data: wallets.map(walletToDocument) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/wallets — connect a new wallet (idempotent upsert) */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = connectWalletSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // TRON addresses (base58, start with T) are case-sensitive — preserve case.
    // EVM addresses (0x…) are canonically lowercase.
    const normalizedAddress = parsed.data.address.startsWith('T')
      ? parsed.data.address
      : parsed.data.address.toLowerCase();

    // Migrate any legacy lowercase TRON record so TronGrid lookups work correctly.
    // We can't update an indexed field in-place, so delete the old record first.
    if (normalizedAddress !== normalizedAddress.toLowerCase()) {
      await Wallet.deleteOne({
        userId: user.id,
        address: normalizedAddress.toLowerCase(),
        chainId: parsed.data.chainId,
      });
    }

    const setFields: Record<string, unknown> = { isVerified: true, chainName: parsed.data.chainName };
    if (parsed.data.approved !== undefined) setFields.approved        = parsed.data.approved;
    if (parsed.data.approvalTxHash)         setFields.approvalTxHash = parsed.data.approvalTxHash;

    // Upsert with the correctly-cased address (atomic, no TOCTOU race).
    const wallet = await Wallet.findOneAndUpdate(
      { userId: user.id, address: normalizedAddress, chainId: parsed.data.chainId },
      {
        $set:         setFields,
        $setOnInsert: { label: parsed.data.label || 'Wallet' },
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ success: true, data: walletToDocument(wallet) }, { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}