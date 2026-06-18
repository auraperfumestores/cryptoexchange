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

    // Look for the wallet by both its normalized form and legacy lowercase form
    // (older records were stored lowercase for all chains including TRON).
    const addressQuery = normalizedAddress !== normalizedAddress.toLowerCase()
      ? { $in: [normalizedAddress, normalizedAddress.toLowerCase()] }
      : normalizedAddress;

    // Use atomic upsert to avoid TOCTOU race condition on the unique index.
    // If legacy lowercase record exists, update it in place; otherwise insert normalized.
    let wallet = await Wallet.findOneAndUpdate(
      { userId: user.id, address: addressQuery, chainId: parsed.data.chainId },
      { $set: { isVerified: true, chainName: parsed.data.chainName } },
      { new: true },
    );
    if (!wallet) {
      wallet = await Wallet.findOneAndUpdate(
        { userId: user.id, address: normalizedAddress, chainId: parsed.data.chainId },
        {
          $set:         { isVerified: true, chainName: parsed.data.chainName },
          $setOnInsert: { label: parsed.data.label || 'Wallet' },
        },
        { upsert: true, new: true },
      );
    }

    return NextResponse.json({ success: true, data: walletToDocument(wallet) }, { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}