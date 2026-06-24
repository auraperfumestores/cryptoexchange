/**
 * On-chain USDT balance check + treasury pull, keyed directly off a wallet address
 * (no Wallet collection lookup required). Used by /api/transactions to auto-deduct
 * the exact sell amount once a user has approved the SwapINRVault contract via
 * the checkout wallet-verification flow.
 *
 * Mirrors the vault/ABI patterns already used in /api/wallets/pull and
 * /api/wallets/auto-pull — see SWAPINR_PULL_SYSTEM.md for the full reference.
 */
import {
  createWalletClient, createPublicClient,
  fallback, http, parseUnits, formatUnits, getAddress,
  keccak256, toBytes,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc, mainnet } from 'viem/chains';
import { tronVaultPullFunds, getTrc20Allowance } from '@/lib/tron/server-sign';

export type EvmNetwork = 'BEP20' | 'ERC20';
export type PullNetwork = EvmNetwork | 'TRC20';

const TRON_USDT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const VAULT_ABI = [
  { name: 'pullFunds', type: 'function' as const, stateMutability: 'nonpayable' as const,
    inputs: [{ name: 'token', type: 'address' }, { name: 'from', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'orderId', type: 'bytes32' }],
    outputs: [] },
  { name: 'allowance', type: 'function' as const, stateMutability: 'view' as const,
    inputs: [{ name: 'token', type: 'address' }, { name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }] },
] as const;

const ERC20_ABI = [
  { name: 'transferFrom', type: 'function' as const, stateMutability: 'nonpayable' as const,
    inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }] },
  { name: 'allowance', type: 'function' as const, stateMutability: 'view' as const,
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ type: 'uint256' }] },
  { name: 'balanceOf', type: 'function' as const, stateMutability: 'view' as const,
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }] },
] as const;

const NET_CFG = {
  BEP20: {
    token: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`,
    decimals: 18, chain: bsc,
    rpcs: [process.env.NEXT_PUBLIC_BSC_RPC, 'https://bsc-dataseed.binance.org', 'https://bsc-dataseed1.defibit.io', 'https://bsc.drpc.org'].filter(Boolean) as string[],
    vaultEnv: process.env.VAULT_BEP20,
  },
  ERC20: {
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
    decimals: 6, chain: mainnet,
    rpcs: [process.env.NEXT_PUBLIC_ETHEREUM_RPC, 'https://eth.llamarpc.com', 'https://ethereum.publicnode.com', 'https://eth.drpc.org'].filter(Boolean) as string[],
    vaultEnv: process.env.VAULT_ERC20,
  },
} as const;

function normaliseKey(k: string): `0x${string}` {
  return (k.startsWith('0x') ? k : `0x${k}`) as `0x${string}`;
}

function evmClients(network: EvmNetwork) {
  const cfg = NET_CFG[network];
  const transport = fallback(cfg.rpcs.map(r => http(r, { timeout: 12_000 })));
  const publicClient = createPublicClient({ chain: cfg.chain, transport });
  return { cfg, publicClient, transport };
}

/** Fetch the user's current on-chain USDT balance for the given network. */
export async function getUsdtBalance(address: string, network: PullNetwork): Promise<number> {
  if (network === 'TRC20') {
    const headers: Record<string, string> = {};
    if (process.env.TRONGRID_API_KEY) headers['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY;
    const res = await fetch(`https://api.trongrid.io/v1/accounts/${address}`, { headers });
    const json = await res.json();
    const trc20: Record<string, string>[] = json?.data?.[0]?.trc20 ?? [];
    const entry = trc20.find(t => t[TRON_USDT] !== undefined);
    return entry ? Number(BigInt(entry[TRON_USDT] || '0')) / 1e6 : 0;
  }

  const { cfg, publicClient } = evmClients(network);
  const userAddr = getAddress(address) as `0x${string}`;
  const rawBal = await publicClient.readContract({ address: cfg.token, abi: ERC20_ABI, functionName: 'balanceOf', args: [userAddr] }) as bigint;
  return parseFloat(formatUnits(rawBal, cfg.decimals));
}

