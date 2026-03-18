import { NextRequest, NextResponse } from 'next/server';
import { SocialImportService } from '@/services/socialImportService';
import { createClient } from '@/lib/supabase/server';

/**
 * Meta OAuth Callback Handler
 * Handles the redirect from Facebook/Instagram/WhatsApp Business OAuth flow.
 * Exchanges the code for a token and saves the connected account.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth denial
    if (error) {
        console.error('[Social OAuth] User denied access:', errorDescription);
        return NextResponse.redirect(
            new URL(`/dashboard/settings?social_error=${encodeURIComponent(errorDescription || 'Access denied')}`, req.url)
        );
    }

    if (!code || !state) {
        return NextResponse.redirect(
            new URL('/dashboard/settings?social_error=Missing+authorization+code', req.url)
        );
    }

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        const result = await SocialImportService.handleOAuthCallback(code, state, supabase);

        if (result.success) {
            // Decode state to get platform info for the redirect
            const { platform } = JSON.parse(atob(state));
            return NextResponse.redirect(
                new URL(`/dashboard/settings?social_connected=${platform}&account=${encodeURIComponent(result.account?.account_name || '')}`, req.url)
            );
        } else {
            return NextResponse.redirect(
                new URL(`/dashboard/settings?social_error=${encodeURIComponent(result.error || 'Connection failed')}`, req.url)
            );
        }
    } catch (err) {
        console.error('[Social OAuth] Callback processing error:', err);
        return NextResponse.redirect(
            new URL('/dashboard/settings?social_error=Connection+failed', req.url)
        );
    }
}
