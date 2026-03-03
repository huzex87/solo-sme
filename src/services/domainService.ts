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
    /**
     * Resolves a tenant from a hostname (subdomain-based routing).
     * Used by middleware to rewrite requests to the correct store.
     */
    static async resolveTenant(host: string): Promise<{ id: string; subdomain: string } | null> {
        if (!isSupabaseConfigured) return null;

        // Extract subdomain from host (e.g., "demo-boutique.solo.app" -> "demo-boutique")
        const parts = host.split('.');
        if (parts.length < 2) return null;

        const subdomain = parts[0];
        // Skip common non-tenant subdomains
        if (['www', 'api', 'localhost', 'app'].includes(subdomain)) return null;

        const { data } = await supabase
            .from('tenants')
            .select('id, subdomain')
            .eq('subdomain', subdomain)
            .maybeSingle();

        return data || null;
    }
}
