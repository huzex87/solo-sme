import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Fallback for development if Upstash is not configured
    console.warn('Upstash Redis environment variables are missing. Rate limiting will be bypassed.');
}

const isConfigured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || 'https://localhost',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy',
});

// Real ratelimiter instance
const internalRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit',
});

// Strictly-limited ratelimiter instance
const internalAiRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/ai',
});

/**
 * Safe wrapper for ratelimiting that bypasses if not configured.
 * This prevents "Failed to parse URL from /pipeline" errors.
 */
export const ratelimit = {
    limit: async (key: string) => {
        if (!isConfigured) return { success: true, limit: 0, remaining: 0, reset: 0 };
        try {
            return await internalRatelimit.limit(key);
        } catch (err) {
            console.error('[RateLimit] Execution error:', err);
            return { success: true, limit: 0, remaining: 0, reset: 0 };
        }
    }
};

export const aiRatelimit = {
    limit: async (key: string) => {
        if (!isConfigured) return { success: true, limit: 0, remaining: 0, reset: 0 };
        try {
            return await internalAiRatelimit.limit(key);
        } catch (err) {
            console.error('[RateLimit/AI] Execution error:', err);
            return { success: true, limit: 0, remaining: 0, reset: 0 };
        }
    }
};

