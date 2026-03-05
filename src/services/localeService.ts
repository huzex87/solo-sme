import { Tenant } from '@/types';
import { CurrencyService } from './currencyService';

export class LocaleService {
    /**
     * Formats a number as currency based on tenant configuration.
     * Supports multi-regional African currencies (NGN, GHS, KES, ZAR).
     */
    static formatCurrency(amount: number, tenant: { currency?: string; locale?: string }): string {
        try {
            const currency = tenant.currency || 'NGN';
            const locale = tenant.locale || 'en-NG';

            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                currencyDisplay: 'symbol'
            }).format(amount);
        } catch (error) {
            console.error('[LocaleService] Formatting error:', error);
            const symbol = CurrencyService.getSymbol(tenant.currency || 'NGN');
            return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        }
    }

    /**
     * Formats a date based on tenant locale and timezone.
     */
    static formatDate(date: string | Date, tenant: { locale?: string; timezone?: string }): string {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(tenant.locale || 'en-NG', {
            dateStyle: 'medium',
            timeZone: tenant.timezone || 'Africa/Lagos'
        }).format(d);
    }

    /**
     * Returns the current time in the tenant's timezone.
     */
    static getTenantTime(timezone: string = 'Africa/Lagos'): Date {
        const now = new Date();
        const tenantTimeStr = now.toLocaleString('en-US', { timeZone: timezone });
        return new Date(tenantTimeStr);
    }

    /**
     * Helper to get relative time in merchant locale.
     */
    static getRelativeTime(date: string | Date, tenant: { locale?: string }): string {
        const d = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

        const rtf = new Intl.RelativeTimeFormat(tenant.locale || 'en-NG', { numeric: 'auto' });

        if (diffInSeconds < 60 && diffInSeconds >= 0) return rtf.format(-diffInSeconds, 'second');
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return rtf.format(-diffInMinutes, 'minute');
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return rtf.format(-diffInHours, 'hour');
        const diffInDays = Math.floor(diffInHours / 24);
        return rtf.format(-diffInDays, 'day');
    }
}
