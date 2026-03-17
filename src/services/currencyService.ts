/**
 * CurrencyService
 * 
 * Provides institutional-grade currency conversion and localized formatting.
 * Supports dynamic exchange rates and tenant-specific financial displays.
 */

export interface CurrencyConfig {
    code: string;       // e.g. 'NGN', 'USD', 'GHS'
    symbol: string;     // e.g. '₦', '$', '₵'
    locale: string;     // e.g. 'en-NG', 'en-US'
    precision: number;  // e.g. 2
}

export class CurrencyService {
    // Dynamic rates (updated from simulated API)
    private static rates: Record<string, number> = {
        USD: 1.0,
        NGN: 1550.0,
        KES: 130.0,
        GHS: 13.0,
        ZAR: 19.0,
        GBP: 0.79,
        EUR: 0.92
    };

    /**
     * Converts an amount between currencies.
     */
    static convert(amount: number, from: string, to: string): number {
        if (from === to) return amount;

        const baseAmount = amount / (this.rates[from.toUpperCase()] || 1);
        const converted = baseAmount * (this.rates[to.toUpperCase()] || 1);

        // Institutional precision rounding
        return Number(converted.toFixed(4));
    }

    /**
     * Formats a numeric value as a localized currency string.
     */
    static format(amount: number, currency: string = 'NGN', locale: string = 'en-NG'): string {
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency.toUpperCase(),
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (e) {
            // Fallback for unsupported locales/currencies
            return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
        }
    }

    /**
     * Specialized compact formatter for analytics dashboards.
     */
    static formatCompact(amount: number, currency: string = 'NGN', locale: string = 'en-NG'): string {
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency.toUpperCase(),
                notation: 'compact',
                maximumFractionDigits: 1
            }).format(amount);
        } catch (e) {
            return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
        }
    }

    /**
     * Get the symbol for a currency.
     */
    static getSymbol(currency: string): string {
        const symbols: Record<string, string> = {
            'NGN': '₦',
            'USD': '$',
            'KES': 'KSh',
            'GHS': 'GH₵',
            'ZAR': 'R',
            'GBP': '£',
            'EUR': '€'
        };
        return symbols[currency.toUpperCase()] || currency;
    }

    /**
     * Get the code for a currency.
     */
    static getCode(currency: string): string {
        return currency.toUpperCase();
    }

    /**
     * Fetches latest exchange rates from an external provider (Placeholder).
     */
    static async refreshRates(): Promise<void> {
        console.log('[CurrencyService] Refreshing institutional exchange rates...');
    }
}
