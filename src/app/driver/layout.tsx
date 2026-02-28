'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './driver.module.css';

const DRIVER_NAV = [
    { label: 'Orders', href: '/driver', icon: '📦' },
    { label: 'Wallet', href: '/driver/wallet', icon: '💰' },
    { label: 'Profile', href: '/driver/profile', icon: '👤' },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.brand}>SOLO <span className={styles.badge}>DRIVE</span></div>
                <div className={styles.dutyToggle}>
                    <span className={styles.statusDot}></span>
                    ONLINE
                </div>
            </header>

            <main className={styles.content}>
                {children}
            </main>

            <nav className={styles.bottomNav}>
                {DRIVER_NAV.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${pathname === item.href ? styles.navActive : ''}`}
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
