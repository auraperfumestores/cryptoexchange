import { NextResponse }      from 'next/server';
import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/auth';
import { encode }            from 'next-auth/jwt';
import { connectToDatabase, WalletSession } from '@/lib/db';

function generateSid(): string {
  return (
    Math.random().toString(36).slice(2, 9) +
    Math.random().toString(36).slice(2, 9) +
    Date.now().toString(36)
  );
}

/**
 * POST /api/wallet-connect/generate
 * Authenticated — creates a short-lived signed token carrying the user's identity
 * AND a WalletSession for real-time status tracking.
 * Returns { token, sid }.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    const returnPathRaw: string =
      typeof body.returnPath === 'string' && body.returnPath.startsWith('/')
        ? body.returnPath
        : '/wallets';

    const network: string = typeof body.network === 'string' ? body.network : 'BEP20';

    /* ── Create tracking session ── */
    await connectToDatabase();
    const sid = generateSid();
    await WalletSession.create({
      sid,
      userId:    session.user.id,
      network,
      status:    'pending',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min TTL
    });

    // Append sid to returnPath so the compact overlay can post status updates
    const sep        = returnPathRaw.includes('?') ? '&' : '?';
    const returnPath = `${returnPathRaw}${sep}sid=${sid}`;

    const token = await encode({
      token: {
        sub:     session.user.id,
        id:      session.user.id,
        email:   session.user.email,
        name:    session.user.name,
        role:    session.user.role,
        _wc:     true,
        _wcPath: returnPath,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 10 * 60, // 10 minutes
    });

    return NextResponse.json({ token, sid });
  } catch (err) {
    console.error('[wallet-connect/generate]', err);
    return NextResponse.json({ error: 'Failed to generate session link' }, { status: 500 });
  }
}
