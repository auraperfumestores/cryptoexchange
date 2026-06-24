/**
 * WalletConnect v2 + TRON integration.
 *
 * Responsibilities:
 *   - Lazy-init the WC SignClient singleton (client-only, dynamic import)
 *   - Build unsigned TRON approve() transactions via TronGrid REST API
 *   - Send them to Trust Wallet (or any WC-compatible TRON wallet) for signing
 *   - Broadcast the signed transaction via TronGrid
 *   - Poll for on-chain confirmation without a tronWeb instance
 *
 * No tronweb package needed — everything goes through TronGrid's REST API.
 */

import type { SessionTypes } from '@walletconnect/types';

// ── TRON mainnet constants ─────────────────────────────────────────────────
export const TRON_WC_CHAIN   = 'tron:0x2b6653dc';
export const TRON_USDT_ADDR  = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const TRONGRID               = 'https://api.trongrid.io';

// ── Base58Check → 20-byte EVM-compatible hex ───────────────────────────────
// TRON addresses encode as: [0x41][20-byte address][4-byte checksum] (25 bytes total).
// ABI encoding needs the raw 20-byte address (the "Ethereum-compatible" portion).
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function tronToEvmHex(tronBase58: string): string {
  const buf = new Uint8Array(25);
  for (const ch of tronBase58) {
    let carry = B58.indexOf(ch);
    if (carry < 0) throw new Error(`Invalid base58 character: "${ch}"`);
    for (let i = 24; i >= 0; i--) {
      carry += 58 * buf[i];
      buf[i] = carry & 0xff;
      carry >>>= 8;
    }
  }
  // buf[0] = 0x41 (network byte), buf[1..20] = address, buf[21..24] = checksum
  return Array.from(buf.slice(1, 21))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ABI-encode approve(address,uint256) params — 128 hex chars (two 32-byte words)
function encodeApproveParams(spenderBase58: string, amountSun: bigint): string {
  const addr   = tronToEvmHex(spenderBase58).padStart(64, '0');
  const amount = amountSun.toString(16).padStart(64, '0');
  return addr + amount;
}

// ── TronGrid helpers ───────────────────────────────────────────────────────
function gridHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  // TRONGRID_API_KEY for server-side routes; NEXT_PUBLIC_TRONGRID_API_KEY for client bundles
  const key = process.env.TRONGRID_API_KEY || process.env.NEXT_PUBLIC_TRONGRID_API_KEY;
  if (key) h['TRON-PRO-API-KEY'] = key;
  return h;
}

/**
 * Build an unsigned TRON approve() raw transaction via TronGrid.
 * Returns the transaction object (txID + raw_data + raw_data_hex) ready to sign.
 */
