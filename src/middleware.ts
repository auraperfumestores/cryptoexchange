// ============================================================================
// !! TEMPORARY SIMULATOR-ONLY MODE !!
//
// This middleware:
//   - serves public/simulator.html for the main page (/) ONLY
//   - returns a plain 404 for EVERY other URL (pages, API routes, assets,
//     even /simulator.html directly) without running any app code
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

  // Main page only: internally rewrite to the static simulator file.
  // (Middleware does not re-run on the rewritten request, so /simulator.html
  // itself still 404s when visited directly.)
  if (req.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/simulator.html', req.url));
  }

  // Everything else: plain 404 served straight from the edge — no page,
  // API route, or asset of the original site is ever reached.
  return new NextResponse(
    '<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="background:#050505;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><p>404 — This page could not be found.</p></body></html>',
    { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}

export const config = {
  // Intentionally matches EVERYTHING (including /_next and /api): the
  // simulator page is a single self-contained HTML file and needs no app
  // assets, so nothing else should be servable while this mode is active.
  matcher: ['/:path*'],
};
