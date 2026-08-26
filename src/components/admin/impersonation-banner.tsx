'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Persistent warning bar shown for the whole duration of an admin impersonation
 * session. Renders nothing for normal users. The bar is deliberately loud and
 * un-dismissable — acting inside a customer's account without realising it is
 * the main practical risk of this feature.
 */
export function ImpersonationBanner() {
  const { data: session } = useSession();
  const [exiting, setExiting] = useState(false);

  if (!session?.impersonatedBy) return null;

  async function exitImpersonation() {
    setExiting(true);
    try {
      const res = await fetch('/api/admin/impersonate/stop', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      window.location.href = '/admin/users';
    } catch {
      setExiting(false);
      // Falling back to a full sign-out is safer than leaving the admin stuck
      // inside a customer session with no way out.
      window.location.href = '/api/auth/signout';
    }
  }

  return (
    <div
      role="status"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9995,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, flexWrap: 'wrap',
        padding: '9px 14px',
        background: 'linear-gradient(90deg,#F59E0B,#F87171)',
        borderTop: '1px solid rgba(0,0,0,0.2)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 800, color: '#1a1a1a', minWidth: 0 }}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M8 1.5L15 14H1L8 1.5Z" stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 6.5V9.5M8 11.5H8.01" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Admin view — you are signed in as <strong>{session.user?.name}</strong>
        </span>
      </span>
      <button
        onClick={exitImpersonation}
        disabled={exiting}
        style={{
          padding: '6px 15px', borderRadius: 8, background: '#1a1a1a', color: '#fff',
          fontSize: 12, fontWeight: 800, border: 'none',
          cursor: exiting ? 'not-allowed' : 'pointer', opacity: exiting ? 0.6 : 1,
          flexShrink: 0, whiteSpace: 'nowrap',
        }}
      >
        {exiting ? 'Returning…' : 'Return to admin →'}
      </button>
    </div>
  );
}