export async function buildApproveRawTx(
  ownerBase58:   string,  // user's TRON address (from WC session)
  spenderBase58: string,  // exchange deposit address
  amountSun:     bigint,  // amount in sun (1 USDT = 1_000_000 sun)
  feeLimitSun  = 20_000_000, // 20 TRX max — approve costs ~6-7 TRX without energy
): Promise<Record<string, unknown>> {
  // Convert base58 TRON addresses to 41-prefixed hex (TronGrid hex format).
  // Removing visible:true keeps raw_data_hex in its canonical protobuf encoding so
  // Trust Wallet signs exactly the bytes TronGrid will validate against.
  function toHexAddr(base58: string): string {
    return '41' + tronToEvmHex(base58);
  }
  const body = {
    owner_address:     toHexAddr(ownerBase58),
    contract_address:  toHexAddr(TRON_USDT_ADDR),
    function_selector: 'approve(address,uint256)',
    parameter:         encodeApproveParams(spenderBase58, amountSun),
    fee_limit:         feeLimitSun,
    call_value:        0,
  };

  const res = await fetch(`${TRONGRID}/wallet/triggersmartcontract`, {
    method: 'POST',
    headers: gridHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`TronGrid error ${res.status}: ${res.statusText}`);

  const data = await res.json();
  if (data?.result?.result !== true) {
    const msg = data?.result?.message
      ? decodeURIComponent(data.result.message)
      : 'TronGrid failed to build transaction';
    throw new Error(msg);
  }

  return data.transaction as Record<string, unknown>;
}

// TronGrid returns error messages as hex-encoded UTF-8 bytes — decode them for readability.
function decodeTronMsg(msg: unknown): string {
  const s = String(msg ?? '');
  if (/^[0-9a-fA-F]{10,}$/.test(s) && s.length % 2 === 0) {
    try {
      const bytes = new Uint8Array(s.match(/.{2}/g)!.map(h => parseInt(h, 16)));
      return new TextDecoder().decode(bytes);
    } catch { /* fallthrough */ }
  }
  return s || 'Broadcast failed — transaction rejected by network';
}

/** Broadcast a signed TRON transaction via TronGrid. */
export async function broadcastSignedTx(
  signedTx: Record<string, unknown>,
): Promise<{ txid: string }> {
  const res = await fetch(`${TRONGRID}/wallet/broadcasttransaction`, {
    method: 'POST',
    headers: gridHeaders(),
    body: JSON.stringify(signedTx),
  });
  if (!res.ok) throw new Error(`Broadcast error ${res.status}: ${res.statusText}`);

  const data = await res.json();
  if (!data?.result) {
    const errMsg = decodeTronMsg(data?.message);
    // Log the full TronGrid broadcast response for diagnosis
    console.error('[broadcast] TronGrid rejected:', JSON.stringify(data)?.slice(0, 400));
    throw new Error(errMsg);
  }

  const txid = (data.txid ?? signedTx.txID ?? '') as string;
  if (!txid) throw new Error('Transaction broadcast succeeded but no txID returned');
  return { txid };
}

/**
 * Poll TronGrid until the transaction is confirmed on-chain (max 90 s).
 * Used in place of tronWeb.trx.getTransactionInfo for the WalletConnect path.
 */
export async function pollTronTxGrid(txId: string): Promise<void> {
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const res = await fetch(`${TRONGRID}/wallet/gettransactioninfobyid`, {
        method: 'POST',
        headers: gridHeaders(),
        body: JSON.stringify({ value: txId }),
      });
      const data = await res.json();
      if (data?.id || data?.receipt) return;
    } catch { /* network hiccup — keep polling */ }
  }
  // Timeout — tx was broadcast and user confirmed, treat as success
}

// ── WalletConnect SignClient (singleton, client-only, lazily initialised) ──
// Dynamic import ensures this never runs during SSR.
let _client: any = null;
let _clientPromise: Promise<any> | null = null;

// sessionStorage-backed WC storage: preserves pairing + crypto keys across the
// Trust Wallet DApp browser reload that occurs when TW navigates back after the
// user approves a WC connection. With in-memory storage the approval event (queued
// on the relay while iOS suspended JavaScript) would be delivered to a fresh client
// that knows nothing about the old pairing, requiring the user to approve twice.
// Falls back to a plain Map if sessionStorage is unavailable (SSR / private mode).
function makeWcStorage() {
  const PREFIX = 'swappinr_wc_';
  let mem: Map<string, unknown> | null = null;
  function ss() {
    try { return typeof sessionStorage !== 'undefined' ? sessionStorage : null; } catch { return null; }
  }
  function fb() { if (!mem) mem = new Map(); return mem; }
  return {
    getKeys: async () => {
      const s = ss();
      return s
        ? Object.keys(s).filter(k => k.startsWith(PREFIX)).map(k => k.slice(PREFIX.length))
        : Array.from(fb().keys());
    },
    getEntries: async () => {
      const s = ss();
      if (s) {
        return Object.keys(s)
          .filter(k => k.startsWith(PREFIX))
          .map(k => {
            try { return [k.slice(PREFIX.length), JSON.parse(s.getItem(k) || 'null')] as [string, unknown]; }
            catch { return [k.slice(PREFIX.length), null] as [string, unknown]; }
          });
      }
      return Array.from(fb().entries()) as [string, unknown][];
    },
    getItem: async (key: string) => {
      const s = ss();
      if (s) { try { const v = s.getItem(PREFIX + key); return v ? JSON.parse(v) : undefined; } catch { return undefined; } }
      return fb().get(key);
    },
    setItem: async (key: string, value: unknown) => {
      const s = ss();
      if (s) { try { s.setItem(PREFIX + key, JSON.stringify(value)); return; } catch {} }
      fb().set(key, value);
    },
    removeItem: async (key: string) => {
      const s = ss();
      if (s) { try { s.removeItem(PREFIX + key); return; } catch {} }
      fb().delete(key);
    },
  };
}

