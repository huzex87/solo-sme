'use client';

import { useCart } from '@/context/CartContext';
import { Globe } from 'lucide-react';
import styles from '@/app/store/[subdomain]/store.module.css';

const CURRENCIES = [
    { code: 'NGN', label: '🇳🇬 NGN', locale: 'en-NG' },
    { code: 'USD', label: '🇺🇸 USD', locale: 'en-US' },
    { code: 'GHS', label: '🇬🇭 GHS', locale: 'en-GH' },
    { code: 'KES', label: '🇰🇪 KES', locale: 'en-KE' },
    { code: 'ZAR', label: '🇿🇦 ZAR', locale: 'en-ZA' }
];

export default function CurrencySwitcher() {
    const { currency, setCurrency } = useCart();

    return (
        <div className={styles.currencySwitcher}>
            <Globe size={14} className="opacity-50" />
            <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={styles.currencySelect}
            >
                {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                        {curr.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
