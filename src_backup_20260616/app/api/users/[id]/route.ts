import { NextResponse } from 'next/server';
import { connectToDatabase, User, userToDocument } from '@/lib/db';
import { errorResponse, notFound } from '@/lib/utils/errors';
import { requireAdmin } from '@/lib/auth/require-auth';

type RouteParams = { params: { id: string } };

/** GET /api/users/[id] — single user (admin only) */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const user = await User.findById(params.id).select('-password').lean();
    if (!user) return notFound('User not found');
    return NextResponse.json({ success: true, data: userToDocument(user) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PATCH /api/users/[id] — update user (admin only, e.g. toggle active) */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const user = await User.findById(params.id);
    if (!user) return notFound('User not found');

    if (body.isActive !== undefined) user.isActive = body.isActive;
    if (body.kycStatus) user.kycStatus = body.kycStatus;
    if (body.role && ['client', 'admin'].includes(body.role)) user.role = body.role;

    await user.save();
    return NextResponse.json({ success: true, data: userToDocument(user) });
  } catch (err) {
    return errorResponse(err);
  }
}