export async function getWcSignClient(): Promise<any> {
  if (_client) return _client;
  if (_clientPromise) return _clientPromise;

  _clientPromise = (async () => {
    try {
      const { SignClient } = await import('@walletconnect/sign-client');
      _client = await SignClient.init({
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '',
        metadata: {
          name:        'SwappINR',
          description: 'USDT ↔ INR Exchange',
          url:         process.env.NEXT_PUBLIC_APP_URL ?? '',
          icons:       [`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/logo.png`],
        },
        storage: makeWcStorage() as any,
      });
      // Force relay WebSocket to reopen when iOS resumes the page from background.
      // WKWebView suspends JS (and drops the WebSocket) while TW's approval screen is
      // showing; without this the queued session-approval event is never delivered.
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && _client) {
            _client.core?.relayer?.transportOpen?.().catch(() => {});
          }
        });
      }
      return _client;
    } catch (err) {
      // Reset so the next call gets a fresh attempt instead of the same rejected promise
      _client = null;
      _clientPromise = null;
      throw err;
    }
  })();

  return _clientPromise;
}

/**
 * Check whether the WC client already has an approved TRON session (e.g. from a
 * previous page load that was reloaded by the Trust Wallet DApp browser after the
 * user approved the connection).
 *
 * Polls for up to `timeoutMs` ms to allow the relay to deliver any approval event
 * that was queued while the page was suspended, but returns immediately (null) when
 * there are no pending pairings so the normal first-connect path has no added delay.
 */
export async function getExistingTronWcSession(
  timeoutMs = 2500,
): Promise<SessionTypes.Struct | null> {
  const client = await getWcSignClient();
  const now = Math.floor(Date.now() / 1000);

  const findSession = (): SessionTypes.Struct | null => {
    const all: SessionTypes.Struct[] = client.session?.getAll?.() ?? [];
    return all.find(s =>
      (s.namespaces?.tron?.accounts?.length ?? 0) > 0 &&
      (s.expiry ?? 0) > now,
    ) ?? null;
  };

  // Immediate check — covers the case where approval resolved before the reload
  const immediate = findSession();
  if (immediate) return immediate;

  // Only poll if there are stored pairings that might still have a queued relay event
  const activePairings = (client.pairing?.getAll?.() ?? [])
    .filter((p: any) => (p.expiry ?? 0) > now);
  if (activePairings.length === 0) return null;

  return new Promise(resolve => {
    let resolved = false;
    const interval = setInterval(() => {
      const s = findSession();
      if (s) { resolved = true; clearInterval(interval); resolve(s); }
    }, 250);
    setTimeout(() => { if (!resolved) { clearInterval(interval); resolve(null); } }, timeoutMs);
  });
}

/**
 * Start a WC pairing session for TRON.
 * Returns the pairing URI (for QR code / deep link) and an `approval` function
 * that resolves with the SessionTypes.Struct once the user approves in their wallet.
 */
export async function createTronWcSession(): Promise<{
  uri:      string;
  approval: () => Promise<SessionTypes.Struct>;
}> {
  const client = await getWcSignClient();
  const { uri, approval } = await client.connect({
    requiredNamespaces: {
      tron: {
        chains:  [TRON_WC_CHAIN],
        methods: ['tron_signTransaction', 'tron_signMessage', 'tron_signAndSendRawTransaction'],
        events:  ['accountsChanged', 'chainChanged'],
      },
    },
    // tron_method_version v1 tells the wallet to use the flat transaction format.
    // Without it some wallets (Trust Wallet) sign a nested wrapper object and return
    // a static/invalid signature. v1 = sign the raw transaction directly.
    sessionProperties: {
      tron_method_version: 'v1',
    },
  });
  if (!uri) throw new Error('WalletConnect did not generate a pairing URI');
  return { uri, approval };
}

/**
 * Extract the TRON base58 address from an established WC session.
 * WC account format: "tron:0x2b6653dc:T<base58address>"
 */
export function tronAddressFromWcSession(session: SessionTypes.Struct): string {
  const accounts = session.namespaces?.tron?.accounts ?? [];
  const addr = accounts[0]?.split(':').at(-1) ?? '';
  if (!addr) throw new Error('No TRON address found in WalletConnect session');
  return addr;
}

