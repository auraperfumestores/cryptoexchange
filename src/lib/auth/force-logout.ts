'use client';

import { signOut } from 'next-auth/react';
import { pageLoader } from '@/store/page-loader-store';

// Runs NextAuth's normal sign-out (clears the current session cookie),
// then sweeps any leftover legacy session cookie that predates the
// Domain=.swappinr.com cookie scoping change — see
// /api/auth/force-logout for why that sweep is necessary — before
// navigating away. Replaces a bare `signOut()` call wherever a logout
// button exists.
export async function forceLogout(callbackUrl = '/') {
  pageLoader.show();
  await signOut({ redirect: false });
  await fetch('/api/auth/force-logout', { method: 'POST' }).catch(() => {});
  window.location.href = callbackUrl;
}
