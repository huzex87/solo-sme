import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DomainService } from '@/services/domainService';

/**
 * SOLO SME Unified Middleware
 * Handles Tenant Resolution, Authentication, and Security Headers.
 */

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const { pathname } = url;
    const host = request.headers.get('host') || '';

    // 1. Skip internal paths and static assets early
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // 2. Initialize Supabase SSR and Sync Cookies early
    // This MUST happen before any rewrites or redirects to ensure session persistence.
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        const supabase = createServerClient(supabaseUrl, supabaseKey, {
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

        // Refresh session and get user
        const { data: { user } } = await supabase.auth.getUser();

        // 3. Protected Routes
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
            if (!user) {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('redirect', pathname);
                return NextResponse.redirect(loginUrl);
            }

            // Special check for /admin (Super Admin only - Fixed for Phase 5)
            if (pathname.startsWith('/admin')) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_superadmin')
                    .eq('id', user.id)
                    .single();

                if (!profile?.is_superadmin) {
                    console.warn(`[Middleware] Unauthorized admin access attempt by user ${user.id}`);
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }
        }

        // 4. Tenant Resolution (Storefront Logic)
        // If not a system path, try to resolve as a tenant store
        const isSystemPath =
            pathname.startsWith('/dashboard') ||
            pathname.startsWith('/admin') ||
            pathname.startsWith('/login') ||
            pathname.startsWith('/signup') ||
            pathname.startsWith('/auth') ||
            pathname.startsWith('/store') ||
            pathname.startsWith('/receipt') ||
            pathname.startsWith('/pay');

        if (!isSystemPath) {
            try {
                const tenant = await DomainService.resolveTenant(host, supabase);
                if (tenant) {
                    const rewriteUrl = request.nextUrl.clone();
                    rewriteUrl.pathname = `/store/${tenant.subdomain}${pathname}`;

                    // Create rewrite response but preserve cookies and headers from the auth-synced response
                    const rewriteResponse = NextResponse.rewrite(rewriteUrl);

                    // Copy all cookies from our auth-tracked response to the rewrite response
                    response.cookies.getAll().forEach((cookie) => {
                        rewriteResponse.cookies.set(cookie.name, cookie.value);
                    });

                    return rewriteResponse;
                }
            } catch (err) {
                console.error('[Middleware] Tenant resolution error:', err);
            }
        }
    }

    // Default response with security headers
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
        script-src 'self' 'unsafe-inline' https://js.paystack.co https://checkout.flutterwave.com https://*.vercel-scripts.com https://*.vercel.app https://app.posthog.com https://*.posthog.com https://*.sentry.io;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com data:;
        img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://res.cloudinary.com https://app.posthog.com;
        connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://api.flutterwave.com https://*.facebook.com https://generativelanguage.googleapis.com https://app.posthog.com https://*.posthog.com https://*.sentry.io https://*.ingest.sentry.io;
        frame-src 'self' https://js.paystack.co https://checkout.flutterwave.com;
        worker-src 'self' blob:;
        object-src 'none';
        base-uri 'self';
        frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
    ],
};
