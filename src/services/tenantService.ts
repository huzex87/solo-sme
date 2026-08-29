import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Tenant } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

export type { Tenant };

export class TenantService {
    private static getClient(client?: SupabaseClient) {
        return client || createClient();
    }

    /**
     * Fetches tenant details by subdomain.
     */
    static async getTenantBySubdomain(subdomain: string, client?: SupabaseClient): Promise<Tenant | null> {
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

        const supabase = this.getClient(client);
        // SECURITY: storefront resolution runs under the public/anon client, so
        // it MUST read the redacted `public_tenants` view — never the base
        // `tenants` table — so merchant payment secrets can never reach the
        // browser. The view retains public keys needed by checkout.
        const { data, error } = await supabase
            .from('public_tenants')
            .select('*')
            .eq('subdomain', subdomain)
            .maybeSingle();

        if (error) {
            console.error('Error fetching tenant:', error.message, error.code);
            return null;
        }

        return data;
    }

    /**
     * Initializes a new tenant after AI onboarding.
     */
    static async createTenant(tenantData: Partial<Tenant>, client?: SupabaseClient): Promise<Tenant | null> {
        if (!isSupabaseConfigured) return null;

        const supabase = this.getClient(client);
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
    static async getTenantByPhoneNumber(phone: string, client?: SupabaseClient): Promise<Tenant | null> {
        if (!isSupabaseConfigured) return null;

        const supabase = this.getClient(client);
        const cleanPhone = phone.replace(/\D/g, '');

        // Normalise 0-prefix to 234-prefix (Nigerian numbers)
        let normalised = cleanPhone;
        if (normalised.startsWith('0') && normalised.length === 11) {
            normalised = `234${normalised.slice(1)}`;
        }
        const variants = [...new Set([normalised, cleanPhone])];

        // 1. Try resolving via dedicated bindings table (Source of Truth)
        const { data: binding } = await supabase
            .from('whatsapp_phone_bindings')
            .select('tenant_id')
            .in('phone_number', variants)
            .eq('is_active', true)
            .maybeSingle();

        if (binding) {
            return this.getTenant(binding.tenant_id, client);
        }

        // 2. Fallback to business config JSON only (avoiding non-existent top-level columns)
        for (const variant of variants) {
            const { data } = await supabase
                .from('tenants')
                .select('*')
                .or(`business_config->>phone.eq.${variant},business_config->>whatsapp_number.eq.${variant}`)
                .maybeSingle();
            if (data) return data;
        }
        
        // 3. Permissive LIKE check as last resort
        const { data: fallbackData } = await supabase
            .from('tenants')
            .select('*')
            .or(`business_config->>phone.like.%${normalised}%,business_config->>whatsapp_number.like.%${normalised}%`)
            .maybeSingle();
        if (fallbackData) return fallbackData;

        return null;
    }

    static async getTenant(id: string, client?: SupabaseClient): Promise<Tenant | null> {
        if (!isSupabaseConfigured) return null;
        const supabase = this.getClient(client);
        const { data } = await supabase.from('tenants').select('*').eq('id', id).single();
        return data;
    }

    /**
     * Resolves a tenant by Meta IDs (WhatsApp Phone ID or Instagram Page ID)
     */
    static async getTenantByMetaId(id: string, client?: SupabaseClient): Promise<Tenant | null> {
        if (!isSupabaseConfigured) {
            return this.getTenantBySubdomain('my-store', client);
        }

        const supabase = this.getClient(client);

        // 1. Check Sovereign WhatsApp Accounts (New Architecture)
        const { data: account } = await supabase
            .from('whatsapp_accounts')
            .select('tenant_id')
            .eq('phone_number_id', id)
            .maybeSingle();

        if (account) {
            return this.getTenant(account.tenant_id, client);
        }

        // 2. Fallback to Business Config (Legacy)
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .or(`business_config->>whatsapp_phone_id.eq.${id},business_config->>instagram_page_id.eq.${id}`)
            .maybeSingle();

        if (error) {
            console.error('[TenantService] Meta resolution failed:', error);
            return null;
        }

        return data;
    }

    /**
     * Updates an existing tenant.
     */
    static async updateTenant(id: string, updates: Partial<Tenant>, client?: SupabaseClient): Promise<Tenant | null> {
        if (!isSupabaseConfigured) return null;

        const supabase = this.getClient(client);
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
            const { AuditService } = await import('./auditService');
            await AuditService.logAction({
                tenant_id: id,
                action: 'update_config',
                entity_type: 'config',
                entity_id: id,
                metadata: updates
            }, client);
        }

        return data;
    }

