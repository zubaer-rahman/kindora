'use client';

// DISABLED: Online/offline indicators (heartbeat/presence disabled - re-enable when we have paid servers)
// import { useOnlineStatus } from '@/hooks/usePresence';

interface OnlineIndicatorProps {
    userId: string;
    showText?: boolean;
    className?: string;
}

/**
 * Component to display online/offline status indicator.
 * DISABLED: Renders nothing; re-enable when presence/heartbeat is turned back on.
 */
export function OnlineIndicator(_props: OnlineIndicatorProps) {
    return null;
}

interface BulkOnlineIndicatorProps {
    userIds: string[];
    userId: string;
    showText?: boolean;
    className?: string;
}

/**
 * Optimized component for showing online status for multiple users.
 * DISABLED: Renders nothing; re-enable when presence/heartbeat is turned back on.
 */
export function BulkOnlineIndicator(_props: BulkOnlineIndicatorProps) {
    return null;
}
