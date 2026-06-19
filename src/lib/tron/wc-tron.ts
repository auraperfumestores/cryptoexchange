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

// Trust Wallet's WKWebView leaves IndexedDB in a "closing" state after the tab
// is killed/reloaded, causing SignClient.init to throw on the next page load.
// A plain Map-backed storage avoids IndexedDB entirely — persistence across reloads
// isn't needed because the compact overlay starts a fresh WC session every time.
function makeMemStorage() {
  const s = new Map<string, unknown>();
  return {
    getKeys:    async () => Array.from(s.keys()),
    getEntries: async () => Array.from(s.entries()) as [string, unknown][],
    getItem:    async (key: string) => s.get(key),
    setItem:    async (key: string, value: unknown) => { s.set(key, value); },
    removeItem: async (key: string) => { s.delete(key); },
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
          name:        'SwapINR',
          description: 'USDT ↔ INR Exchange',
          url:         process.env.NEXT_PUBLIC_APP_URL ?? '',
          icons:       [`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/logo.png`],
        },
        storage: makeMemStorage() as any,
      });
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

  // Normalize signature: strip 0x prefix and convert Ethereum-style recovery byte to TRON.
  // Trust Wallet returns v=27 or v=28 (Ethereum convention); TronGrid expects v=0 or v=1.
  function normSig(sig: unknown): string[] {
    const arr = Array.isArray(sig) ? sig : [sig];
    return arr.map(s => {
      let hex = String(s ?? '').replace(/^0x/i, '');
      if (hex.length === 130) {
        const v = parseInt(hex.slice(-2), 16);
        if (v === 27 || v === 28) hex = hex.slice(0, -2) + (v - 27).toString(16).padStart(2, '0');
      }
      return hex;
    });
  }

  // The 3 canonical fields TronGrid needs for broadcast.
  const canonicalTx: Record<string, unknown> = {
    txID:         rawTx.txID,
    raw_data:     rawTx.raw_data,
    raw_data_hex: rawTx.raw_data_hex,
  };
  log(`txID=${canonicalTx.txID}`);

  // ── Attempt 1: tron_signAndSendRawTransaction ──────────────────────────────
  let signAndSendResult: unknown = null;
  let signAndSendErr: any        = null;
  try {
    log('trying tron_signAndSendRawTransaction…');
    signAndSendResult = await (client.request as any)({
      topic, chainId: TRON_WC_CHAIN,
      request: { method: 'tron_signAndSendRawTransaction', params: { transaction: canonicalTx } },
    });
    log(`signAndSend result: ${JSON.stringify(signAndSendResult)?.slice(0, 200)}`);
  } catch (err: any) {
    signAndSendErr = err;
    log(`signAndSend err: ${err?.message ?? String(err)}`);
  }

  if (signAndSendResult !== null && signAndSendResult !== undefined) {
    const txid = extractWcTxId(signAndSendResult);
    if (txid) { log(`txID from signAndSend: ${txid}`); return txid; }
    log('no txID in signAndSend result → sign+broadcast fallback');
  }

  if (signAndSendErr) {
    const msg = String(signAndSendErr?.message ?? signAndSendErr);
    if (/user rejected|user cancel|cancel|rejected/i.test(msg)) throw signAndSendErr;
  }

  // ── Attempt 2: tron_signTransaction + broadcast ────────────────────────────
  // Send the FULL rawTx (all TronGrid fields) so Trust Wallet iOS can parse it correctly.
  // Trust Wallet may need fields beyond txID/raw_data/raw_data_hex for iOS signing.
  log('tron_signTransaction (full rawTx)…');
  const signResult = await (client.request as any)({
    topic, chainId: TRON_WC_CHAIN,
    request: { method: 'tron_signTransaction', params: { transaction: rawTx } },
  });

  // Log FULL result — critical for diagnosing iOS signature issues.
  const signResultStr = JSON.stringify(signResult) ?? 'null';
  log(`signResult len=${signResultStr.length}: ${signResultStr.slice(0, 300)}`);
  if (signResultStr.length > 300) log(`signResult cont: ${signResultStr.slice(300)}`);

  // Detect whether TW returned a full signed tx or just a signature object.
  const isFullTx = signResult && typeof signResult === 'object'
    && ('raw_data' in signResult || 'raw_data_hex' in signResult);
  log(`isFullTx=${isFullTx}`);

  let signedTx: Record<string, unknown>;
  if (isFullTx) {
    // Trust Wallet returned a complete signed tx.
    // Use the txID and raw_data_hex FROM the response — TW may have modified the tx
    // (e.g. updated expiration), so its txID may differ from our original.
    signedTx = { ...(signResult as Record<string, unknown>) };
    if (signedTx.signature) signedTx.signature = normSig(signedTx.signature);
    const resultTxId = String(signedTx.txID ?? '');
    if (resultTxId && resultTxId !== canonicalTx.txID) {
      log(`txID changed by TW: orig=${String(canonicalTx.txID).slice(0,16)} new=${resultTxId.slice(0,16)}`);
    }
    log(`sig[0]=${String(Array.isArray(signedTx.signature) ? signedTx.signature[0] : signedTx.signature).slice(0,20)}…`);
  } else {
    // TW returned only a signature — merge with canonical tx.
    const sig = (signResult as any)?.signature ?? signResult;
    const normalised = normSig(sig);
    signedTx = { ...canonicalTx, signature: normalised };
    log(`sig-only sig[0]=${normalised[0]?.slice(0, 20)}…`);
  }

  log(`broadcasting txID=${String(signedTx.txID).slice(0,16)}…`);
  let txid: string;
  try {
    ({ txid } = await broadcastSignedTx(signedTx));
  } catch (broadcastErr: any) {
    const msg: string = broadcastErr?.message ?? String(broadcastErr);
    log(`broadcast ERROR: ${msg}`);
    throw broadcastErr;
  }
  log(`broadcast OK txid=${txid.slice(0,16)}…`);
  return txid;
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
