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
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
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

        // 1. Get the connected social account for this tenant
        const { data: accounts, error: accountError } = await supabase
            .from('social_accounts')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('is_connected', true);

        if (accountError || !accounts || accounts.length === 0) {
            // Check for System User Token fallback
            const systemToken = process.env.META_SYSTEM_USER_TOKEN;
            if (systemToken) {
                try {
                    const catalogs = await MetaCatalogService.listCatalogs(systemToken);
                    return NextResponse.json({ 
                        catalogs: catalogs.map(c => ({
                            ...c,
                            platform: 'meta_system',
                            accountId: 'system'
                        })) 
                    });
                } catch (err) {
                    logger.error('System User Token fallback failed', err);
                }
            }
            return NextResponse.json({ error: 'No connected social accounts found' }, { status: 404 });
        }

        // 2. Fetch catalogs for each connected account
        const allCatalogs = [];
        for (const account of accounts) {
            try {
                const catalogs = await MetaCatalogService.listCatalogs(account.access_token);
                allCatalogs.push(...catalogs.map(c => ({
                    ...c,
                    platform: account.platform,
                    accountId: account.id
                })));
            } catch (err) {
                logger.error(`Failed to fetch catalogs for account ${account.id}`, err);
            }
        }

        return NextResponse.json({ catalogs: allCatalogs });
    } catch (error: any) {
        logger.error('[API Catalogs] Unexpected error', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
