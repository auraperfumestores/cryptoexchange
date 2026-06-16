import { NextResponse } from 'next/server';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/**
 * GET /api/coingecko?ids=tether,binancecoin
 * Proxies CoinGecko's simple/price endpoint for INR rates.
 * Uses the optional COINGECKO_API_KEY if set.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids') || 'tether,binancecoin';
    const apiKey = process.env.COINGECKO_API_KEY;

    const url = `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=inr&include_last_updated_at=true`;

    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey;
    }

    const res = await fetch(url, { headers, next: { revalidate: 60 } }); // cache 60s
    if (!res.ok) {
      const text = await res.text();
      console.error('[coingecko] upstream error:', res.status, text);
      return NextResponse.json({ error: 'Failed to fetch CoinGecko data' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[coingecko]', err);
    return NextResponse.json({ error: 'CoinGecko request failed' }, { status: 500 });
  }
}