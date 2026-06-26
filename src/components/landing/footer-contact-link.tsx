'use client';

import { openSupportChat } from '@/components/ui/support-chat-widget';

export function FooterContactLink() {
  return (
    <button type="button" onClick={() => openSupportChat()} className="lp-footer-link" style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
      Contact
    </button>
  );
}