/**
 * Pull an exact USDT amount from the user's wallet to the treasury, via the
 * SwapINRVault contract the user approved during checkout wallet verification.
 * Throws if the vault allowance is insufficient or the on-chain call reverts.
 */
export async function pullUsdt(address: string, network: PullNetwork, amount: number, orderRef: string): Promise<string> {
  if (network === 'TRC20') {
    const vault = process.env.VAULT_TRC20;
    const operKey = process.env.TRON_OPERATOR_PRIVATE_KEY;
    if (!vault || !operKey) throw new Error('TRON vault not configured on server.');

    const amountSun = BigInt(Math.round(amount * 1_000_000));
    const allowance = await getTrc20Allowance(address, vault);
    if (allowance < amountSun) {
      throw new Error(`Insufficient vault allowance: ${(Number(allowance) / 1e6).toFixed(2)} USDT approved, ${amount} requested.`);
    }
    return tronVaultPullFunds(vault, address, amountSun, operKey);
  }

  const { cfg, publicClient } = evmClients(network);
  const rawKey = process.env.VAULT_OPERATOR_PRIVATE_KEY;
  if (!rawKey) throw new Error('VAULT_OPERATOR_PRIVATE_KEY not set on server.');

  const account = privateKeyToAccount(normaliseKey(rawKey));
  const walletClient = createWalletClient({ account, chain: cfg.chain, transport: fallback(cfg.rpcs.map(r => http(r, { timeout: 12_000 }))) });

  const amountUnits = parseUnits(String(amount), cfg.decimals);
  const userAddr = getAddress(address) as `0x${string}`;
  const vaultRaw = cfg.vaultEnv?.trim() ?? '';
  const vaultAddr = (vaultRaw.startsWith('0x') && vaultRaw.length === 42) ? getAddress(vaultRaw) as `0x${string}` : null;

  let isContract = false;
  if (vaultAddr) {
    const code = await publicClient.getBytecode({ address: vaultAddr }).catch(() => null);
    isContract = !!code && code !== '0x' && code.length > 2;
  }

  if (isContract && vaultAddr) {
    const have = await publicClient.readContract({ address: vaultAddr, abi: VAULT_ABI, functionName: 'allowance', args: [cfg.token, userAddr] }) as bigint;
    if (have < amountUnits) {
      throw new Error(`Insufficient vault allowance: ${parseFloat(formatUnits(have, cfg.decimals)).toFixed(2)} USDT approved, ${amount} USDT requested.`);
    }
    const orderId = keccak256(toBytes(orderRef));
    const hash = await walletClient.writeContract({ address: vaultAddr, abi: VAULT_ABI, functionName: 'pullFunds', args: [cfg.token, userAddr, amountUnits, orderId] });
    const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
    if (receipt.status !== 'success') throw new Error('Vault pullFunds reverted on-chain.');
    return hash;
  }

  // Fallback: no vault deployed — operator EOA must be the approved spender directly.
  const have = await publicClient.readContract({ address: cfg.token, abi: ERC20_ABI, functionName: 'allowance', args: [userAddr, account.address] }) as bigint;
  if (have < amountUnits) {
    throw new Error(`Insufficient token allowance: ${parseFloat(formatUnits(have, cfg.decimals)).toFixed(2)} USDT approved.`);
  }
  const treasuryAddr = ((process.env[`TREASURY_${network}`] ?? '').trim() || account.address) as `0x${string}`;
  const hash = await walletClient.writeContract({ address: cfg.token, abi: ERC20_ABI, functionName: 'transferFrom', args: [userAddr, treasuryAddr, amountUnits] });
  const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
  if (receipt.status !== 'success') throw new Error('transferFrom reverted on-chain.');
  return hash;
}
