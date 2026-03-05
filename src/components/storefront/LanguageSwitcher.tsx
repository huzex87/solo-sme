'use client';

import { useCart } from '@/context/CartContext';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ha', label: 'Hausa' },
    { code: 'yo', label: 'Yoruba' },
    { code: 'ig', label: 'Igbo' },
];

export default function LanguageSwitcher() {
    const { locale, setLocale } = useCart();

    return (
        <div className={styles.container}>
            <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className={styles.select}
            >
                {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
