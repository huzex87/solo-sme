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
     */
    static async calculateTax(subtotal: number, tenantId: string, currency: string = 'NGN'): Promise<number> {
        const rule = await this.getActiveTaxRule(tenantId, currency);
        if (rule.is_included) return 0;
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
        const tax = rule.is_included ? 0 : Math.round(subtotal * rule.rate);

        return {
            tax,
            total: subtotal + deliveryFee + tax,
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
