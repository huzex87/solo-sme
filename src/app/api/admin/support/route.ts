import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function verifySuperAdmin() {
    const supabaseCheck = await createClient();
    const { data: { user } } = await supabaseCheck.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabaseCheck.from('profiles').select('is_superadmin').eq('id', user.id).single();
    return !!profile?.is_superadmin;
}

function getServiceAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; 
    return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

export async function GET() {
    try {
        if (!(await verifySuperAdmin())) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const supabaseAdmin = getServiceAdmin();
        const { data, error } = await supabaseAdmin
            .from('platform_tickets')
            .select(`
                id, subject, description, status, priority, created_at,
                tenants:tenant_id (name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch Tickets Error:', error);
            return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
        }

        return NextResponse.json({ tickets: data });
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        if (!(await verifySuperAdmin())) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { id, status } = body;
        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
        }

        const supabaseAdmin = getServiceAdmin();
        const { error } = await supabaseAdmin
            .from('platform_tickets')
            .update({ status })
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