/**
 * Request the wallet to sign a raw TRON transaction via WalletConnect.
 * The wallet (Trust Wallet) will display a native signing prompt to the user.
 * Returns the signed transaction object (raw tx + signature array).
 */
export async function wcSignTronTx(
  topic:  string,
  rawTx:  Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const client = await getWcSignClient();
  const signed = await (client.request as any)({
    topic,
    chainId: TRON_WC_CHAIN,
    request: {
      method: 'tron_signTransaction',
      params: { transaction: rawTx },
    },
  });
  return signed;
}

/**
 * Request Trust Wallet to sign AND broadcast the TRON transaction in one step.
 * Uses `tron_signAndSendRawTransaction` — Trust Wallet handles the broadcast itself
 * and returns the txID directly, bypassing our broadcastSignedTx() call.
 *
 * Falls back to the two-step sign → broadcast path if Trust Wallet rejects the method
 * (older builds that don't support tron_signAndSendRawTransaction).
 *
 * To revert to the two-step path: replace the call in CheckoutFlow.tsx with
 *   wcSignTronTx + broadcastSignedTx (see wcSignTronTx above).
 */
/** Extract txID from any WalletConnect TRON response shape Trust Wallet may return. */
function extractWcTxId(result: unknown): string {
  if (typeof result === 'string' && result.length >= 60) return result;
  if (!result || typeof result !== 'object') return '';
  const r = result as Record<string, any>;
  // { txID }, { txid }, { result: "txid" }, { transaction: { txID } }
  if (typeof r.txID === 'string'  && r.txID.length  >= 60) return r.txID;
  if (typeof r.txid === 'string'  && r.txid.length  >= 60) return r.txid;
  if (typeof r.result === 'string' && r.result.length >= 60) return r.result;
  if (typeof r.hash  === 'string' && r.hash.length  >= 60) return r.hash;
  if (r.transaction?.txID  && String(r.transaction.txID).length  >= 60) return String(r.transaction.txID);
  if (r.transaction?.txid  && String(r.transaction.txid).length  >= 60) return String(r.transaction.txid);
  return '';
}

