import { NextResponse } from 'next/server';
import { verifyTurnstileToken, signCookieValue, COOKIE_NAME, COOKIE_TTL_MS } from '@/lib/turnstile/verify';

export const dynamic = 'force-dynamic';

/** POST /api/turnstile/verify — verifies a Cloudflare Turnstile token and, on
 *  success, sets a signed "verified" cookie used by middleware to gate sensitive
 *  endpoints (login, register, OTP) without re-challenging the visitor each time. */
export async function POST(req: Request) {
  const { token } = await req.json() as { token?: string };
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  const ok = await verifyTurnstileToken(token, ip);
  if (!ok) return NextResponse.json({ success: false }, { status: 403 });

  const expiresAtMs = Date.now() + COOKIE_TTL_MS;
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, await signCookieValue(expiresAtMs), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAtMs),
  });
  return res;
}
