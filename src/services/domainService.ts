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
     * optimized for Middleware / Edge Runtime.
     */
    static async resolveTenant(host: string): Promise<{ id: string; subdomain: string } | null> {
        if (!isSupabaseConfigured) return null;

        // 1. Extract subdomain correctly
        const parts = host.split('.');

        // Handle localhost or direct IP
        if (parts.length < 2 && host !== 'localhost') return null;

        const subdomain = parts[0];

        // 2. High-speed short-circuit for platform domains
        if (['www', 'api', 'app', 'localhost', 'solo-sme'].includes(subdomain.toLowerCase())) {
            return null;
        }

        // 3. Database lookup with strict selection
        const { data, error } = await supabase
            .from('tenants')
            .select('id, subdomain')
            .eq('subdomain', subdomain)
            .maybeSingle();

        if (error) {
            console.error('[DomainService] Resolution error:', error.message);
            return null;
        }

        return data;
    }
}
