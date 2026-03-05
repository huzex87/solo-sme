export interface TaxRule {
    rate: number;
    name: string;
    isIncluded: boolean;
}

export class TaxService {
    private static TAX_RULES: Record<string, TaxRule> = {
        'NGN': { rate: 0.075, name: 'VAT', isIncluded: false }, // Nigeria 7.5%
        'GHS': { rate: 0.15, name: 'VAT', isIncluded: false },  // Ghana 15%
        'KES': { rate: 0.16, name: 'VAT', isIncluded: false },  // Kenya 16%
        'ZAR': { rate: 0.15, name: 'VAT', isIncluded: false },  // South Africa 15%
        'USD': { rate: 0, name: 'Sales Tax', isIncluded: false } // Placeholder/Dynamic
    };

    /**
     * Get tax rule based on currency/region.
     */
    static getTaxRule(currency: string = 'NGN'): TaxRule {
        return this.TAX_RULES[currency.toUpperCase()] || { rate: 0, name: 'Tax', isIncluded: false };
    }

    /**
     * Calculate tax amount for a given subtotal.
     */
    static calculateTax(subtotal: number, currency: string = 'NGN'): number {
        const rule = this.getTaxRule(currency);
        if (rule.isIncluded) return 0;
        return Math.round(subtotal * rule.rate);
    }

    /**
     * Calculate total including tax.
     */
    static calculateTotal(subtotal: number, deliveryFee: number, currency: string = 'NGN'): {
        tax: number;
        total: number;
        rule: TaxRule;
    } {
        const tax = this.calculateTax(subtotal, currency);
        const rule = this.getTaxRule(currency);
        return {
            tax,
            total: subtotal + deliveryFee + tax,
            rule
        };
    }

    /**
     * Generate a tax summary for reporting.
     */
    static getTaxSummary(orders: any[], currency: string = 'NGN'): {
        totalTax: number;
        taxName: string;
        taxRate: number;
    } {
        const rule = this.getTaxRule(currency);
        const totalTax = orders.reduce((sum, order) => sum + (order.tax_amount || 0), 0);
        return {
            totalTax,
            taxName: rule.name,
            taxRate: rule.rate
        };
    }
}