    static async getWhatsAppBinding(tenantId: string, client?: SupabaseClient): Promise<string | null> {
        if (!isSupabaseConfigured) return null;

        const supabase = this.getClient(client);
        const { data, error } = await supabase
            .from('whatsapp_phone_bindings')
            .select('phone_number')
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .maybeSingle();

        if (error || !data) return null;
        return data.phone_number;
    }

    /**
     * Fetches all tenants for the Admin Directory with owner info.
     */
    static async getTenantsForDirectory(client?: SupabaseClient) {
        if (!isSupabaseConfigured) return [];
        const supabase = this.getClient(client);

        // Fetch tenants with owner profiles
        const { data, error } = await supabase
            .from('tenants')
            .select(`
                id, 
                name, 
                subdomain, 
                created_at, 
                business_config,
                owner_id,
                profiles!tenants_owner_id_fkey (
                    full_name,
                    id
                )
            `);

        if (error) {
            console.error('[TenantService] Error list tenants:', error);
            return [];
        }

        // Add revenue estimation from ledger if needed in the future
        return data.map(t => ({
            ...t,
            owner_name: (t.profiles as unknown as { full_name: string } | null)?.full_name || 'Unknown Owner'
        }));
    }

    /**
     * Provisions a Paystack Subaccount for a tenant if not already provisioned.
     */
    static async provisionSubaccount(
        tenantId: string, 
        bankName: string, 
        accountNumber: string, 
        accountName: string,
        client?: SupabaseClient
    ): Promise<{ success: boolean; error?: string; subaccountCode?: string }> {
        try {
            const { getBankCode } = await import('@/lib/bankCodes');
            const bankCode = getBankCode(bankName);
            
            if (!bankCode) {
                return { success: false, error: `Could not find bank code for "${bankName}"` };
            }

            const tenant = await this.getTenant(tenantId, client);
            if (!tenant) {
                return { success: false, error: 'Tenant not found' };
            }

            const secretKey = process.env.PAYSTACK_SECRET_KEY;
            if (!secretKey) {
                return { success: false, error: 'Platform Paystack key not configured' };
            }

            const currentConfig = tenant.business_config || {};
            const existingSubaccount = currentConfig.paystack_subaccount_code;

            const payload = {
                business_name: tenant.name || 'Solo SME Merchant',
                settlement_bank: bankCode,
                account_number: accountNumber,
                percentage_charge: 0,
                description: `Subaccount for ${tenant.name} (${tenantId})`
            };

            let response;
            if (existingSubaccount) {
                // Update existing subaccount
                response = await fetch(`https://api.paystack.co/subaccount/${existingSubaccount}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create new subaccount
                response = await fetch('https://api.paystack.co/subaccount', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            }

            const data = await response.json();
            
            if (!data.status) {
                return { success: false, error: data.message || 'Paystack subaccount API failed' };
            }

            const subaccountCode = data.data.subaccount_code;

            // Save subaccount_code to tenant's business_config
            const updatedConfig = {
                ...currentConfig,
                paystack_subaccount_code: subaccountCode,
                bank_name: bankName,
                bank_account_number: accountNumber,
                bank_account_name: accountName
            };

            await this.updateTenant(tenantId, {
                business_config: updatedConfig
            }, client);

            return { success: true, subaccountCode };
        } catch (err) {
            console.error('[TenantService] provisionSubaccount error:', err);
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }
}
