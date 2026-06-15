'use client';

import { useUIStore } from '@/store/ui-store';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { UserShell } from './user-shell';
import type { SessionUser, RateDocument } from '@/types';
import { RateTicker } from './rate-ticker';

interface ClientShellProps {
  user: SessionUser;
  rates: RateDocument[];
  children: React.ReactNode;
}

export function ClientShell({ user, rates, children }: ClientShellProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  // Clients get the minimal exchange-focused shell
  if (user.role === 'client') {
    return <UserShell user={user}>{children}</UserShell>;
  }

  // Admins keep the full sidebar layout
  return (
    <div className="flex min-h-screen" style={{ background: '#070C1A' }}>
      <Sidebar role={user.role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} />
        <RateTicker rates={rates} />
        <main className="flex-1 px-5 py-7 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
