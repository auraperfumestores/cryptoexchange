import { z } from 'zod';

const evmAddress = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address');

const txHash = z
  .string()
  .trim()
  .regex(/^(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})$/, 'Invalid transaction hash');

export const createSellSchema = z.object({
  cryptoSymbol: z.enum(['USDT', 'BNB']),
  network: z.enum(['ERC20', 'BEP20', 'TRC20']),
  cryptoAmount: z.coerce.number().positive('Amount must be greater than 0').max(1_000_000, 'Amount is too large'),
  walletAddress: z.string().trim().min(8, 'Wallet address is required').max(200),
  clientNotes: z.string().trim().max(500).optional(),
  paymentMethodId: z.string().trim().optional(),
});

export const createBuySchema = z.object({
  cryptoSymbol: z.enum(['USDT', 'BNB']),
  network: z.enum(['ERC20', 'BEP20', 'TRC20']),
  cryptoAmount: z.coerce.number().positive('Amount must be greater than 0').max(1_000_000, 'Amount is too large'),
  walletAddress: z.string().trim().min(8, 'Wallet address is required').max(200),
  paymentMethodId: z.string().trim().min(1, 'Select a payment method'),
  clientNotes: z.string().trim().max(500).optional(),
});

export const submitTxHashSchema = z.object({
  txHash,
});

export const submitPaymentProofSchema = z.object({
  paymentProofUrl: z.string().url('Upload a valid screenshot'),
  clientNotes: z.string().trim().max(500).optional(),
});

export const adminUpdateStatusSchema = z.object({
  status: z.enum([
    'awaiting_crypto',
    'awaiting_payment',
    'confirming',
    'completed',
    'cancelled',
    'disputed',
  ]),
  adminNotes: z.string().trim().max(500).optional(),
});

export type CreateSellInput = z.infer<typeof createSellSchema>;
export type CreateBuyInput = z.infer<typeof createBuySchema>;
