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
            new URL(`/dashboard/import?social_error=${encodeURIComponent(errorDescription || 'Access denied')}`, req.url)
        );
    }

    if (!code || !state) {
        return NextResponse.redirect(
            new URL('/dashboard/import?social_error=Missing+authorization+code', req.url)
        );
    }

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Validate state parameter contains a tenantId owned by the authenticated user
    try {
        const stateData = JSON.parse(atob(state));
        if (!stateData.tenantId || !stateData.platform) {
            return NextResponse.redirect(
                new URL('/dashboard/import?social_error=Invalid+state+parameter', req.url)
            );
        }

        const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('id', stateData.tenantId)
            .eq('owner_id', user.id)
            .single();

        if (!tenant) {
            console.error('[Social OAuth] Tenant ownership validation failed', {
                userId: user.id,
                tenantId: stateData.tenantId,
            });
            return NextResponse.redirect(
                new URL('/dashboard/import?social_error=Unauthorized+tenant+access', req.url)
            );
        }
    } catch (parseErr) {
        console.error('[Social OAuth] Failed to parse state parameter:', parseErr);
        return NextResponse.redirect(
            new URL('/dashboard/import?social_error=Invalid+state+parameter', req.url)
        );
    }

    try {
        const origin = new URL(req.url).origin;
        const result = await SocialImportService.handleOAuthCallback(code, state, supabase, origin);

        if (result.success) {
            // Decode state to get platform info for the redirect
            const { platform } = JSON.parse(atob(state));
            return NextResponse.redirect(
                new URL(`/dashboard/import?social_connected=${platform}&account=${encodeURIComponent(result.account?.account_name || '')}`, req.url)
            );
        } else {
            return NextResponse.redirect(
                new URL(`/dashboard/import?social_error=${encodeURIComponent(result.error || 'Connection failed')}`, req.url)
            );
        }
    } catch (err) {
        console.error('[Social OAuth] Callback processing error:', err);
        return NextResponse.redirect(
            new URL('/dashboard/import?social_error=Connection+failed', req.url)
        );
    }
}
