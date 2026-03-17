import { CurrencyService } from '@/services/currencyService';

/**
 * SOLO Master UIX Guide v3.0 — Precision Currency Utility
 * Dynamically handles multi-tenant currency formatting via CurrencyService.
 */
export const formatCurrency = (amount: number, currency: string = 'NGN', locale: string = 'en-NG'): string => {
    return CurrencyService.format(amount, currency, locale);
};

/** @deprecated Use formatCurrency(amount, 'NGN') */
export const formatNaira = (amount: number): string => {
    return formatCurrency(amount, 'NGN');
};
