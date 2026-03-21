'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { getTranslation, Locale } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySwitcher from './CurrencySwitcher';
import LoyaltyBadge from './LoyaltyBadge';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import styles from '@/app/store/[subdomain]/store.module.css';

interface StoreHeaderProps {
    subdomain: string;
    tenantName: string;
    logoUrl?: string;
}

export default function StoreHeader({ subdomain, tenantName, logoUrl }: StoreHeaderProps) {
    const { locale, totalItems } = useCart();
    const t = getTranslation(locale as Locale);
    const [menuOpen, setMenuOpen] = useState(false);

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

                {/* Desktop nav */}
                <nav className={`${styles.storeLinks} ${styles.desktopLinks}`}>
                    <CurrencySwitcher />
                    <LanguageSwitcher />
                    <LoyaltyBadge />
                    <Link href={`/store/${subdomain}`}>Shop</Link>
                    <Link href={`/store/${subdomain}/about`}>About</Link>
                    <Link href={`/store/${subdomain}/blog`}>Blog</Link>
                    <Link href={`/store/${subdomain}/cart`} className={styles.cartLink}>
                        <ShoppingCart size={16} className="inline mr-2" />
                        {t.cart}{totalItems > 0 && ` (${totalItems})`}
                    </Link>
                </nav>

                {/* Mobile actions */}
                <div className={styles.mobileActions}>
                    <Link href={`/store/${subdomain}/cart`} className={styles.cartLink}>
                        <ShoppingCart size={16} />
                        {totalItems > 0 && (
                            <span style={{
                                marginLeft: 6,
                                fontSize: 12,
                                fontWeight: 800,
                            }}>
                                {totalItems}
                            </span>
                        )}
                    </Link>
                    <button
                        className={styles.menuToggle}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <nav className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
                <Link href={`/store/${subdomain}`} onClick={() => setMenuOpen(false)}>Shop</Link>
                <Link href={`/store/${subdomain}/about`} onClick={() => setMenuOpen(false)}>About</Link>
                <Link href={`/store/${subdomain}/blog`} onClick={() => setMenuOpen(false)}>Blog</Link>
                <div style={{ padding: '8px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <CurrencySwitcher />
                    <LanguageSwitcher />
                </div>
            </nav>
        </header>
    );
}
