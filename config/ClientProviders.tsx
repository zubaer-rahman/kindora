// app/ClientProviders.tsx
'use client'; // This makes it a client component

import { SessionProvider } from 'next-auth/react';
import { TrpcProvider } from '@/config/Provider';
import { Session } from 'next-auth';
import { PresenceProvider } from '@/components/providers/PresenceProvider';
import { CookieGuard } from '@/components/auth/CookieGuard';

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
      <TrpcProvider>
        <PresenceProvider>
          {children}
        </PresenceProvider>
      </TrpcProvider>
    </SessionProvider>
  );
}
