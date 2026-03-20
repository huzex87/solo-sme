import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const host = request.headers.get('host') || '';
    const hostname = host.split(':')[0].toLowerCase();
    const subdomain = hostname.split('.')[0];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Supabase not configured', supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Direct query
    const { data: allTenants, error: allErr } = await supabase
        .from('tenants')
        .select('id, subdomain')
        .limit(5);

    // Test 2: Specific subdomain query
    const { data: tenant, error: tenantErr } = await supabase
        .from('tenants')
        .select('id, subdomain')
        .eq('subdomain', subdomain)
        .maybeSingle();

    return NextResponse.json({
        host,
        hostname,
        subdomain,
        tenant,
        tenantError: tenantErr?.message || null,
        allTenants,
        allTenantsError: allErr?.message || null,
    });
}
