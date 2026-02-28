import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    brand_color: string;
    logo_url?: string;
    ai_onboarding_completed: boolean;
}

export class TenantService {
    /**
     * Fetches tenant details by subdomain.
     */
    static async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
        if (!isSupabaseConfigured) {
            return {
                id: 't1',
                name: 'Artisan Soul',
                subdomain: 'demo-boutique',
                brand_color: '#1a237e',
                ai_onboarding_completed: true
            };
        }

        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('subdomain', subdomain)
            .single();

        if (error) {
            console.error('Error fetching tenant:', error);
            return null;
        }

        return data;
    }

    /**
     * Initializes a new tenant after AI onboarding.
     */
    static async createTenant(tenantData: Partial<Tenant>): Promise<Tenant | null> {
        if (!isSupabaseConfigured) {
            return {
                id: 't-' + Math.random().toString(36).substr(2, 9),
                name: tenantData.name || 'New Store',
                subdomain: tenantData.subdomain || 'new-store',
                brand_color: tenantData.brand_color || '#1a237e',
                ai_onboarding_completed: true
            };
        }

        const { data, error } = await supabase
            .from('tenants')
            .insert(tenantData)
            .select()
            .single();

        if (error) {
            console.error('Error creating tenant:', error);
            return null;
        }

        return data;
    }
}
