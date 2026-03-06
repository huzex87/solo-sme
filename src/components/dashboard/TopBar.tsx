'use client';

import { Search, Bell, Menu, ArrowUpRight, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationCenter from './NotificationCenter';
import { useTenant } from '@/context/TenantContext';
import { useTheme } from '@/context/ThemeContext';
import styles from './TopBar.module.css';

interface TopBarProps {
    onToggleSidebar?: () => void;
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
    const router = useRouter();
    const { userName, tenantId, subdomain } = useTenant();
    const { theme, toggleTheme } = useTheme();
    const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'SO';

    return (
        <header className={styles.topbar}>
            <div className={styles.left}>
                <button
                    className={styles.menuToggle}
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={20} strokeWidth={2.5} />
                </button>
                <div className={styles.statusBadge}>
                    <span className={styles.liveIndicator}></span>
                    <span className={styles.statusText}>LIVE</span>
                </div>
                <div className={styles.search}>
                    <Search className={styles.searchIcon} size={16} strokeWidth={2.5} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search... (⌘K)"
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                        readOnly
                    />
                </div>
            </div>

            <div className={styles.right}>
                <Link
                    href={`/store/${subdomain || tenantId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewStoreBtn}
                >
                    <span>View Store</span>
                    <ArrowUpRight size={14} className={styles.btnIcon} strokeWidth={2.5} />
                </Link>

                <div className={styles.actionIcons}>
                    <button
                        className={styles.iconBtn}
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
                    </button>
                    <button className={styles.iconBtn}>
                        <Bell size={18} strokeWidth={2.5} />
                        <span className={styles.notifBadge}></span>
                    </button>
                </div>

                <div className={styles.userProfile}>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{userName || 'My Account'}</span>
                        <span className={styles.userRole}>Store Owner</span>
                    </div>
                    <div className={styles.avatar} title={userName}>
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}
