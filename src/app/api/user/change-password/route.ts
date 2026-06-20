import { NextResponse }           from 'next/server';
import bcrypt                       from 'bcryptjs';
import { requireAuth }              from '@/lib/auth/require-auth';
import { connectToDatabase, User }  from '@/lib/db';
import { errorResponse }            from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const { currentPassword, newPassword } = await req.json() as { currentPassword?: string; newPassword?: string };

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(auth.id).select('+password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password ?? '');
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: auth.id }, { $set: { password: hashed } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
