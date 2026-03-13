export function getBaseUrl() {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    // Handle server-side absolute URL
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Fallback for local development
    return "http://localhost:3000";
}
