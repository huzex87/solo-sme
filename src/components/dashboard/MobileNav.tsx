'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Sparkles,
    MonitorIcon,
    BarChart3,
    User,
    Search
} from 'lucide-react';
import styles from './MobileNav.module.css';

export default function MobileNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const navItems = [
        { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Inbox', href: '/dashboard/hub', icon: Sparkles },
        { label: 'Sell', href: '/dashboard/pos', icon: MonitorIcon },
        { label: 'Trends', href: '/dashboard/analytics', icon: BarChart3 },
        { label: 'Menu', href: '/dashboard/settings', icon: User },
    ];

    return (
        <nav className={styles.mobileNav}>
            <div className={styles.navContainer}>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                    >
                        <div className={styles.iconWrapper}>
                            <item.icon size={20} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                        </div>
                        <span className={styles.label}>{item.label}</span>
                        {isActive(item.href) && <div className={styles.puck} />}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
