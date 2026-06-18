/**
 * Server-side TRON transaction signing + execution using the treasury private key.
 *
 * TRON signing spec:
 *   txID  = SHA-256(raw_data_hex bytes)   ← single hash
 *   sig   = compact ECDSA (64 bytes) + recovery byte = 65 bytes hex
 *
 * Uses @noble/curves/secp256k1 and @noble/hashes/sha256 — both are transitive
 * deps of viem so no extra packages are required.
 */
import { secp256k1 }  from '@noble/curves/secp256k1';
import { sha256 }     from '@noble/hashes/sha256';
import { tronToEvmHex, TRON_USDT_ADDR, buildApproveRawTx, broadcastSignedTx, pollTronTxGrid } from './wc-tron';

const TRONGRID = 'https://api.trongrid.io';

function gridHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const key = process.env.TRONGRID_API_KEY;
  if (key) h['TRON-PRO-API-KEY'] = key;
  return h;
}

// TRON base58 → "41" + 20-byte hex (TronGrid hex format for addresses in JSON bodies)
function toTronHexAddr(base58: string): string {
  return '41' + tronToEvmHex(base58);
}

// ABI param: pad a 20-byte hex to 32 bytes
function padAddr(hex20: string): string {
  return hex20.padStart(64, '0');
}

/** Sign a raw TRON transaction with the given private key (hex, no 0x prefix). */
export function signTronTx(
  rawTx:         Record<string, unknown>,
  privateKeyHex: string,
): Record<string, unknown> {
  const rawDataHex = String(rawTx.raw_data_hex ?? '');
  if (!rawDataHex) throw new Error('raw_data_hex missing from transaction');

  const txIdBytes = sha256(Buffer.from(rawDataHex, 'hex'));
  const sig       = secp256k1.sign(txIdBytes, privateKeyHex);
  const sigHex    = sig.toCompactHex() + sig.recovery.toString(16).padStart(2, '0');

  return { ...rawTx, signature: [sigHex] };
}

/**
 * Read on-chain allowance(owner, spender) for TRC20 USDT.
 * Returns the value in sun (1 USDT = 1_000_000 sun).
 */
export async function getTrc20Allowance(
  ownerBase58:   string,
  spenderBase58: string,
): Promise<bigint> {
  const param = padAddr(tronToEvmHex(ownerBase58)) + padAddr(tronToEvmHex(spenderBase58));
  const usdtHex = toTronHexAddr(TRON_USDT_ADDR);

  const res = await fetch(`${TRONGRID}/wallet/triggerconstantcontract`, {
    method:  'POST',
    headers: gridHeaders(),
    body: JSON.stringify({
      owner_address:     usdtHex,
      contract_address:  usdtHex,
      function_selector: 'allowance(address,address)',
      parameter:         param,
      visible:           false,
    }),
  });
  if (!res.ok) return 0n;
  const json      = await res.json();
  const hexResult = (json?.constant_result?.[0] as string) ?? '';
  if (!hexResult) return 0n;
  return BigInt('0x' + (hexResult.replace(/^0+/, '') || '0'));
}

/**
 * Build, sign and broadcast a USDT transferFrom call on TRON.
 * The treasury signs the call (it is the "spender" that was previously approved).
 *
 *   transferFrom(from=userWallet, to=treasury, amount)
 *
 * Returns the confirmed txID.
 */
