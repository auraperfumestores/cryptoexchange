import { z } from 'zod';

export const connectWalletSchema = z.object({
  address: z
    .string()
    .trim()
    .min(8, 'Wallet address is required')
    .max(200)
    .refine((s) => /^(0x[a-fA-F0-9]{40}|T[A-Za-z1-9]{33})$/.test(s), 'Unsupported wallet address format'),
  chainId: z.number().int().positive(),
  chainName: z.string().trim().min(2).max(40),
  label: z.string().trim().max(40).optional(),
});

export type ConnectWalletInput = z.infer<typeof connectWalletSchema>;
