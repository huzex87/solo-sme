'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, Package, ClipboardList, Users,
  ShieldCheck, Sparkles, PenTool, Settings, ExternalLink,
  Store, MonitorIcon, Globe, CreditCard, Target, Gift,
  MessageCircle
} from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  {
    section: 'Business',
    items: [
      { label: 'Overview',     href: '/dashboard',              icon: LayoutDashboard },
      { label: 'Inbox',        href: '/dashboard/hub',          icon: Sparkles },
      { label: 'POS',          href: '/dashboard/pos',          icon: MonitorIcon },
      { label: 'Orders',       href: '/dashboard/orders',       icon: ClipboardList },
      { label: 'Products',     href: '/dashboard/products',     icon: Package },
      { label: 'Customers',    href: '/dashboard/customers',    icon: Users },
      { label: 'Loyalty',      href: '/dashboard/customers/loyalty', icon: Gift },
    ],
  },
  {
    section: 'Growth',
    items: [
      { label: 'Analytics',    href: '/dashboard/analytics',   icon: BarChart3 },
      { label: 'Marketing',    href: '/dashboard/marketing',   icon: Target },
      { label: 'Marketplace',  href: '/dashboard/marketplace', icon: Globe },
      { label: 'Content Lab',  href: '/dashboard/content',     icon: PenTool },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Payments',     href: '/dashboard/payouts',     icon: CreditCard },
      { label: 'My Team',      href: '/dashboard/staff',       icon: ShieldCheck },
      { label: 'WhatsApp AI',  href: '/dashboard/settings',    icon: MessageCircle },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'Settings',     href: '/dashboard/settings',    icon: Settings },
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
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarLogo}>
          SOLO<span>.</span>
        </div>
        <div className={styles.logoTag}>Business Platform</div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((group) => (
          <div key={group.section} className={styles.navGroup}>
            <div className={styles.navLabel}>{group.section}</div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                onClick={onClose}
              >
                <item.icon className={styles.navIcon} size={16} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.merchantCard}>
          <div className={styles.merchantAvatar}>{initial}</div>
          <div className={styles.merchantInfo}>
            <div className={styles.merchantName}>{tenantName || 'My Store'}</div>
            <div className={styles.merchantPlan}>Growth Plan</div>
          </div>
        </div>
        <Link
          href={`/store/${subdomain || tenantId || 'demo'}`}
          className={styles.viewStoreLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Store size={12} />
          View My Store
          <ExternalLink size={10} style={{ marginLeft: 'auto', opacity: .5 }} />
        </Link>
      </div>
    </aside>
  );
}
