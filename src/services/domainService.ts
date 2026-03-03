import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface DomainVerification {
    domain: string;
    status: 'pending' | 'verified' | 'failed';
    type: 'subdomain' | 'custom';
}

export class DomainService {
    /**
     * Checks if a custom domain or subdomain is available.
     */
    static async checkAvailability(name: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { data } = await supabase
            .from('tenants')
            .select('id')
            .eq('subdomain', name)
            .maybeSingle();

        return !data;
    }

    /**
     * Registers a custom domain (Simulation via Vercel logic placeholder).
     */
    static async registerCustomDomain(tenantId: string, domain: string): Promise<DomainVerification> {
        console.log(`[DomainService] Registering domain ${domain} for ${tenantId}`);
        // In production, this hits the Vercel Domains API
        return {
            domain,
            status: 'pending',
            type: 'custom'
        };
    }
}
