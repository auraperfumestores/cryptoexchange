import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NEXTAUTH_URL (and therefore every next-auth client call: signIn, signOut,
// getSession, csrf) is pinned at build time to the canonical production host
// below — see next.config.js's resolveAppUrl(). swappinr.com (no www) is also
// live and serves the same app with no DNS/CDN-level redirect, so a visitor
// landing on the bare apex domain gets HTML whose auth requests are sent
// cross-host to the canonical domain. Host-bound cookies (e.g. the CSRF
// cookie, which can't carry a Domain attribute) never travel on those
// cross-host requests, which silently breaks CSRF-gated flows like sign-out.
// Redirecting the apex to the canonical host up front keeps every request —
// page loads, cookies, and auth calls — on a single origin.
const CANONICAL_HOST = 'www.swappinr.com';
const APEX_HOST = 'swappinr.com';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  if (host === APEX_HOST) {
    const url = req.nextUrl.clone();
    url.protocol = 'https';
    url.host = CANONICAL_HOST;
    url.port = '';
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
