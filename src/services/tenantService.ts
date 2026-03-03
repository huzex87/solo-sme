import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Tenant } from '@/types';

export type { Tenant };

export class TenantService {
    /**
     * Fetches tenant details by subdomain.
     */
    static async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
        if (!isSupabaseConfigured) return null;

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
        if (!isSupabaseConfigured) return null;

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

    /**
     * Updates an existing tenant.
     */
    static async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('tenants')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating tenant:', error);
            return null;
        }

        return data;
    }
}
