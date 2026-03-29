import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Temporary diagnostic route — remove after confirming OAuth URL is correct */
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const appId = process.env.NEXT_PUBLIC_META_APP_ID || '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const redirectUri = `${appUrl.replace(/\/$/, '')}/api/social/callback`;

    return NextResponse.json({
        NEXT_PUBLIC_META_APP_ID_set: !!appId,
        NEXT_PUBLIC_META_APP_ID_value: appId ? `${appId.slice(0, 4)}...${appId.slice(-4)}` : '(empty)',
        NEXT_PUBLIC_APP_URL: appUrl || '(empty)',
        redirect_uri: redirectUri,
        META_APP_SECRET_set: !!process.env.META_APP_SECRET,
        META_APP_ID_set: !!process.env.META_APP_ID,
    });
}
