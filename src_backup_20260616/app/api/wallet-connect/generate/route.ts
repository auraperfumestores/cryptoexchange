import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { encode } from 'next-auth/jwt';

// POST /api/wallet-connect/generate
// Authenticated — creates a short-lived signed token carrying the user's identity.
// The token is embedded in a Trust Wallet deep link; when Trust Wallet opens the
// exchange endpoint, it exchanges the token for a real NextAuth session cookie so
// the user never sees the login page inside the wallet browser.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    // Only allow relative paths — prevents open-redirect misuse
    const returnPath =
      typeof body.returnPath === 'string' && body.returnPath.startsWith('/')
        ? body.returnPath
        : '/checkout';

    const token = await encode({
      token: {
        sub:   session.user.id,
        id:    session.user.id,
        email: session.user.email,
        name:  session.user.name,
        role:  session.user.role,
        // Marker so the exchange endpoint can verify this isn't a hijacked session token
        _wc:     true,
        _wcPath: returnPath,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 10 * 60, // 10 minutes — enough to open Trust Wallet and approve
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error('[wallet-connect/generate]', err);
    return NextResponse.json({ error: 'Failed to generate session link' }, { status: 500 });
  }
}
