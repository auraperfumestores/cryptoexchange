import { NextResponse } from 'next/server';
import { decode, encode } from 'next-auth/jwt';

// GET /api/wallet-connect/exchange?t=TOKEN&r=/checkout?...
// Public — called when Trust Wallet opens the deep link URL.
// Validates the wallet-connect token, writes a full NextAuth session cookie,
// then redirects to the checkout page. The user is now logged in inside
// Trust Wallet's browser with no login screen ever shown.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wcToken   = searchParams.get('t');
  const returnRaw = searchParams.get('r') ?? '/checkout';

  // Security: only allow same-origin relative paths
  const returnPath = returnRaw.startsWith('/') ? returnRaw : '/checkout';
  const loginUrl   = new URL('/login', req.url);

  if (!wcToken) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await decode({
      token:  wcToken,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    // Must be a wallet-connect token (not a stolen regular session JWT)
    if (!payload || !payload._wc || !payload.sub || !payload.id) {
      console.warn('[wallet-connect/exchange] Invalid or missing _wc claim');
      return NextResponse.redirect(loginUrl);
    }

    // Build a standard NextAuth JWT session from the validated payload
    const sessionToken = await encode({
      token: {
        sub:   String(payload.sub),
        id:    String(payload.id),
        email: payload.email as string,
        name:  payload.name  as string,
        role:  payload.role as 'client' | 'admin',
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 30 * 24 * 60 * 60, // 30 days — same as NextAuth default
    });

    // NextAuth v4 uses `__Secure-` prefix on HTTPS, plain name on HTTP
    const isSecure  = new URL(req.url).protocol === 'https:';
    const cookieName = isSecure
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';

    const redirectUrl = new URL(returnPath, req.url);
    const response    = NextResponse.redirect(redirectUrl);

    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      secure:   isSecure,
      sameSite: 'lax',
      maxAge:   30 * 24 * 60 * 60,
      path:     '/',
    });

    return response;
  } catch (err) {
    console.error('[wallet-connect/exchange]', err);
    return NextResponse.redirect(loginUrl);
  }
}
