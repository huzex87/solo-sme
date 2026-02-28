'use client';

import { useCart } from '@/context/CartContext';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
    { code: 'yo', label: 'Yoruba', flag: '🇳🇬' },
    { code: 'ig', label: 'Igbo', flag: '🇳🇬' },
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
                        {lang.flag} {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
