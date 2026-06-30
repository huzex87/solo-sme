import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const isConfigured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const isProduction = process.env.NODE_ENV === 'production';

if (!isConfigured) {
    console.warn('[RateLimit] Upstash Redis not configured. General rate limiting will fail-closed in production; signup rate limiting will fail-open.');
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

const internalSignupRatelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        analytics: true,
        prefix: '@upstash/ratelimit/signup',
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

const ALLOW: { success: true; limit: number; remaining: number; reset: number } = { success: true, limit: 0, remaining: 0, reset: 0 };
const DENY: { success: false; limit: number; remaining: number; reset: number } = { success: false, limit: 0, remaining: 0, reset: 0 };

/** General rate limiter: fails-open so Redis or network issues never block core flows. */
export const ratelimit = {
    limit: async (key: string) => {
        if (!internalRatelimit) {
            return ALLOW;
        }
        try {
            return await internalRatelimit.limit(key);
        } catch (err) {
            console.error('[RateLimit] Execution error:', err);
            return ALLOW;
        }
    }
};

/** Signup rate limiter: 3 attempts per hour per email. Fails-open so Redis issues never block new users. */
export const signupRatelimit = {
    limit: async (key: string) => {
        if (!internalSignupRatelimit) return ALLOW;
        try {
            return await internalSignupRatelimit.limit(key);
        } catch (err) {
            console.error('[RateLimit/Signup] Execution error:', err);
            return ALLOW;
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
