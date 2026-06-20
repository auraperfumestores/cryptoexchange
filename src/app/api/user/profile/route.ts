import { NextResponse }              from 'next/server';
import { requireAuth }               from '@/lib/auth/require-auth';
import { connectToDatabase, User }   from '@/lib/db';
import { errorResponse }             from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/user/profile — fresh profile data for the profile page */
export async function GET() {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    const user = await User.findById(auth.id).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        id:           String(user._id),
        name:         user.name,
        email:        user.email,
        phone:        user.phone ?? '',
        username:     user.username ?? '',
        avatarUrl:    user.avatarUrl ?? '',
        kycStatus:    user.kycStatus,
        emailVerified: user.emailVerified,
        role:         user.role,
        createdAt:    (user as any).createdAt,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PATCH /api/user/profile — update name, username, avatarUrl */
export async function PATCH(req: Request) {
  try {
    const auth = await requireAuth();
    const body = await req.json() as { name?: string; username?: string; avatarUrl?: string };

    const update: Record<string, string> = {};
    if (body.name?.trim())     update.name      = body.name.trim().slice(0, 80);
    if (body.username?.trim()) update.username  = body.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30);
    if (body.avatarUrl !== undefined) update.avatarUrl = body.avatarUrl;

    if (!Object.keys(update).length) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    await connectToDatabase();
    await User.updateOne({ _id: auth.id }, { $set: update });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
