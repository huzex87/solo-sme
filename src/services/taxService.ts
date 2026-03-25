import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

export interface TaxRule {
    id?: string;
    rate: number;
    name: string;
    is_included?: boolean;
    country_code?: string;
    is_active?: boolean;
}

export class TaxService {
    private static supabase = createClient();

    // Institutional fallbacks if DB is unreachable or rules are empty
    private static FALLBACK_RULES: Record<string, TaxRule> = {
        'NGN': { rate: 0.075, name: 'VAT', is_included: false, country_code: 'NG' },
        'GHS': { rate: 0.15, name: 'VAT', is_included: false, country_code: 'GH' },
        'KES': { rate: 0.16, name: 'VAT', is_included: false, country_code: 'KE' },
        'USD': { rate: 0, name: 'Sales Tax', is_included: false, country_code: 'US' }
    };

    /**
     * Fetches all defined tax rules for a tenant.
     */
    static async getTaxRules(tenantId: string, client?: SupabaseClient): Promise<TaxRule[]> {
        const supabase = client || this.supabase;
        const { data, error } = await supabase
            .from('tax_rules')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[TaxService] Error fetching rules:', error);
            return [];
        }

        return (data || []).map(d => ({
            id: d.id,
            name: d.name,
            rate: Number(d.rate),
            is_included: d.is_included ?? false,
            country_code: d.country_code,
            is_active: d.is_active
        }));
    }

    /**
     * Resolves the active tax rule for a tenant. 
     * Prioritizes DB-defined rules over regional fallbacks.
     */
    static async getActiveTaxRule(tenantId: string, currency: string = 'NGN', client?: SupabaseClient): Promise<TaxRule> {
        const supabase = client || this.supabase;

        try {
            const { data, error } = await supabase
                .from('tax_rules')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('is_active', true)
                .maybeSingle();

            if (data && !error) {
                return {
                    id: data.id,
                    name: data.name,
                    rate: Number(data.rate),
                    is_included: data.is_included ?? false,
                    country_code: data.country_code
                };
            }
        } catch (e) {
            console.warn('[TaxService] DB fetch failed, using fallback', e);
        }

        return this.FALLBACK_RULES[currency.toUpperCase()] || { rate: 0, name: 'Tax', is_included: false };
    }

    /**
     * Calculate tax amount with dynamic rule resolution.
     * Ensures high-precision rounding for financial compliance.
     */
    static async calculateTax(subtotal: number, tenantId: string, currency: string = 'NGN'): Promise<number> {
        const rule = await this.getActiveTaxRule(tenantId, currency);
        if (!rule || rule.rate === 0) return 0;

        if (rule.is_included) {
            // Tax is already in the price: tax = subtotal - (subtotal / (1 + rate))
            return Math.round(subtotal - (subtotal / (1 + rule.rate)));
        }
        return Math.round(subtotal * rule.rate);
    }

    /**
     * Comprehensive total calculation used in Checkout/Orders.
     */
    static async calculateTotal(subtotal: number, deliveryFee: number, tenantId: string, currency: string = 'NGN'): Promise<{
        tax: number;
        total: number;
        rule: TaxRule;
    }> {
        const rule = await this.getActiveTaxRule(tenantId, currency);
        let tax = 0;
        let total = 0;

        if (rule.is_included) {
            tax = Math.round(subtotal - (subtotal / (1 + rule.rate)));
            total = subtotal + deliveryFee;
        } else {
            tax = Math.round(subtotal * rule.rate);
            total = subtotal + deliveryFee + tax;
        }

        return {
            tax,
            total,
            rule
        };
    }

    /**
     * Create or Update a custom tax rule for a tenant.
     */
    static async saveTaxRule(tenantId: string, rule: Partial<TaxRule>) {
        const { data, error } = await this.supabase
            .from('tax_rules')
            .upsert({
                tenant_id: tenantId,
                name: rule.name,
                rate: rule.rate,
                is_active: true,
                ...rule
            })
            .select()
            .single();

        return { data, error };
    }
}
