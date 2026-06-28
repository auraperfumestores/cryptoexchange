import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, User, WithdrawalRequest } from '@/lib/db';
import { errorResponse, forbidden } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/admin/withdrawals — paginated withdrawal-request queue with the
 *  owning user's name/email attached, for the admin withdrawals section. */
export async function GET(req: Request) {
  try {
    const admin = await requireAuth();
    if (admin.role !== 'admin') return forbidden();

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? '';
    const search = searchParams.get('search') ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 20;

    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') filter.status = status;

    if (search) {
      const users = await User.find({
        $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }],
      }).select('_id').lean();
      filter.userId = { $in: users.map(u => u._id) };
    }

    const [rows, total] = await Promise.all([
      WithdrawalRequest.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      WithdrawalRequest.countDocuments(filter),
    ]);

    const users = await User.find({ _id: { $in: rows.map(r => r.userId) } })
      .select('name email phone')
      .lean();
    const userMap = new Map(users.map(u => [String(u._id), u]));

    const data = rows.map(r => ({
      _id: String(r._id),
      amount: r.amount,
      network: r.network,
      toAddress: r.toAddress,
      networkFee: r.networkFee,
      status: r.status,
      txHash: r.txHash,
      explorerUrl: r.explorerUrl,
      rejectionReason: r.rejectionReason,
      refunded: r.refunded,
      processedByName: r.processedByName,
      processedAt: r.processedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: (() => {
        const u = userMap.get(String(r.userId));
        return u ? { _id: String(u._id), name: u.name, email: u.email, phone: u.phone } : null;
      })(),
    }));

    return NextResponse.json({ success: true, data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return errorResponse(err);
  }
}
