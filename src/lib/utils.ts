import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { formatCurrency as formatCcy } from './formatCurrency';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'NGN', locale: string = 'en-NG') {
    return formatCcy(amount, currency, locale);
}
