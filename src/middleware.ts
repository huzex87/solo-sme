import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DomainService } from '@/services/domainService';

/**
 * SOLO SME Unified Middleware
 * Handles Tenant Resolution, Authentication, and Security Headers.
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
    '/api',
    '/receipt',
    '/driver',
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/monitoring',
];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((prefix) =>
        prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)
    );
}

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const { pathname } = url;
    const host = request.headers.get('host') || '';

    // 1. Skip internal paths and static assets early
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // matches files with extensions
    ) {
        return NextResponse.next();
    }

    // 2. Tenant Resolution (Storefront Logic)
    // If not a system path, try to resolve as a tenant store
    const isSystemPath =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/store');

    if (!isSystemPath) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
            try {
                const tenant = await DomainService.resolveTenant(host);
                if (tenant) {
                    const rewriteUrl = request.nextUrl.clone();
                    rewriteUrl.pathname = `/store/${tenant.subdomain}${pathname}`;
                    return NextResponse.rewrite(rewriteUrl);
                }
            } catch (err) {
                console.error('[Middleware] Tenant resolution error:', err);
            }
        }
    }

    // 3. Authentication & Authorization (Dashboard/Admin Logic)
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (
            supabaseUrl &&
            supabaseAnonKey &&
            !supabaseUrl.includes('your-project') &&
            !supabaseUrl.includes('placeholder')
        ) {
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

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('redirect', pathname);
                return NextResponse.redirect(loginUrl);
            }

            // Add security headers to normalized response
            addSecurityHeaders(response);
            return response;
        }
    }

    // Default response
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
}

function addSecurityHeaders(response: NextResponse) {
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-scripts.com https://*.vercel.app https://app.posthog.com https://*.posthog.com https://*.sentry.io;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: blob: https: https://app.posthog.com;
        connect-src 'self' https://*.supabase.co https://*.paystack.com https://*.facebook.com https://*.googleapis.com https://app.posthog.com https://*.posthog.com https://*.sentry.io;
        worker-src 'self' blob:;
        frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
    ],
};
