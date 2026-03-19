import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const isConfigured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const isProduction = process.env.NODE_ENV === 'production';

if (!isConfigured) {
    console.warn('[RateLimit] Upstash Redis not configured. Rate limiting will fail-closed in production.');
}

const redis = isConfigured
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null;

const internalRatelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: true,
        prefix: '@upstash/ratelimit',
    })
    : null;

const internalAiRatelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: '@upstash/ratelimit/ai',
    })
    : null;

/**
 * Rate limiter: fails-closed in production (rejects if Redis unavailable).
 * In development, allows through when Redis isn't configured.
 */
export const ratelimit = {
    limit: async (key: string) => {
        if (!internalRatelimit) {
            if (isProduction) return { success: false, limit: 0, remaining: 0, reset: 0 };
            return { success: true, limit: 0, remaining: 0, reset: 0 };
        }
        try {
            return await internalRatelimit.limit(key);
        } catch (err) {
            console.error('[RateLimit] Execution error:', err);
            if (isProduction) return { success: false, limit: 0, remaining: 0, reset: 0 };
            return { success: true, limit: 0, remaining: 0, reset: 0 };
        }
    }
};

export const aiRatelimit = {
    limit: async (key: string) => {
        if (!internalAiRatelimit) {
            if (isProduction) return { success: false, limit: 0, remaining: 0, reset: 0 };
            return { success: true, limit: 0, remaining: 0, reset: 0 };
        }
        try {
            return await internalAiRatelimit.limit(key);
        } catch (err) {
            console.error('[RateLimit/AI] Execution error:', err);
            if (isProduction) return { success: false, limit: 0, remaining: 0, reset: 0 };
            return { success: true, limit: 0, remaining: 0, reset: 0 };
        }
    }
};
