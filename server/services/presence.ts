// DISABLED: heartbeat/presence - re-enable when we have paid servers
// import { redis } from '../../lib/redis';
// import User from '../db/models/user';

// const ONLINE_TTL_SECONDS = 60;
// const MONGO_UPDATE_THROTTLE_SECONDS = 300; // 5 minutes
// const RATE_LIMIT_WINDOW = 10;
// const MAX_HEARTBEATS_PER_WINDOW = 10;

export class PresenceService {
    private static instance: PresenceService;

    private constructor() { }

    static getInstance(): PresenceService {
        if (!PresenceService.instance) {
            PresenceService.instance = new PresenceService();
        }
        return PresenceService.instance;
    }

    // private getOnlineKey(userId: string): string {
    //     return `user:online:${userId}`;
    // }
    // private getMongoThrottleKey(userId: string): string {
    //     return `user:last_seen_update:${userId}`;
    // }
    // private getRateLimitKey(userId: string): string {
    //     return `user:heartbeat_ratelimit:${userId}`;
    // }

    /** DISABLED: re-enable when we have paid servers - was setting Redis + Mongo last_seen */
    async setUserOnline(_userId: string): Promise<{ success: boolean; rateLimited?: boolean }> {
        // try {
        //     const rateLimitKey = this.getRateLimitKey(userId);
        //     const onlineKey = this.getOnlineKey(userId);
        //     const throttleKey = this.getMongoThrottleKey(userId);
        //     const pipeline = redis.pipeline();
        //     pipeline.incr(rateLimitKey);
        //     pipeline.expire(rateLimitKey, RATE_LIMIT_WINDOW, 'NX');
        //     pipeline.set(onlineKey, 'true', { ex: ONLINE_TTL_SECONDS });
        //     pipeline.set(throttleKey, 'true', { nx: true, ex: MONGO_UPDATE_THROTTLE_SECONDS });
        //     const results = await pipeline.exec<[number, number, "OK", "OK" | null]>();
        //     if (results[0] > MAX_HEARTBEATS_PER_WINDOW) return { success: false, rateLimited: true };
        //     if (results[3] === 'OK') {
        //         User.findByIdAndUpdate(userId, { last_seen: new Date() }).catch(err => {
        //             console.error(`[Presence] Failed to update last_seen for user ${userId}`, err);
        //         });
        //     }
        //     return { success: true };
        // } catch (error) {
        //     console.error(`[Presence] Error setting user online:`, error);
        //     return { success: false };
        // }
        return { success: true };
    }

    /** DISABLED: re-enable when we have paid servers - was checking Redis for online key */
    async isUserOnline(_userId: string): Promise<boolean> {
        // try {
        //     const onlineKey = this.getOnlineKey(userId);
        //     const result = await redis.exists(onlineKey);
        //     return result === 1;
        // } catch (error) {
        //     console.error(`[Presence] Error checking online status:`, error);
        //     return false;
        // }
        return false;
    }

    /** DISABLED: re-enable when we have paid servers - was batch-checking Redis */
    async getManyUsersOnlineStatus(userIds: string[]): Promise<Record<string, boolean>> {
        // if (userIds.length === 0) return {};
        // const MAX_BATCH_SIZE = 100;
        // if (userIds.length > MAX_BATCH_SIZE) userIds = userIds.slice(0, MAX_BATCH_SIZE);
        // try {
        //     const pipeline = redis.pipeline();
        //     userIds.forEach(id => pipeline.exists(this.getOnlineKey(id)));
        //     const results = await pipeline.exec() as any[];
        //     const statusMap: Record<string, boolean> = {};
        //     userIds.forEach((id, index) => { statusMap[id] = results[index] === 1; });
        //     return statusMap;
        // } catch (error) {
        //     console.error(`[Presence] Error getting bulk online status:`, error);
        //     return userIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
        // }
        if (userIds.length === 0) return {};
        return userIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
    }

    /** DISABLED: re-enable when we have paid servers */
    async setManyUsersOnline(_userIds: string[]): Promise<void> {
        // if (userIds.length === 0) return;
        // try {
        //     const pipeline = redis.pipeline();
        //     userIds.forEach(userId => {
        //         pipeline.set(this.getOnlineKey(userId), 'true', { ex: ONLINE_TTL_SECONDS });
        //     });
        //     await pipeline.exec();
        // } catch (error) {
        //     console.error(`[Presence] Error batch setting users online:`, error);
        // }
    }

    /** DISABLED: re-enable when we have paid servers */
    async getOnlineUserCount(): Promise<number> {
        // try {
        //     const keys = await redis.keys('user:online:*');
        //     return keys.length;
        // } catch (error) {
        //     console.error(`[Presence] Error getting online user count:`, error);
        //     return 0;
        // }
        return 0;
    }

    /** DISABLED: re-enable when we have paid servers - was clearing Redis key on logout */
    async clearUserPresence(_userId: string): Promise<void> {
        // try {
        //     const onlineKey = this.getOnlineKey(userId);
        //     await redis.del(onlineKey);
        // } catch (error) {
        //     console.error(`[Presence] Error clearing user presence:`, error);
        // }
    }
}

export const presenceService = PresenceService.getInstance();
