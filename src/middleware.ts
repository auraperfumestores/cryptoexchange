// ============================================================================
// !! TEMPORARY SIMULATOR-ONLY MODE !!
//
// This middleware serves public/simulator.html for EVERY request and makes
// the entire site (all pages, API routes, and assets) unreachable.
//
// The original middleware is preserved at:
//   - src/middleware.ts.bak                       (this repo)
//   - E:\crypto-exchange-backup-2026-08-19\       (full project backup)
//
// To restore the original site, follow RESTORE_ORIGINAL.md at the repo root.
// ============================================================================
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Preserved from the original middleware: keep apex-domain visitors on the
// canonical host so the eventual restore doesn't change redirect behavior.
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

  if (req.nextUrl.pathname === '/simulator.html') {
    return NextResponse.next();
  }
  return NextResponse.rewrite(new URL('/simulator.html', req.url));
}

export const config = {
  // Intentionally matches EVERYTHING (including /_next and /api): the
  // simulator page is a single self-contained HTML file and needs no app
  // assets, so nothing else should be servable while this mode is active.
  matcher: ['/:path*'],
};
