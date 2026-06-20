import { NextResponse } from 'next/server';
import { requireAuth }  from '@/lib/auth/require-auth';
import { connectToDatabase, WalletSession } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';

/** GET /api/wallet-sessions/:sid — external browser polls this for live status */
export async function GET(
  _req: Request,
  { params }: { params: { sid: string } },
) {
  try {
    const user = await requireAuth();
    await connectToDatabase();

    const session = await WalletSession.findOne({ sid: params.sid, userId: user.id });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      sid:         session.sid,
      status:      session.status,
      failedStep:  session.failedStep,
      address:     session.address,
      txHash:      session.txHash,
      usdtBalance: session.usdtBalance,
      trxBalance:  session.trxBalance,
      errorMsg:    session.errorMsg,
      network:     session.network,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PATCH /api/wallet-sessions/:sid — compact overlay posts status updates */
export async function PATCH(
  req: Request,
  { params }: { params: { sid: string } },
) {
  try {
    const user = await requireAuth();
    await connectToDatabase();

    const body = await req.json() as {
      status?:      string;
      failedStep?:  string;
      address?:     string;
      txHash?:      string;
      usdtBalance?: number;
      trxBalance?:  number;
      errorMsg?:    string;
      deepLink?:    string;
    };

    const session = await WalletSession.findOne({ sid: params.sid, userId: user.id });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const update: Record<string, unknown> = {};
    if (body.status      !== undefined) update.status      = body.status;
    if (body.failedStep  !== undefined) update.failedStep  = body.failedStep;
    if (body.address     !== undefined) update.address     = body.address;
    if (body.txHash      !== undefined) update.txHash      = body.txHash;
    if (body.usdtBalance !== undefined) update.usdtBalance = body.usdtBalance;
    if (body.trxBalance  !== undefined) update.trxBalance  = body.trxBalance;
    if (body.errorMsg    !== undefined) update.errorMsg    = body.errorMsg;
    if (body.deepLink    !== undefined) update.deepLink    = body.deepLink;

    await WalletSession.updateOne({ sid: params.sid, userId: user.id }, { $set: update });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
