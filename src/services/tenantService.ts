import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    brand_color: string;
    accent_color?: string;
    logo_url?: string;
    logo_file_path?: string;
    font_family?: string;
    hero_title?: string;
    hero_subtitle?: string;
    hero_cta_text?: string;
    layout_style?: 'grid' | 'list' | 'masonry';
    store_description?: string;
    currency?: string;
    ai_onboarding_completed: boolean;
    owner_id?: string;
}

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
