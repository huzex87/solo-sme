import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('[Auth Callback] Error exchanging code:', error.message);
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
            );
        }
    }

    // Successful auth — redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
