'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, ShieldCheck, Ticket, ArrowLeftRight, LogOut } from 'lucide-react';
import styles from './admin.module.css';

const ADMIN_NAV = [
    { label: 'Command Center', href: '/admin', icon: LayoutDashboard },
    { label: 'Tenant Directory', href: '/admin/tenants', icon: Users },
    { label: 'Financial Hub', href: '/admin/subscriptions', icon: CreditCard },
    { label: 'System Health', href: '/admin/health', icon: ShieldCheck },
    { label: 'Support Queue', href: '/admin/support', icon: Ticket },
];

interface Props {
    onLogout?: () => void;
}

export default function AdminSidebar({ onLogout }: Props) {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            {/* ── Brand ── */}
            <div className={styles.brand}>
                <span className={styles.adminBadge}>⚡ Super Admin</span>
                <h2 className={styles.brandLogo}>
                    SOLO <span style={{ color: 'var(--accent)' }}>OS</span>
                </h2>
            </div>

            {/* ── Navigation ── */}
            <nav className={styles.nav}>
                {ADMIN_NAV.map((item) => {
                    const active = item.href === '/admin'
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                        >
                            <item.icon className={styles.navIcon} size={17} strokeWidth={active ? 2.2 : 1.8} />
                            <span style={{ flex: 1 }}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* ── Footer ── */}
            <div className={styles.sidebarFooter}>
                <Link
                    href="/dashboard"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 12px', borderRadius: 10,
                        color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600,
                        textDecoration: 'none', transition: 'all 0.15s ease',
                        border: '1px solid rgba(255,255,255,0.06)',
                        marginBottom: 8,
                    }}
                >
                    <ArrowLeftRight size={13} />
                    <span>Merchant Dashboard</span>
                </Link>

                {onLogout && (
                    <button
                        onClick={onLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                            padding: '10px 12px', borderRadius: 10, border: 'none',
                            background: 'rgba(192,57,43,0.08)', color: '#f87171',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s ease', fontFamily: 'var(--font-sans)',
                        }}
                    >
                        <LogOut size={13} />
                        <span>Sign Out</span>
                    </button>
                )}
            </div>
        </aside>
    );
}
