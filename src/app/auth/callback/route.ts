import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('[Auth Callback] Error exchanging code:', error.message);
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
            );
        }
    }

    // Successful auth — redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
}

