/**
 * Resolves the base URL for the application.
 * Priority: NEXT_PUBLIC_APP_URL > VERCEL_URL > window.location.origin (client-only)
 */
export function getBaseUrl(): string {
    // 1. Check for configured Production/Staging URL
    let url = process.env.NEXT_PUBLIC_APP_URL;

    // 2. Fallback to Vercel deployment URL
    if (!url && process.env.VERCEL_URL) {
        url = `https://${process.env.VERCEL_URL}`;
    }

    // 3. Client-side fallback
    if (!url && typeof window !== 'undefined') {
        url = window.location.origin;
    }

    // 4. Default for local development
    url = url || 'http://localhost:3000';

    // ── DEFENSIVE HARDENING ──
    // Ensure the URL is absolute and doesn't contain a relative path like "/pipeline".
    // "Failed to parse URL from /pipeline" suggests a relative string leaked into a base URL slot.
    if (!url.startsWith('http')) {
        console.warn(`[getBaseUrl] Invalid base URL detected: "${url}". Falling back to localhost.`);
        return 'http://localhost:3000';
    }

    // Remove trailing slash if present
    return url.replace(/\/$/, '');
}
