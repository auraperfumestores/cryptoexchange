import { NextResponse } from 'next/server';

/**
 * POST /api/debug-log
 * Receives compact-overlay debug lines and prints them to server stdout
 * so they appear in Vercel function logs. No auth required — this endpoint
 * only writes to logs, never reads or modifies data.
 */
export async function POST(req: Request) {
  try {
    const { lines, sid } = await req.json() as { lines?: string[]; sid?: string };
    const tag = `[debug:${sid || 'trc20'}]`;
    for (const line of (lines ?? [])) {
      console.log(tag, line);
    }
  } catch {
    // Malformed body — ignore silently
  }
  return NextResponse.json({ ok: true });
}
