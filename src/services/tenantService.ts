import { supabase } from '@/lib/supabase';

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
