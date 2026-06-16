import { z } from 'zod';

/**
 * Schema for PATCH /api/rates/[id] — only mutable fields are allowed.
 * `symbol` and `network` are identifiers, not editable.
 * `depositAddress` is optional in the update payload so the admin form can
 * send only the fields that actually changed; if provided it must be valid.
 */
export const rateUpdateSchema = z
  .object({
    buyRate: z.number().positive('Buy rate must be positive').optional(),
    sellRate: z.number().positive('Sell rate must be positive').optional(),
    spread: z.number().min(0).max(50).optional(),
    spreadType: z.enum(['fixed', 'percentage']).optional(),
    useCoinGecko: z.boolean().optional(),
    coinGeckoId: z.string().max(80).optional().nullable(),
    baseSpread: z.number().min(0).max(50).optional(),
    basePrice: z.number().min(0).optional().nullable(),
    depositAddress: z.string().trim().min(8, 'Deposit address is required').max(200).optional(),
    isActive: z.boolean().optional(),
    reason: z.string().trim().max(280).optional(),
  })
  .refine(
    (v) =>
      v.buyRate !== undefined ||
      v.sellRate !== undefined ||
      v.spread !== undefined ||
      v.spreadType !== undefined ||
      v.useCoinGecko !== undefined ||
      v.coinGeckoId !== undefined ||
      v.baseSpread !== undefined ||
      v.basePrice !== undefined ||
      v.depositAddress !== undefined ||
      v.isActive !== undefined,
    { message: 'Provide at least one field to update' },
  );

export type RateUpdateInput = z.infer<typeof rateUpdateSchema>;

/**
 * Schema for POST /api/rates — creating a new rate entry.
 */
export const rateCreateSchema = z.object({
  symbol: z.enum(['USDT', 'BNB']),
  network: z.enum(['ERC20', 'BEP20', 'TRC20']),
  buyRate: z.number().positive('Buy rate is required'),
  sellRate: z.number().positive('Sell rate is required'),
  spread: z.number().min(0).max(50).optional().default(0),
  spreadType: z.enum(['fixed', 'percentage']).optional().default('percentage'),
  useCoinGecko: z.boolean().optional().default(false),
  coinGeckoId: z.string().max(80).optional().nullable(),
  baseSpread: z.number().min(0).max(50).optional(),
  basePrice: z.number().min(0).optional().nullable(),
  depositAddress: z.string().trim().min(8, 'Deposit address is required').max(200),
  isActive: z.boolean().optional().default(true),
  reason: z.string().trim().max(280).optional(),
});

export type RateCreateInput = z.infer<typeof rateCreateSchema>;