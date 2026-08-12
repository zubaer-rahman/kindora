import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useEffect } from "react";
// import { useCallback } from "react"; // used by commented heartbeat code
// import { useSession } from "next-auth/react";

// DISABLED: heartbeat/presence - re-enable when we have paid servers
// const HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds
// const HEARTBEAT_INTERVAL_INACTIVE = 120 * 1000; // 2 minutes when tab is hidden

/**
 * Hook to maintain user's online presence via Redis heartbeat
 * DISABLED: re-enable when we have paid servers (see commented code below)
 */
export function usePresence() {
    // No-op: heartbeat disabled to avoid Redis/server load on free tier
    // const { data: session, status } = useSession();
    // const intervalRef = useRef<NodeJS.Timeout | null>(null);
    // const isPageVisibleRef = useRef(true);
    // const lastHeartbeatRef = useRef<number>(0);

    // // Optimized heartbeat function with throttling
    // const sendOptimizedHeartbeat = useCallback(() => {
    //     const now = Date.now();
    //     const timeSinceLastHeartbeat = now - lastHeartbeatRef.current;
    //     if (timeSinceLastHeartbeat < 10000) return;
    //     lastHeartbeatRef.current = now;
    //     sendHeartbeat();
    // }, [sendHeartbeat]);
}

/**
 * Hook to get online status for a list of users
 * Optimized with smart caching and conditional fetching
 * @param userIds - Array of user IDs to check online status for
 * @param enabled - Whether to fetch (default: true)
 * @returns Object mapping userId to boolean (true = online, false = offline)
 */
export function useOnlineStatus(userIds: string[], enabled: boolean = true) {
    const axiosAuth = useAxiosAuth();
    return useQuery({
        queryKey: ["onlineStatus", userIds],
        queryFn: async () => {
            const res = await axiosAuth.get("/api/v1/users/online-status", {
                params: { userIds: userIds.join(",") },
            });
            return res.data.data;
        },
        enabled: enabled && userIds.length > 0,
        // Stale-while-revalidate strategy
        staleTime: 10000, // Consider data fresh for 10 seconds
        gcTime: 60000, // Keep in cache for 1 minute (renamed from cacheTime)
        refetchInterval: 30000, // Refresh every 30 seconds (reduced from 15s)
        refetchIntervalInBackground: false, // Don't refetch when tab is hidden
        refetchOnWindowFocus: true, // Refetch when user returns to tab
        refetchOnReconnect: true, // Refetch when connection is restored
        // Reduce network requests
        retry: 1, // Only retry once on failure
        retryDelay: 5000, // Wait 5s before retry
    });
}
