/**
 * Resolves the base URL for the application.
 * Priority: NEXT_PUBLIC_APP_URL > VERCEL_URL > window.location.origin (client-only)
 */
export function getBaseUrl(): string {
    let url: string | undefined;
    
    // 1. Client-side fallback (HIGHEST PRIORITY - matches current user environment)
    if (typeof window !== 'undefined') {
        url = window.location.origin;
    }

    // 2. Fallback to process.env.NEXT_PUBLIC_APP_URL if not on client
    if (!url) {
        url = process.env.NEXT_PUBLIC_APP_URL;
    }

    // 3. Fallback to Vercel deployment URL
    if (!url && process.env.VERCEL_URL) {
        url = `https://${process.env.VERCEL_URL}`;
    }

    // 4. Default for local development environment
    if (!url) {
        url = 'http://localhost:3000';
    }

    // ── DEFENSIVE HARDENING ──
    // If NEXT_PUBLIC_APP_URL is localhost:3000 but we are in production (server-side),
    // and we don't have a window context, we must use the production domain.
    if (url.includes('localhost') && process.env.NODE_ENV === 'production') {
        url = 'https://solosme.ng';
    }

    // ── DEFENSIVE HARDENING ──
    // "Failed to parse URL from /pipeline" suggests a relative string leaked into a base URL slot.
    if (!url || url === '/pipeline' || !url.startsWith('http')) {
        console.error(`[getBaseUrl] CRITICAL: Invalid base URL detected: "${url}". Falling back to production safety.`);
        url = process.env.NODE_ENV === 'production' ? 'https://solosme.ng' : 'http://localhost:3000';
    }


    // Remove trailing slash if present
    return url.replace(/\/$/, '');
}

