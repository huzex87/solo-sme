import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Tenant } from '@/types';
import { AuditService } from './auditService';

export type { Tenant };

export class TenantService {
    /**
     * Fetches tenant details by subdomain.
     */
    static async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
        if (!isSupabaseConfigured || subdomain === 'my-store' || !subdomain) {
            // Support storefront view in demo mode or as a universal fallback
            if (subdomain === 'my-store' || !subdomain) {
                return {
                    id: 'demo',
                    name: 'My Business',
                    subdomain: 'my-store',
                    branding_config: {
                        primaryColor: '#0A7B6C',
                        borderRadius: '12px',
                        hero: {
                            title: 'My Business Demo Store',
                            subtitle: 'Experience the power of SOLO SME. This is a preview of your future storefront.',
                            ctaText: 'Shop the Collection'
                        }
                    },
                    created_at: new Date().toISOString()
                } as unknown as Tenant;
            }
            if (!isSupabaseConfigured) return null;
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
        }

        if (data) {
            await AuditService.logAction({
                tenant_id: id,
                action: 'update_config',
                entity_type: 'config',
                entity_id: id,
                metadata: updates
            });
        }

        return data;
    }
}