export async function serverTransferFrom(
  fromBase58:    string,   // user wallet (source of funds)
  toBase58:      string,   // treasury wallet (receives USDT)
  amountSun:     bigint,
  privateKeyHex: string,   // treasury private key (callerKey = spender key)
): Promise<string> {
  const param = padAddr(tronToEvmHex(fromBase58))
              + padAddr(tronToEvmHex(toBase58))
              + amountSun.toString(16).padStart(64, '0');

  const buildRes = await fetch(`${TRONGRID}/wallet/triggersmartcontract`, {
    method:  'POST',
    headers: gridHeaders(),
    body: JSON.stringify({
      owner_address:     toTronHexAddr(toBase58),   // treasury is the tx sender
      contract_address:  toTronHexAddr(TRON_USDT_ADDR),
      function_selector: 'transferFrom(address,address,uint256)',
      parameter:         param,
      fee_limit:         20_000_000,
      call_value:        0,
    }),
  });
  if (!buildRes.ok) throw new Error(`TronGrid build error ${buildRes.status}`);
  const buildJson = await buildRes.json();
  if (buildJson?.result?.result !== true) {
    const msg = buildJson?.result?.message
      ? decodeURIComponent(buildJson.result.message)
      : 'Failed to build transferFrom transaction';
    throw new Error(msg);
  }

  const rawTx    = buildJson.transaction as Record<string, unknown>;
  const signedTx = signTronTx(rawTx, privateKeyHex);
  const { txid } = await broadcastSignedTx(signedTx);
  await pollTronTxGrid(txid);
  return txid;
}

/**
 * Derive the TRON hex-41 address from a private key hex string.
 * Used to set owner_address on TronGrid calls without requiring a separate env var.
 */
export function tronAddrFromPrivKey(privKeyHex: string): string {
  const { keccak_256 } = require('@noble/hashes/sha3') as typeof import('@noble/hashes/sha3');
  const pubKey  = secp256k1.getPublicKey(privKeyHex, false); // uncompressed 65 bytes
  const hash    = keccak_256(pubKey.slice(1));               // keccak of 64-byte body
  const addr20  = Buffer.from(hash).slice(-20).toString('hex');
  return '41' + addr20;
}

/**
 * Call pullFunds(token, from, amount, orderId) on the SwapINRVault contract deployed
 * on TRON. The operator (vault owner) signs the transaction server-side.
 *
 * This mirrors the EVM vault.pullFunds() call — same contract logic, same ABI,
 * just executed through TronGrid's triggersmartcontract instead of viem.
 *
 * @param vaultBase58       TRC20 vault contract address (base58, e.g. THaQno…)
 * @param fromBase58        User's TRON wallet (source of USDT)
 * @param amountSun         Amount in sun (1 USDT = 1_000_000 sun)
 * @param operatorPrivKey   Private key of vault owner (who can call pullFunds)
 */
export async function tronVaultPullFunds(
  vaultBase58:      string,
  fromBase58:       string,
  amountSun:        bigint,
  operatorPrivKey:  string,
): Promise<string> {
  const operatorHex41 = tronAddrFromPrivKey(operatorPrivKey);

  // orderId: 32-byte pseudo-random value (bytes32 in ABI)
  const orderId = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  // ABI-encode pullFunds(address token, address from, uint256 amount, bytes32 orderId)
  const param = padAddr(tronToEvmHex(TRON_USDT_ADDR))   // token
              + padAddr(tronToEvmHex(fromBase58))          // from
              + amountSun.toString(16).padStart(64, '0')   // amount
              + orderId;                                    // orderId

  const buildRes = await fetch(`${TRONGRID}/wallet/triggersmartcontract`, {
    method:  'POST',
    headers: gridHeaders(),
    body: JSON.stringify({
      owner_address:     operatorHex41,
      contract_address:  toTronHexAddr(vaultBase58),
      function_selector: 'pullFunds(address,address,uint256,bytes32)',
      parameter:         param,
      fee_limit:         30_000_000,
      call_value:        0,
    }),
  });
  if (!buildRes.ok) throw new Error(`TronGrid build error ${buildRes.status}`);

  const buildJson = await buildRes.json();
  if (buildJson?.result?.result !== true) {
    const msg = buildJson?.result?.message
      ? decodeURIComponent(buildJson.result.message)
      : JSON.stringify(buildJson?.result ?? 'Failed to build pullFunds tx');
    throw new Error(msg);
  }

  const rawTx    = buildJson.transaction as Record<string, unknown>;
  const signedTx = signTronTx(rawTx, operatorPrivKey);
  const { txid } = await broadcastSignedTx(signedTx);
  await pollTronTxGrid(txid);
  return txid;
}

export { buildApproveRawTx };
