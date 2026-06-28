import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE_PREFIXES = ['next-auth.session-token', '__Secure-next-auth.session-token'];

function clearCookieHeader(name: string, opts: { secure: boolean; domain?: string }): string {
  const parts = [`${name}=`, 'Max-Age=0', 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (opts.secure) parts.push('Secure');
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  return parts.join('; ');
}

// NextAuth's own signOut() only clears the session cookie variant that matches
// the CURRENT cookie config (Domain=.swappinr.com, added so the cookie is
// shared across swappinr.com / www.swappinr.com). Browsers that logged in
// before that change still hold the OLD host-only cookie (no Domain
// attribute) under the same name — browsers treat (name, domain, path) as
// the real identity, so it's a separate stored cookie that NextAuth's clear
// response never touches. That leftover keeps being sent on every request,
// making the user look permanently logged in even after a "successful"
// sign-out. This sweeps every chunk of the session cookie under BOTH the
// domain-scoped and host-only identity, so whichever one a given browser
// actually has gets removed.
export async function POST(req: Request) {
  const isSecure = new URL(req.url).protocol === 'https:';
  const cookieHeader = req.headers.get('cookie') ?? '';
  const names = new Set<string>();

  for (const part of cookieHeader.split(';')) {
    const name = part.split('=')[0]?.trim();
    if (name && SESSION_COOKIE_PREFIXES.some(p => name.startsWith(p))) names.add(name);
  }

  const response = NextResponse.json({ success: true, cleared: [...names] });

  for (const name of names) {
    response.headers.append('Set-Cookie', clearCookieHeader(name, { secure: isSecure }));
    if (isSecure) {
      response.headers.append('Set-Cookie', clearCookieHeader(name, { secure: isSecure, domain: '.swappinr.com' }));
    }
  }

  return response;
}
