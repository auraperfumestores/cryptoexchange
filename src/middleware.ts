import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isCookieValid, COOKIE_NAME } from '@/lib/turnstile/verify';

/** Blocks login, registration, and OTP-send requests unless the visitor passed
 *  the invisible Cloudflare Turnstile check run by <TurnstileGate /> on page load.
 *  Skipped entirely when Turnstile isn't configured, so the app keeps working
 *  until NEXT_PUBLIC_TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY are set. */
export async function middleware(req: NextRequest) {
  if (!process.env.TURNSTILE_SECRET_KEY) return NextResponse.next();

  const verified = await isCookieValid(req.cookies.get(COOKIE_NAME)?.value);
  if (!verified) {
    return NextResponse.json(
      { error: 'Bot verification failed. Please refresh the page and try again.' },
      { status: 403 },
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/auth/register',
    '/api/auth/callback/credentials',
    '/api/auth/send-otp',
  ],
};
