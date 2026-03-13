/**
 * SOLO SME Professional Logger
 * Environment-aware telemetry for a world-class merchant experience.
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
    info: (message: string, ...args: unknown[]) => {
        if (!isProduction) {
            console.log(`[INFO] [${new Date().toLocaleTimeString()}] ${message}`, ...args);
        }
    },
    warn: (message: string, ...args: unknown[]) => {
        // Warnings are logged in production but with standardized formatting
        console.warn(`[WARN] [${new Date().toLocaleTimeString()}] ${message}`, ...args);
    },
    error: (message: string, error?: unknown, ...args: unknown[]) => {
        // Errors are always logged for Sentry/Cloudwatch consumption
        console.error(`[ERROR] [${new Date().toLocaleTimeString()}] ${message}`, error, ...args);
    },
    debug: (message: string, ...args: unknown[]) => {
        if (!isProduction) {
            console.debug(`[DEBUG] [${new Date().toLocaleTimeString()}] ${message}`, ...args);
        }
    }
};
