'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BarChart3,
    Package,
    ClipboardList,
    Users,
    ShieldCheck,
    Sparkles,
    PenTool,
    Wallet,
    ShieldAlert,
    Settings,
    ExternalLink,
    Store
} from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
    {
        section: 'Main',
        items: [
            { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
            { label: 'Products', href: '/dashboard/products', icon: Package },
            { label: 'Orders', href: '/dashboard/orders', icon: ClipboardList },
            { label: 'Customers', href: '/dashboard/customers', icon: Users },
            { label: 'Staff', href: '/dashboard/staff', icon: ShieldCheck },
            { label: 'Magic Import', href: '/dashboard/onboarding/instagram', icon: Sparkles },
            { label: 'Content Lab', icon: PenTool, href: '/dashboard/content' },
            { label: 'Payouts', href: '/dashboard/payouts', icon: Wallet },
        ],
    },
    {
        section: 'Admin',
        items: [
            { label: 'Super Admin', href: '/admin', icon: ShieldAlert },
        ],
    },
    {
        section: 'Settings',
        items: [
            { label: 'Store Settings', href: '/dashboard/settings', icon: Settings },
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
                <div className={styles.logoContainer}>
                    <span className={`gradient-text ${styles.brandLogo}`}>SOLO</span>
                </div>
                <div className={styles.versionTag}>PRO</div>
            </div>

            <nav className={styles.nav}>
                {NAV_ITEMS.map((section) => (
                    <div key={section.section} className={styles.navSectionGroup}>
                        <div className={styles.navSection}>{section.section}</div>
                        {section.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`}
                            >
                                <item.icon className={styles.navIcon} size={18} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                                <span className={styles.navLabel}>{item.label}</span>
                                {isActive(item.href) && <div className={styles.activeIndicator} />}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            <div className={styles.footer}>
                <div className={styles.businessCard}>
                    <div className={styles.businessAvatar}>A</div>
                    <div className={styles.businessInfo}>
                        <div className={styles.businessName}>Artisan Soul</div>
                        <div className={styles.businessPlan}>Growth Plan</div>
                    </div>
                </div>

                <Link href="/store/demo-boutique" className={styles.storeLink} target="_blank">
                    <Store size={16} />
                    <span>View My Store</span>
                    <ExternalLink size={12} className={styles.externalIcon} />
                </Link>
            </div>
        </aside>
    );
}
