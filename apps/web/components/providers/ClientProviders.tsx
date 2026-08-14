'use client';

import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { AppProvider } from '@/components/providers/AppProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { PresenceProvider } from '@/components/providers/PresenceProvider';
import { CookieGuard } from '@/components/layout/auth/CookieGuard';

export function ClientProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session || null}>
      <CookieGuard />
      <AppProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PresenceProvider>
            {children}
          </PresenceProvider>
        </ThemeProvider>
      </AppProvider>
    </SessionProvider>
  );
}
