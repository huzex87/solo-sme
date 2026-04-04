import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { is_active } = body;

        // Verify Caller Auth
        const supabaseAuth = await createClient();
        const { data: { user } } = await supabaseAuth.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabaseAuth.from('profiles').select('is_superadmin').eq('id', user.id).single();
        if (!profile?.is_superadmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // Instantiate Service Role Client to bypass RLS modifications
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Fallback for local dev if missing
        
        const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Toggle Tenant Suspension
        const { error: updateError } = await supabaseAdmin
            .from('tenants')
            .update({ is_active: !!is_active })
            .eq('id', id);

        if (updateError) {
            console.error('Suspend Tenant error:', updateError);
            return NextResponse.json({ error: 'Failed to update tenant status' }, { status: 500 });
        }

        return NextResponse.json({ success: true, is_active: !!is_active });

    } catch (error) {
        console.error('Exception suspedning tenant:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
