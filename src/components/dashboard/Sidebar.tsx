'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
    {
        section: 'Main',
        items: [
            { label: 'Overview', href: '/dashboard', icon: '📊' },
            { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
            { label: 'Products', href: '/dashboard/products', icon: '📦' },
            { label: 'Orders', href: '/dashboard/orders', icon: '🧾' },
            { label: 'Customers', href: '/dashboard/customers', icon: '👥' },
            { label: 'Staff', href: '/dashboard/staff', icon: '👔' },
            { label: 'Magic Import', href: '/dashboard/onboarding/instagram', icon: '✨' },
            { label: 'Content Lab', icon: '✍️', href: '/dashboard/content' },
            { label: 'Payouts', href: '/dashboard/payouts', icon: '💰' },
        ],
    },
    {
        section: 'Admin',
        items: [
            { label: 'Super Admin', href: '/admin', icon: '👑' },
        ],
    },
    {
        section: 'Settings',
        items: [
            { label: 'Store Settings', href: '/dashboard/settings', icon: '⚙️' },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <span className={`gradient-text ${styles.brandLogo}`}>SOLO</span>
            </div>

            <nav className={styles.nav}>
                {NAV_ITEMS.map((section) => (
                    <div key={section.section}>
                        <div className={styles.navSection}>{section.section}</div>
                        {section.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            <Link href="/store/demo-boutique" className={styles.storeLink} target="_blank">
                🌐 View My Store
            </Link>
        </aside>
    );
}
