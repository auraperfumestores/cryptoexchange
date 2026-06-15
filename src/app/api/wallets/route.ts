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

/** POST /api/wallets — connect a new wallet */
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

    // Check for duplicate
    const existing = await Wallet.findOne({
      userId: user.id,
      address: parsed.data.address.toLowerCase(),
      chainId: parsed.data.chainId,
    });
    if (existing) {
      return NextResponse.json({ error: 'Wallet already connected' }, { status: 409 });
    }

    const wallet = await Wallet.create({
      userId: user.id,
      address: parsed.data.address.toLowerCase(),
      chainId: parsed.data.chainId,
      chainName: parsed.data.chainName,
      label: parsed.data.label || 'Wallet',
      isVerified: true,
    });

    return NextResponse.json({ success: true, data: walletToDocument(wallet) }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}