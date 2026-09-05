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
                        <Image src={logoUrl} alt={tenantName} width={36} height={36} className={styles.logo} />
                    ) : (
                        <span className={styles.brandBadge} aria-hidden="true">
                            {(tenantName || 'S').charAt(0).toUpperCase()}
                        </span>
                    )}
                    <span>{tenantName}</span>
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
                    <Link
                        href={`/store/${subdomain}/cart`}
                        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white active:scale-90 transition-transform"
                    >
                        <ShoppingCart size={18} />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 active:scale-90 transition-transform"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu — full-screen overlay */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}
            <nav
                className={`
                    fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl
                    transform transition-transform duration-300 ease-out
                    ${menuOpen ? 'translate-x-0' : 'translate-x-full'}
                    lg:hidden flex flex-col
                `}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <span className="font-bold text-slate-900">{tenantName}</span>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-90 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="flex flex-col py-2">
                    <Link
                        href={`/store/${subdomain}`}
                        onClick={() => setMenuOpen(false)}
                        className="px-6 py-4 text-[15px] font-semibold text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                        Shop
                    </Link>
                    <Link
                        href={`/store/${subdomain}/about`}
                        onClick={() => setMenuOpen(false)}
                        className="px-6 py-4 text-[15px] font-semibold text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                        About
                    </Link>
                    <Link
                        href={`/store/${subdomain}/blog`}
                        onClick={() => setMenuOpen(false)}
                        className="px-6 py-4 text-[15px] font-semibold text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                        Blog
                    </Link>
                </div>
                <div className="mt-auto p-4 border-t border-slate-100 flex gap-3 items-center">
                    <CurrencySwitcher />
                    <LanguageSwitcher />
                </div>
            </nav>
        </header>
    );
}
