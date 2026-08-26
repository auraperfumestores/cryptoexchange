import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import { requireAdmin } from '@/lib/auth/require-auth';
import { connectToDatabase, User, ImpersonationLog } from '@/lib/db';
import { errorResponse, notFound, badRequest } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** Impersonated sessions are deliberately short-lived — an admin should be in and
 *  out for a specific support task, not left holding a customer session for weeks. */
const IMPERSONATION_MAX_AGE = 60 * 60; // 1 hour

const IS_PROD = process.env.NODE_ENV === 'production';
/** Must match authOptions.cookies.sessionToken exactly, so this overwrites the
 *  admin's own session cookie rather than creating a second, competing one. */
const COOKIE_NAME   = IS_PROD ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
const COOKIE_DOMAIN = IS_PROD ? '.swappinr.in' : undefined;

/** POST /api/admin/users/[id]/impersonate — issues a session for the target user,
 *  tagged with the acting admin's id so the session can be handed back afterwards. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    await connectToDatabase();

    const target = await User.findById(params.id).select('name email role').lean();
    if (!target) return notFound('User not found');

    // Admins may not impersonate other admins: it would let one admin act with
    // another's authority while the audit trail shows the wrong actor.
    if (target.role === 'admin') {
      return badRequest('Administrator accounts cannot be impersonated');
    }

    const sessionToken = await encode({
      token: {
        sub:              String(target._id),
        id:               String(target._id),
        email:            target.email,
        name:             target.name,
        role:             target.role as 'client',
        impersonatedBy:   admin.id,
        impersonatorName: admin.name,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: IMPERSONATION_MAX_AGE,
    });

    // Audit only in production. Local development produces no record at all, so
    // test runs never pollute the trail. Gating on NODE_ENV rather than a manual
    // flag means production auditing cannot be left switched off by accident.
    if (IS_PROD) {
      await ImpersonationLog.create({
        adminId:     admin.id,
        adminName:   admin.name,
        adminEmail:  admin.email,
        targetId:    target._id,
        targetName:  target.name,
        targetEmail: target.email,
        action:      'start',
        ip:          req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        userAgent:   req.headers.get('user-agent') ?? undefined,
      }).catch(e => console.error('[impersonate] audit log failed:', e));

      console.warn(`[impersonate] ${admin.email} started impersonating ${target.email}`);
    }

    const response = NextResponse.json({ success: true, data: { name: target.name } });
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure:   IS_PROD,
      sameSite: 'lax',
      maxAge:   IMPERSONATION_MAX_AGE,
      path:     '/',
      domain:   COOKIE_DOMAIN,
    });
    return response;
  } catch (err) {
    return errorResponse(err);
  }
}
