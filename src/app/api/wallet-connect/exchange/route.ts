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
    // Use a client-side JS redirect (not HTTP 302) so Trust Wallet's DApp browser stays in
    // its established chain context. A server-side redirect causes Trust Wallet to reload the
    // page as a fresh navigation, which resets the window.tronLink/tronWeb injection. A JS
    // redirect (window.location.replace) is treated as an in-session navigation that preserves
    // the wallet injection state.
    const dest = redirectUrl.pathname + redirectUrl.search;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Connecting…</title><style>body{margin:0;background:#111B42;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#fff;flex-direction:column;gap:16px}.spin{width:36px;height:36px;border:3px solid rgba(255,255,255,.1);border-top-color:#fff;border-radius:50%;animation:s .7s linear infinite}@keyframes s{to{transform:rotate(360deg)}}</style></head><body><div class="spin"></div><p style="margin:0;opacity:.7;font-size:14px">Connecting wallet…</p><script>window.location.replace(${JSON.stringify(dest)})</script></body></html>`;

    const response = new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });

    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      secure:   isSecure,
      sameSite: 'lax',
      maxAge:   30 * 24 * 60 * 60,
      path:     '/',
      // Must match the domain scoping in authOptions.cookies so this cookie is valid on
      // both swappinr.com and www.swappinr.com, same as a normal credentials login.
      domain:   isSecure ? '.swappinr.com' : undefined,
    });

    return response;
  } catch (err) {
    console.error('[wallet-connect/exchange]', err);
    return NextResponse.redirect(loginUrl);
  }
}
