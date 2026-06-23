const COOKIE_NAME   = 'cf_v';
const COOKIE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const SECRET = process.env.NEXTAUTH_SECRET ?? '';

/** Verifies a Cloudflare Turnstile response token against Cloudflare's siteverify API.
 *  If TURNSTILE_SECRET_KEY isn't configured yet, protection is skipped (dev fallback)
 *  so the app keeps working until the keys are added. */
export async function verifyTurnstileToken(token: string | undefined | null, ip?: string | null): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification');
    return true;
  }
  if (!token) return false;

  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (ip) body.set('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

/* Web Crypto (SubtleCrypto) HMAC — works in both the Edge middleware runtime
 * and Node.js route handlers, unlike Node's `crypto.createHmac`. */
async function hmacHex(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Signs an expiry timestamp so the "verified" cookie can't be forged. */
export async function signCookieValue(expiresAtMs: number): Promise<string> {
  const sig = await hmacHex(String(expiresAtMs));
  return `${expiresAtMs}.${sig}`;
}

export async function isCookieValid(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const [expiresAtStr, sig] = value.split('.');
  const expiresAtMs = Number(expiresAtStr);
  if (!expiresAtMs || !sig || Date.now() > expiresAtMs) return false;
  const expectedSig = await hmacHex(expiresAtStr);
  return sig === expectedSig;
}

export { COOKIE_NAME, COOKIE_TTL_MS };
