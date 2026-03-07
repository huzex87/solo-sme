/*
 * Standard Next.js Middleware for Tenant Resolution
 * optimized for standard production performance.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DomainService } from '@/services/domainService';

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const host = request.headers.get('host') || '';

    // Skip internal paths, static assets, auth, and dashboard routes
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/favicon.ico') ||
        url.pathname.startsWith('/api') ||
        url.pathname.startsWith('/auth/callback') ||
        url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/signup') ||
        url.pathname.startsWith('/dashboard') ||
        url.pathname.startsWith('/store')
    ) {
        return NextResponse.next();
    }

    // Only attempt tenant resolution if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
        return NextResponse.next();
    }

    let response: NextResponse;

    try {
        // Use static import for faster execution
        const tenant = await DomainService.resolveTenant(host);

        if (tenant) {
            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = `/store/${tenant.subdomain}${url.pathname}`;
            response = NextResponse.rewrite(rewriteUrl);
        } else {
            response = NextResponse.next();
        }
    } catch (err) {
        console.error('[Middleware] Runtime error:', err);
        response = NextResponse.next();
    }

    // 4. CSRF Protection for API routes
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) && request.nextUrl.pathname.startsWith('/api')) {
        const origin = request.headers.get('origin');
        const host = request.headers.get('host');

        if (origin && !origin.includes(host || '')) {
            return new NextResponse(
                JSON.stringify({ error: 'CSRF Forbidden: Origin mismatch' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // 5. Security Headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-scripts.com https://*.vercel.app https://app.posthog.com https://*.posthog.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: https://app.posthog.com; connect-src 'self' https://*.supabase.co https://*.paystack.com https://*.facebook.com https://*.googleapis.com https://app.posthog.com https://*.posthog.com https://*.sentry.io;"
    );

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - All files with an extension (e.g. logo.png, styles.css)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
    ],
};
