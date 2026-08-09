'use client';

import { usePresence } from '@/hooks/usePresence';
import { ReactNode } from 'react';

/**
 * Provider component that handles user presence heartbeat
 * DISABLED: heartbeat/presence - re-enable when we have paid servers
 */
export function PresenceProvider({ children }: { children: ReactNode }) {
    // DISABLED: re-enable when we have paid servers - usePresence() sent heartbeats to Redis
    usePresence();

    return <>{children}</>;
}
