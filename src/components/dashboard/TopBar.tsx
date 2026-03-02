'use client';

import { Search, Bell, Menu, ArrowUpRight } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { useTenant } from '@/context/TenantContext';
import styles from './TopBar.module.css';

export default function TopBar() {
    const { userName, subdomain } = useTenant();
    const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className={styles.topbar}>
            <div className={styles.left}>
                <button className={`${styles.menuToggle}`} type="button">
                    <Menu size={20} />
                </button>
                <div className={styles.statusBadge}>
                    <span className={styles.liveIndicator}></span>
                    <span className={styles.statusText}>LIVE</span>
                </div>
                <div className={styles.search}>
                    <Search className={styles.searchIcon} size={16} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Quick search... (⌘K)"
                    />
                </div>
            </div>

            <div className={styles.right}>
                <a
                    href={`/store/${subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewStoreBtn}
                >
                    <span>View Store</span>
                    <ArrowUpRight size={14} className={styles.btnIcon} />
                </a>

                <div className={styles.actionIcons}>
                    <button className={styles.iconBtn}>
                        <Bell size={18} />
                        <span className={styles.notifBadge}></span>
                    </button>
                </div>

                <div className={styles.userProfile}>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{userName}</span>
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
