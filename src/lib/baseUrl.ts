/**
 * Resolves the base URL for the application.
 * Priority: NEXT_PUBLIC_APP_URL > VERCEL_URL > window.location.origin (client-only)
 */
export function getBaseUrl(): string {
    // 1. Check for configured Production/Staging URL (e.g., https://solosme.ng)
    let url = process.env.NEXT_PUBLIC_APP_URL;

    // 2. Fallback to Vercel deployment URL
    if (!url && process.env.VERCEL_URL) {
        url = `https://${process.env.VERCEL_URL}`;
    }

    // 3. Client-side fallback
    if (!url && typeof window !== 'undefined') {
        url = window.location.origin;
    }

    // 4. Ultimate Production Fallback (Safety net for server-side execution without env vars)
    if (!url || url.includes('localhost') === false && !url.startsWith('http')) {
        // If we still don't have a valid URL and we are not in local dev, 
        // default to the production domain.
        if (process.env.NODE_ENV === 'production') {
            url = 'https://solosme.ng';
        }
    }

    // 5. Default for local development
    url = url || 'http://localhost:3000';

    // ── DEFENSIVE HARDENING ──
    // "Failed to parse URL from /pipeline" suggests a relative string leaked into a base URL slot.
    if (url === '/pipeline' || !url.startsWith('http')) {
        console.error(`[getBaseUrl] CRITICAL: Invalid base URL detected: "${url}". Falling back to production safety.`);
        url = process.env.NODE_ENV === 'production' ? 'https://solosme.ng' : 'http://localhost:3000';
    }

    // Remove trailing slash if present
    return url.replace(/\/$/, '');
}

