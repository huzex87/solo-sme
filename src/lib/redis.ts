import { Redis } from '@upstash/redis'

/**
 * Institutional-grade Redis client for session and OTP management.
 * Powered by Upstash for serverless performance and global availability.
 */
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

if (redisUrl && !redisUrl.startsWith('https://')) {
    console.error(`[Redis] Invalid UPSTASH_REDIS_REST_URL: "${redisUrl}". Redis URL must be an absolute URL starting with https://. This is likely causing the "Failed to parse URL" error.`);
}

/**
 * Institutional-grade Redis client for session and OTP management.
 * Powered by Upstash for serverless performance and global availability.
 */
const redis = new Redis({
    url: redisUrl || 'https://placeholder.upstash.io',
    token: redisToken || 'placeholder-token',
})

export default redis
