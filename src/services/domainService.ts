import { TenantService, Tenant } from './tenantService';
import { supabase } from '@/lib/supabase';

export class DomainService {
    /**
     * Resolves a tenant based on the request hostname.
     * Supports both subdomains (tenant.solo.com) and custom domains (shop.brand.com).
     */
    static async resolveTenant(host: string): Promise<Tenant | null> {
        // 1. Check for custom domain match first (White-labeling)
        const { data: customMatch } = await supabase
            .from('tenants')
            .select('*')
            .eq('custom_domain', host)
            .single();

        if (customMatch) return customMatch;

        // 2. Fallback to subdomain check
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'solo') {
            return await TenantService.getTenantBySubdomain(subdomain);
        }

        return null;
    }
}