export async function wcSignAndSendTronTx(
  topic:  string,
  rawTx:  Record<string, unknown>,
  debug?: (msg: string) => void,
): Promise<string> {
  const log = (msg: string) => { console.log('[wc-tron]', msg); debug?.(msg); };
  const client = await getWcSignClient();

  // Strip the 0x prefix that Trust Wallet prepends to signatures.
  // Do NOT normalise the recovery byte (v) — TronGrid accepts the raw v from the wallet.
  function stripSig(sig: unknown): string[] {
    const arr = Array.isArray(sig) ? sig : [sig];
    return arr.map(s => String(s ?? '').replace(/^0x/i, ''));
  }

  // Log what methods TW actually approved so we can detect support.
  try {
    const session  = client.session.get(topic);
    const methods  = session?.namespaces?.tron?.methods ?? [];
    log(`session tron methods: [${methods.join(', ')}]`);
  } catch {}

  log(`txID=${rawTx.txID}`);

  // ── Attempt 1: tron_signAndSendRawTransaction ──────────────────────────────
  // Works on Android WC-only wallets and some desktop wallets.
  // Trust Wallet iOS does NOT include this method in its approved namespace and
  // will return "Unauthorized" — that's caught and skipped without throwing.
  let signAndSendResult: unknown = null;
  try {
    log('trying tron_signAndSendRawTransaction…');
    signAndSendResult = await (client.request as any)({
      topic, chainId: TRON_WC_CHAIN,
      request: { method: 'tron_signAndSendRawTransaction', params: { transaction: rawTx } },
    });
    log(`signAndSend result: ${JSON.stringify(signAndSendResult)?.slice(0, 200)}`);
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    log(`signAndSend err: ${msg}`);
    if (/user rejected|user cancel|cancel|rejected/i.test(msg)) throw err;
    // "Missing or invalid method" (WC SDK) or "Unauthorized" (TW iOS) — fall through.
  }

  if (signAndSendResult !== null && signAndSendResult !== undefined) {
    const txid = extractWcTxId(signAndSendResult);
    if (txid) { log(`txID from signAndSend: ${txid}`); return txid; }
    log('no txID in signAndSend result → sign+broadcast fallback');
  }

  // ── Attempt 2: tron_signTransaction + broadcast ────────────────────────────
  // NOTE: Trust Wallet iOS WC returns a STATIC pre-stored signature for any transaction
  // (confirmed identical bytes across 4 separate test runs with different txIDs).
  // The broadcast will fail with "Validate signature error" — we detect that and throw
  // TRON_WC_UNSUPPORTED so the UI can show a QR code for TronLink as fallback.
  log('tron_signTransaction (full rawTx)…');
  const signResult = await (client.request as any)({
    topic, chainId: TRON_WC_CHAIN,
    request: { method: 'tron_signTransaction', params: { transaction: rawTx } },
  });

  const signResultStr = JSON.stringify(signResult) ?? 'null';
  log(`signResult len=${signResultStr.length}: ${signResultStr.slice(0, 300)}`);

  const isFullTx = signResult && typeof signResult === 'object'
    && ('raw_data' in signResult || 'raw_data_hex' in signResult);
  log(`isFullTx=${isFullTx}`);

  let signedTx: Record<string, unknown>;
  if (isFullTx) {
    signedTx = { ...(signResult as Record<string, unknown>) };
    if (signedTx.signature) signedTx.signature = stripSig(signedTx.signature);
    const resultTxId = String(signedTx.txID ?? '');
    if (resultTxId && resultTxId !== String(rawTx.txID ?? '')) {
      log(`txID changed by TW: orig=${String(rawTx.txID).slice(0,16)} new=${resultTxId.slice(0,16)}`);
    }
    log(`sig[0]=${String(Array.isArray(signedTx.signature) ? signedTx.signature[0] : signedTx.signature).slice(0,20)}…`);
  } else {
    const sig     = (signResult as any)?.signature ?? signResult;
    const stripped = stripSig(sig);
    signedTx = { ...rawTx, signature: stripped };
    log(`sig-only sig[0]=${stripped[0]?.slice(0, 20)}… v=0x${stripped[0]?.slice(-2)}`);
  }

  log(`broadcasting txID=${String(signedTx.txID).slice(0,16)}…`);
  try {
    const { txid } = await broadcastSignedTx(signedTx);
    log(`broadcast OK txid=${txid.slice(0,16)}…`);
    return txid;
  } catch (broadcastErr: any) {
    const msg = String(broadcastErr?.message ?? broadcastErr);
    log(`broadcast ERROR: ${msg}`);
    if (/Validate signature/i.test(msg)) {
      // Static/garbage signature — Trust Wallet iOS WC cannot sign TRON transactions.
      throw new Error(
        'TRON_WC_UNSUPPORTED: Trust Wallet iOS returned an invalid signature. ' +
        'Please open this page in TronLink on your phone, or use Trust Wallet on Android.'
      );
    }
    throw broadcastErr;
  }
}

/**
 * Signs an arbitrary UTF-8 message via WalletConnect tron_signMessage.
 * Returns the raw signature string (0x-prefixed or plain hex).
 */
export async function wcSignMessage(
  topic: string,
  message: string,
  debug?: (msg: string) => void,
): Promise<string> {
  const log = (msg: string) => { console.log('[wc-tron]', msg); debug?.(msg); };
  const client = await getWcSignClient();
  const msgHex = Array.from(new TextEncoder().encode(message))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  log(`tron_signMessage text="${message.slice(0, 40)}" hexLen=${msgHex.length}`);
  const result = await (client.request as any)({
    topic, chainId: TRON_WC_CHAIN,
    request: { method: 'tron_signMessage', params: { message: msgHex } },
  });
  log(`tron_signMessage result: ${JSON.stringify(result)?.slice(0, 120)}`);
  const sig = (result as any)?.signature ?? String(result ?? '');
  if (!sig) throw new Error('tron_signMessage: empty signature returned');
  return sig;
}

/** Gracefully terminate an active WC session. */
export async function wcDisconnectTron(topic: string): Promise<void> {
  try {
    const client = await getWcSignClient();
    await client.disconnect({ topic, reason: { code: 6000, message: 'User disconnected' } });
  } catch { /* session may already be gone */ }
}
