'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';

const ADMIN_NAV = [
    { label: 'Platform Overview', href: '/admin', icon: '🏛️' },
    { label: 'Tenant Directory', href: '/admin/tenants', icon: '🏬' },
    { label: 'Revenue & Subs', href: '/admin/subscriptions', icon: '📈' },
    { label: 'System Health', href: '/admin/health', icon: '🛡️' },
    { label: 'Support Tickets', href: '/admin/support', icon: '🎫' },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <span className={styles.adminBadge}>Super Admin</span>
                <h2 className={styles.brandLogo}>SOLO <span style={{ color: 'var(--accent-primary)' }}>OS</span></h2>
            </div>

            <nav className={styles.nav}>
                {ADMIN_NAV.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className={styles.sidebarFooter}>
                <Link href="/dashboard" className="btn btn-ghost btn-sm btn-block">
                    Switch to Merchant
                </Link>
            </div>
        </aside>
    );
}
