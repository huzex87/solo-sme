import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TenantService } from '@/services/tenantService';

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        // 1. Authenticate user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { tenantId, bankName, accountNumber, accountName } = body;

        if (!tenantId || !bankName || !accountNumber || !accountName) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // 2. Authorize user (Must be the tenant owner or a superadmin)
        const tenant = await TenantService.getTenant(tenantId, supabase);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_superadmin')
            .eq('id', user.id)
            .single();

        const isOwner = tenant.owner_id === user.id;
        const isSuperAdmin = !!profile?.is_superadmin;

        if (!isOwner && !isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 3. Provision the subaccount
        const result = await TenantService.provisionSubaccount(
            tenantId,
            bankName,
            accountNumber,
            accountName,
            supabase
        );

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Subaccount provisioning failed' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            subaccountCode: result.subaccountCode
        });
    } catch (error) {
        console.error('[Subaccount API Error]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
