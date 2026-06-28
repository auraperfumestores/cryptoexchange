import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, KycSubmission, kycSubmissionToDocument, User } from '@/lib/db';
import { errorResponse, forbidden } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/admin/kyc — paginated KYC submission queue with the owning
 *  user's name/email attached, for the admin KYC review section. */
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

    let userIdFilter: string[] | null = null;
    if (search) {
      const users = await User.find({
        $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }],
      }).select('_id').lean();
      userIdFilter = users.map(u => String(u._id));
      filter.userId = { $in: userIdFilter };
    }

    const [submissions, total] = await Promise.all([
      KycSubmission.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      KycSubmission.countDocuments(filter),
    ]);

    const users = await User.find({ _id: { $in: submissions.map(s => s.userId) } })
      .select('name email phone kycStatus createdAt')
      .lean();
    const userMap = new Map(users.map(u => [String(u._id), u]));

    const data = submissions.map(s => ({
      ...kycSubmissionToDocument(s),
      user: (() => {
        const u = userMap.get(String(s.userId));
        return u ? { _id: String(u._id), name: u.name, email: u.email, phone: u.phone, kycStatus: u.kycStatus } : null;
      })(),
    }));

    return NextResponse.json({ success: true, data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return errorResponse(err);
  }
}
