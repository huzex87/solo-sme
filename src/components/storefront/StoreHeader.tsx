'use client';

import { useCart } from '@/context/CartContext';
import { getTranslation, Locale } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySwitcher from './CurrencySwitcher';
import LoyaltyBadge from './LoyaltyBadge';
import Image from 'next/image';
import styles from '@/app/store/[subdomain]/store.module.css';

interface StoreHeaderProps {
    subdomain: string;
    tenantName: string;
    logoUrl?: string;
}

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function StoreHeader({ subdomain, tenantName, logoUrl }: StoreHeaderProps) {
    const { locale } = useCart();
    const t = getTranslation(locale as Locale);

    return (
        <header className={styles.storeHeader}>
            <div className={styles.storeNav}>
                <Link href={`/store/${subdomain}`} className={styles.storeBrand}>
                    {logoUrl ? (
                        <Image src={logoUrl} alt={tenantName} width={40} height={40} className={styles.logo} />
                    ) : (
                        tenantName
                    )}
                </Link>
                <nav className={styles.storeLinks}>
                    <CurrencySwitcher />
                    <LanguageSwitcher />
                    <LoyaltyBadge />
                    <Link href={`/store/${subdomain}`}>Shop</Link>
                    <Link href={`/store/${subdomain}/locations`}>Locations</Link>
                    <Link href={`/store/${subdomain}/blog`}>Journal</Link>
                    <Link href={`/store/${subdomain}/cart`} className={styles.cartLink}>
                        <ShoppingCart size={16} className="inline mr-2" /> {t.cart}
                    </Link>
                </nav>
            </div>
        </header>
    );
}
