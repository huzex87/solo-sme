import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Tenant } from '@/types';
import { AuditService } from './auditService';

export type { Tenant };

export class TenantService {
    /**
     * Fetches tenant details by subdomain.
     */
    static async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
        if (!isSupabaseConfigured || ['my-store', 'demo'].includes(subdomain) || !subdomain) {
            // Support storefront view in demo mode or as a universal fallback
            if (['my-store', 'demo'].includes(subdomain) || !subdomain) {
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
            .or(`subdomain.eq.${subdomain},id.eq.${subdomain}`)
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
     * Resolves a tenant by their WhatsApp phone number.
     * Used by the WebhookService for inbound message routing.
     */
    static async getTenantByPhoneNumber(phone: string): Promise<Tenant | null> {
        if (!isSupabaseConfigured) return null;

        // Clean the input phone number
        const cleanPhone = phone.replace(/\D/g, '');

        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .or(`phone.like.%${cleanPhone}%,business_config->>phone.like.%${cleanPhone}%`)
            .single();

        if (error) {
            console.error('[TenantService] Phone resolution failed:', error);
            // Try matching via bindings table as fallback
            const { data: binding } = await supabase
                .from('whatsapp_phone_bindings')
                .select('tenant_id')
                .eq('whatsapp_phone', cleanPhone)
                .single();

            if (binding) {
                return this.getTenant(binding.tenant_id);
            }
            return null;
        }

        return data;
    }

    static async getTenant(id: string): Promise<Tenant | null> {
        if (!isSupabaseConfigured) return null;
        const { data } = await supabase.from('tenants').select('*').eq('id', id).single();
        return data;
    }

    /**
     * Resolves a tenant by Meta IDs (WhatsApp Phone ID or Instagram Page ID)
     */
    static async getTenantByMetaId(id: string): Promise<Tenant | null> {
        if (!isSupabaseConfigured) {
            // Fallback for demo simulation
            return this.getTenantBySubdomain('my-store');
        }

        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .or(`business_config->>whatsapp_phone_id.eq.${id},business_config->>instagram_page_id.eq.${id}`)
            .single();

        if (error) {
            console.error('[TenantService] Meta resolution failed:', error);
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

    /**
     * Gets the WhatsApp number bound to the tenant.
     */
    static async getWhatsAppBinding(tenantId: string): Promise<string | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('whatsapp_phone_bindings')
            .select('phone_number')
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .maybeSingle();

        if (error || !data) return null;
        return data.phone_number;
    }
}
