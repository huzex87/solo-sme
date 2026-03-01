'use client';

import { useCart } from '@/context/CartContext';
import { getTranslation, Locale } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import LoyaltyBadge from './LoyaltyBadge';
import styles from '@/app/store/[subdomain]/store.module.css';

interface StoreHeaderProps {
    subdomain: string;
    tenantName: string;
    logoUrl?: string;
}

export default function StoreHeader({ subdomain, tenantName, logoUrl }: StoreHeaderProps) {
    const { locale } = useCart();
    const t = getTranslation(locale as Locale);

    return (
        <header className={styles.storeHeader}>
            <div className={styles.storeNav}>
                <a href={`/store/${subdomain}`} className={styles.storeBrand}>
                    {logoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={logoUrl} alt={tenantName} className={styles.logo} />
                    ) : (
                        tenantName
                    )}
                </a>
                <nav className={styles.storeLinks}>
                    <LanguageSwitcher />
                    <LoyaltyBadge />
                    <a href={`/store/${subdomain}`}>Shop</a>
                    <a href={`/store/${subdomain}/locations`}>Locations</a>
                    <a href={`/store/${subdomain}/blog`}>Journal</a>
                    <a href={`/store/${subdomain}/cart`} className={styles.cartLink}>
                        🛒 {t.cart}
                    </a>
                </nav>
            </div>
        </header>
    );
}
