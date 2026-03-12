import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SOLO SME — Next.js Middleware
 *
 * Protects /dashboard/* and /admin/* routes by validating the
 * Supabase session server-side (via cookies). Unauthenticated
 * visitors are redirected to /login.
 *
 * Public routes (/, /login, /signup, /store/*, /api/*, etc.)
 * are allowed through without any auth check.
 */

const PUBLIC_PATHS = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy',
    '/store',
    '/auth',
    '/api',
    '/receipt',
    '/driver',
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((prefix) =>
        prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)
    );
}

const BETA_ROUTES = [
    '/dashboard',
    '/dashboard/products',
    '/dashboard/orders',
    '/dashboard/analytics',
    '/dashboard/whatsapp',
    '/dashboard/settings',
];

function isBetaRoute(pathname: string): boolean {
    if (!pathname.startsWith('/dashboard')) return true;
    return BETA_ROUTES.some((route) =>
        route === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(route)
    );
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Allow all public routes through immediately
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // 2. Beta Feature Restriction
    if (!isBetaRoute(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2. If Supabase is not configured (dev/demo mode), allow through
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        supabaseUrl.includes('your-project') ||
        supabaseUrl.includes('placeholder')
    ) {
        // Demo mode — no auth enforcement
        return NextResponse.next();
    }

    // 3. Create a Supabase server client that reads/writes cookies
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                response = NextResponse.next({
                    request: { headers: request.headers },
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                );
            },
        },
    });

    // 4. Validate the session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 5. No valid session → redirect to login
    if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 6. Authenticated — allow through and refresh cookies

    // 7. Security Headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // CSP - Adjusted for Supabase/Resend/Analytics
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.posthog.com https://*.sentry.io;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' blob: data: https://*.supabase.co https://*.posthog.com;
        connect-src 'self' https://*.supabase.co https://*.posthog.com https://*.sentry.io;
        worker-src 'self' blob:;
        frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except static files and images.
         * This runs the middleware on all non-static routes.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
