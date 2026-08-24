'use client';

import { useEffect } from 'react';

export const REFERRAL_STORAGE_KEY = 'swappinr_referral_code';

/** Mounted once at the app root. If a visitor lands on any page with ?ref=CODE,
 *  persists it to localStorage so it survives navigation to /register even if
 *  they land on the homepage first. Silently does nothing otherwise. */
export function ReferralCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref?.trim()) localStorage.setItem(REFERRAL_STORAGE_KEY, ref.trim().toUpperCase());
    } catch { /* localStorage unavailable — referral capture is best-effort */ }
  }, []);

  return null;
}
