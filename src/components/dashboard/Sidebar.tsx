'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    BarChart3,
    Package,
    ClipboardList,
    Users,
    ShieldCheck,
    Sparkles,
    PenTool,
    Settings,
    ExternalLink,
    Store,
    MonitorIcon,
    Globe,
    CreditCard,
    Target
} from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
    {
        section: 'Business',
        items: [
            { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Inbox', href: '/dashboard/hub', icon: Sparkles },
            { label: 'Shop Sales', href: '/dashboard/pos', icon: MonitorIcon },
            { label: 'My Orders', href: '/dashboard/orders', icon: ClipboardList },
            { label: 'Products', href: '/dashboard/products', icon: Package },
            { label: 'My Customers', href: '/dashboard/customers', icon: Users },
        ],
    },
    {
        section: 'Growth',
        items: [
            { label: 'Performance', href: '/dashboard/analytics', icon: BarChart3 },
            { label: 'Promotions', href: '/dashboard/marketing', icon: Target },
            { label: 'Marketplace', href: '/dashboard/marketplace', icon: Globe },
            { label: 'Store Content', href: '/dashboard/content', icon: PenTool },
        ],
    },
    {
        section: 'Operations',
        items: [
            { label: 'Money & Payments', href: '/dashboard/payouts', icon: CreditCard },
            { label: 'My Team', href: '/dashboard/staff', icon: ShieldCheck },
        ],
    },
    {
        section: 'System',
        items: [
            { label: 'Settings', href: '/dashboard/settings', icon: Settings },
        ],
    },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { tenantId, tenantName, subdomain } = useTenant();
    const initial = tenantName?.charAt(0)?.toUpperCase() || 'S';

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
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
                                onClick={onClose}
                            >
                                <item.icon className={styles.navIcon} size={18} strokeWidth={2} />
                                <span className={styles.navLabel}>{item.label}</span>
                                {isActive(item.href) && <div className={styles.activeIndicator} />}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            <div className={styles.footer}>
                <div className={styles.businessCard}>
                    <div className={styles.businessAvatar}>{initial}</div>
                    <div className={styles.businessInfo}>
                        <div className={styles.businessName}>{tenantName}</div>
                        <div className={styles.businessPlan}>Growth Plan</div>
                    </div>
                </div>

                <Link
                    href={`/store/${subdomain || tenantId}`}
                    className={styles.storeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Store size={16} />
                    <span>View My Store</span>
                    <ExternalLink size={12} className={styles.externalIcon} />
                </Link>
            </div>
        </aside>
    );
}
