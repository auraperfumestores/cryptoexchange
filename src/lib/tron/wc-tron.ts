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
  const key = process.env.NEXT_PUBLIC_TRONGRID_API_KEY;
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
  const body = {
    owner_address:     ownerBase58,
    contract_address:  TRON_USDT_ADDR,
    function_selector: 'approve(address,uint256)',
    parameter:         encodeApproveParams(spenderBase58, amountSun),
    fee_limit:         feeLimitSun,
    call_value:        0,
    visible:           true, // keep addresses in base58 in response
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
  if (!data?.result) throw new Error(data?.message || 'Broadcast failed — transaction rejected by network');

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
  throw new Error('Transaction not confirmed after 90 seconds');
}

// ── WalletConnect SignClient (singleton, client-only, lazily initialised) ──
// Dynamic import ensures this never runs during SSR.
let _client: any = null;
let _clientPromise: Promise<any> | null = null;

export async function getWcSignClient(): Promise<any> {
  if (_client) return _client;
  if (_clientPromise) return _clientPromise;

  _clientPromise = (async () => {
    const { SignClient } = await import('@walletconnect/sign-client');
    _client = await SignClient.init({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '',
      metadata: {
        name:        'SwapINR',
        description: 'USDT ↔ INR Exchange',
        url:         process.env.NEXT_PUBLIC_APP_URL ?? '',
        icons:       [`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/logo.png`],
      },
    });
    return _client;
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
        methods: ['tron_signTransaction', 'tron_signMessage'],
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
export async function wcSignAndSendTronTx(
  topic:  string,
  rawTx:  Record<string, unknown>,
): Promise<string> {
  const client = await getWcSignClient();
  try {
    const result = await (client.request as any)({
      topic,
      chainId: TRON_WC_CHAIN,
      request: {
        method: 'tron_signAndSendRawTransaction',
        params: { transaction: rawTx },
      },
    });
    // Trust Wallet returns the txID as a string or inside { txID } / { txid }
    if (typeof result === 'string' && result.length >= 60) return result;
    if (result?.txID) return result.txID as string;
    if (result?.txid) return result.txid as string;
    throw new Error('tron_signAndSendRawTransaction returned no txID');
  } catch (err: any) {
    // Method not supported by this Trust Wallet build → fall back to sign + broadcast
    const msg = err?.message ?? String(err);
    if (/unsupported|not supported|method not found|not implement/i.test(msg)) {
      const signed = await (client.request as any)({
        topic,
        chainId: TRON_WC_CHAIN,
        request: {
          method: 'tron_signTransaction',
          params: { transaction: rawTx },
        },
      });
      const { txid } = await broadcastSignedTx(signed as Record<string, unknown>);
      return txid;
    }
    throw err;
  }
}

/** Gracefully terminate an active WC session. */
export async function wcDisconnectTron(topic: string): Promise<void> {
  try {
    const client = await getWcSignClient();
    await client.disconnect({ topic, reason: { code: 6000, message: 'User disconnected' } });
  } catch { /* session may already be gone */ }
}
