import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MetaCatalogService } from '@/services/metaCatalogService';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const catalogId = searchParams.get('catalogId');
        const tenantId = searchParams.get('tenantId');

        if (!catalogId || !tenantId) {
            return NextResponse.json({ error: 'Catalog ID and Tenant ID required' }, { status: 400 });
        }

        // Validate tenant ownership
        const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('id', tenantId)
            .eq('owner_id', user.id)
            .single();

        if (!tenant) {
            return NextResponse.json({ error: 'Forbidden: you do not own this tenant' }, { status: 403 });
        }

        // 1. Get the access token for this tenant
        const { data: accounts, error: accountError } = await supabase
            .from('social_accounts')
            .select('access_token')
            .eq('tenant_id', tenantId)
            .eq('is_connected', true);

        let accessToken = accounts?.[0]?.access_token;

        if (!accessToken) {
            accessToken = process.env.META_SYSTEM_USER_TOKEN;
        }

        if (!accessToken) {
            return NextResponse.json({ error: 'Social account not connected and no system token available' }, { status: 404 });
        }

        // 2. Fetch products from the catalog
        const products = await MetaCatalogService.getCatalogProducts(catalogId, accessToken);

        return NextResponse.json({ products });
    } catch (error: any) {
        logger.error('[API Catalog Products] Unexpected error', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
