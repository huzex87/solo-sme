/**
 * SOLO Master UIX Guide v3.0 — Precision Currency Utility
 * Force-injects ₦ Unicode for NGN to ensure cross-pixel consistency.
 */
export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
    const isNGN = currency.toUpperCase() === 'NGN';

    // Format the number part with standard separators
    const formattedNumber = new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

    if (isNGN) {
        // Strict requirement: Unicode ₦ symbol
        return `₦${formattedNumber}`;
    }

    // Support for international expansion (Phase 39)
    const symbols: Record<string, string> = {
        'USD': '$',
        'GHS': 'GH₵',
        'KES': 'KSh',
        'ZAR': 'R'
    };

    const symbol = symbols[currency.toUpperCase()] || currency.toUpperCase();
    return `${symbol}${formattedNumber}`;
};

/** @deprecated Use formatCurrency(amount, 'NGN') */
export const formatNaira = (amount: number): string => {
    return formatCurrency(amount, 'NGN');
};
