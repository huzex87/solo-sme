import { Redis } from '@upstash/redis'

/**
 * Institutional-grade Redis client for session and OTP management.
 * Powered by Upstash for serverless performance and global availability.
 */
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export default redis
