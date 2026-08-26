import { connectToDatabase, User, getWidgetLimits } from '@/lib/db';

/**
 * Resolves the minimum withdrawal amount that applies to a specific user.
 *
 * Precedence: a per-user override in `customLimits` wins whenever the admin has
 * enabled custom limits for that account; otherwise the global
 * `widgetLimits.minWithdrawUsdt` applies. A value of 0 means "no minimum".
 *
 * Single source of truth deliberately — both the enforcement point
 * (POST /api/platform-wallet/withdraw) and the figure shown in the withdrawal UI
 * (GET /api/user/platform-wallet) call this, so the two can never disagree.
 */
export async function getEffectiveMinWithdraw(userId: string): Promise<number> {
  await connectToDatabase();

  const [globalLimits, dbUser] = await Promise.all([
    getWidgetLimits(),
    User.findById(userId).select('customLimits').lean<{ customLimits?: { enabled?: boolean; minWithdrawUsdt?: number } }>(),
  ]);

  const cl = dbUser?.customLimits;
  if (cl?.enabled === true && typeof cl.minWithdrawUsdt === 'number' && cl.minWithdrawUsdt >= 0) {
    return cl.minWithdrawUsdt;
  }

  return globalLimits.minWithdrawUsdt ?? 0;
}
