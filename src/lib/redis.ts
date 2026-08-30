import { Redis } from '@upstash/redis';

/**
 * Fail-safe Redis client for session and cache management.
 * Powered by Upstash with graceful in-memory fallback.
 */
const redisUrl = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
const redisToken = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();

const hasValidUrl = redisUrl.startsWith('https://') && !redisUrl.includes('placeholder');

let rawClient: Redis | null = null;
if (hasValidUrl && redisToken) {
    try {
        rawClient = new Redis({
            url: redisUrl,
            token: redisToken,
        });
    } catch (e) {
        console.warn('[Redis] Failed to initialize Upstash Redis client:', e);
    }
}

// In-memory fallback store when Upstash is unreachable or expired
const memoryStore = new Map<string, { value: unknown; expiresAt?: number }>();

function cleanExpiredKeys() {
    const now = Date.now();
    for (const [key, item] of memoryStore.entries()) {
        if (item.expiresAt && item.expiresAt <= now) {
            memoryStore.delete(key);
        }
    }
}

let lastErrorLogTime = 0;
function logRedisWarning(method: string, err: unknown) {
    const now = Date.now();
    // Throttle warnings to once every 30 seconds
    if (now - lastErrorLogTime > 30000) {
        lastErrorLogTime = now;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[Redis] Upstash "${method}" failed (falling back to memory/Postgres): ${msg}`);
    }
}

export const safeRedis = {
    async get<T = unknown>(key: string): Promise<T | null> {
        if (rawClient) {
            try {
                return (await rawClient.get<T>(key)) ?? null;
            } catch (err) {
                logRedisWarning('get', err);
            }
        }
        cleanExpiredKeys();
        const item = memoryStore.get(key);
        if (!item) return null;
        if (item.expiresAt && item.expiresAt <= Date.now()) {
            memoryStore.delete(key);
            return null;
        }
        return item.value as T;
    },

    async set(key: string, value: unknown, opts?: { ex?: number; px?: number; nx?: boolean; xx?: boolean }): Promise<'OK' | null> {
        if (rawClient) {
            try {
                return await (rawClient.set as any)(key, value, opts);
            } catch (err) {
                logRedisWarning('set', err);
            }
        }
        let expiresAt: number | undefined;
        if (opts?.ex) expiresAt = Date.now() + opts.ex * 1000;
        else if (opts?.px) expiresAt = Date.now() + opts.px;
        memoryStore.set(key, { value, expiresAt });
        return 'OK';
    },

    async del(...keys: string[]): Promise<number> {
        if (rawClient) {
            try {
                return await rawClient.del(...keys);
            } catch (err) {
                logRedisWarning('del', err);
            }
        }
        let count = 0;
        for (const k of keys) {
            if (memoryStore.delete(k)) count++;
        }
        return count;
    },

    async incr(key: string): Promise<number> {
        if (rawClient) {
            try {
                return await rawClient.incr(key);
            } catch (err) {
                logRedisWarning('incr', err);
            }
        }
        cleanExpiredKeys();
        const item = memoryStore.get(key);
        let num = 0;
        if (item && typeof item.value === 'number') {
            num = item.value;
        }
        num += 1;
        memoryStore.set(key, { value: num, expiresAt: item?.expiresAt });
        return num;
    },

    async expire(key: string, seconds: number): Promise<number> {
        if (rawClient) {
            try {
                return await rawClient.expire(key, seconds);
            } catch (err) {
                logRedisWarning('expire', err);
            }
        }
        const item = memoryStore.get(key);
        if (item) {
            item.expiresAt = Date.now() + seconds * 1000;
            return 1;
        }
        return 0;
    },

    async keys(pattern: string): Promise<string[]> {
        if (rawClient) {
            try {
                return await rawClient.keys(pattern);
            } catch (err) {
                logRedisWarning('keys', err);
            }
        }
        return Array.from(memoryStore.keys());
    }
} as unknown as Redis;

export default safeRedis;
