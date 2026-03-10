// Simple in-memory sliding window rate limiter
// For production with multiple instances, use Redis

type RateLimitRecord = {
    count: number;
    resetTime: number;
};

const cache = new Map<string, RateLimitRecord>();

export function rateLimit(key: string, limit: number, windowMs: number): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const record = cache.get(key);

    if (!record || now > record.resetTime) {
        const newRecord = {
            count: 1,
            resetTime: now + windowMs,
        };
        cache.set(key, newRecord);
        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset: newRecord.resetTime,
        };
    }

    record.count++;
    const remaining = Math.max(0, limit - record.count);

    if (record.count > limit) {
        return {
            success: false,
            limit,
            remaining: 0,
            reset: record.resetTime,
        };
    }

    return {
        success: true,
        limit,
        remaining,
        reset: record.resetTime,
    };
}
