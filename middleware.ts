import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const host = request.headers.get('host') || '';

    // Skip internal paths, static assets, auth, and dashboard routes
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/favicon.ico') ||
        url.pathname.startsWith('/api') ||
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

    try {
        // Dynamic import to avoid initialization errors
        const { DomainService } = await import('./src/services/domainService');
        const tenant = await DomainService.resolveTenant(host);

        if (tenant) {
            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = `/store/${tenant.subdomain}${url.pathname}`;
            return NextResponse.rewrite(rewriteUrl);
        }
    } catch {
        // Supabase not configured or network error — continue normally
        console.warn('[SOLO Middleware] Tenant resolution skipped');
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
