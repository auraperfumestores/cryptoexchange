import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { encode } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth/auth';
import { connectToDatabase, User, ImpersonationLog } from '@/lib/db';
import { errorResponse, badRequest, forbidden } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

const ADMIN_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // matches authOptions.session.maxAge

const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE_NAME   = IS_PROD ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
const COOKIE_DOMAIN = IS_PROD ? '.swappinr.in' : undefined;

/** POST /api/admin/impersonate/stop — ends an impersonated session and restores the
 *  admin's own. Deliberately NOT admin-gated: the caller is currently holding a
 *  *client* session, so requireAdmin() would reject them. Authority comes instead
 *  from the signed impersonatedBy claim, which only this server can have issued. */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const adminId = session?.impersonatedBy;
    if (!adminId) return badRequest('This session is not an impersonated session');

    await connectToDatabase();

    // Re-check the admin still exists and still holds the admin role — a revoked
    // admin must not get their privileges back by exiting impersonation.
    const admin = await User.findById(adminId).select('name email role isActive').lean();
    if (!admin || admin.role !== 'admin' || admin.isActive === false) return forbidden();

    const sessionToken = await encode({
      token: {
        sub:   String(admin._id),
        id:    String(admin._id),
        email: admin.email,
        name:  admin.name,
        role:  'admin' as const,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    // Mirrors the gating in the start route — no audit trail in development.
    if (IS_PROD) {
      await ImpersonationLog.create({
        adminId:     admin._id,
        adminName:   admin.name,
        adminEmail:  admin.email,
        targetId:    session!.user.id,
        targetName:  session!.user.name,
        targetEmail: session!.user.email,
        action:      'stop',
        ip:          req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        userAgent:   req.headers.get('user-agent') ?? undefined,
      }).catch(e => console.error('[impersonate] audit log failed:', e));

      console.warn(`[impersonate] ${admin.email} stopped impersonating ${session!.user.email}`);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure:   IS_PROD,
      sameSite: 'lax',
      maxAge:   ADMIN_SESSION_MAX_AGE,
      path:     '/',
      domain:   COOKIE_DOMAIN,
    });
    return response;
  } catch (err) {
    return errorResponse(err);
  }
}
