import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Fallback for development if Upstash is not configured
    console.warn('Upstash Redis environment variables are missing. Rate limiting will be bypassed.');
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

if (redisUrl && !redisUrl.startsWith('https://')) {
    console.error(`[RateLimit] Invalid UPSTASH_REDIS_REST_URL: "${redisUrl}". Redis URL must be an absolute URL starting with https://. This is likely causing the "Failed to parse URL" error.`);
}

const redis = new Redis({
    url: redisUrl,
    token: redisToken,
});

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit',
});

// More strict limiter for AI routes
export const aiRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/ai',
});
