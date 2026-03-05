export interface ExchangeRate {
    from: string;
    to: string;
    rate: number;
    updated_at: string;
}

export class CurrencyService {
    private static rates: Record<string, number> = {
        'USD': 1.0,
        'NGN': 1550.0,
        'KES': 130.0,
        'GHS': 13.0,
        'ZAR': 19.0,
        'GBP': 0.79,
        'EUR': 0.92
    };

    /**
     * Converts an amount from one currency to another using simulated real-time rates.
     */
    static convert(amount: number, from: string, to: string): number {
        if (from === to) return amount;

        const baseAmount = amount / (this.rates[from] || 1);
        const targetAmount = baseAmount * (this.rates[to] || 1);

        return targetAmount;
    }

    /**
     * Returns the symbol for a given currency code.
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
     * Formats a value according to the currency code and institutional standards.
     */
    static format(amount: number, currency: string): string {
        const symbol = this.getSymbol(currency);
        return `${symbol}${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    /**
     * Fetches the current exchange rate for institutional reporting.
     */
    static getRate(from: string, to: string): number {
        if (from === to) return 1;
        return (this.rates[to] || 1) / (this.rates[from] || 1);
    }
}
