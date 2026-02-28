import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DomainService } from './src/services/domainService';

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const host = request.headers.get('host') || '';

    // Skip internal paths or static assets
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/favicon.ico') ||
        url.pathname.startsWith('/api')
    ) {
        return NextResponse.next();
    }

    // Resolve tenant based on domain/subdomain
    const tenant = await DomainService.resolveTenant(host);

    if (tenant) {
        // Rewrite to the tenant-specific page structure
        // e.g., /view/[subdomain]/path
        const url = request.nextUrl.clone();
        url.pathname = `/store/${tenant.subdomain}${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
