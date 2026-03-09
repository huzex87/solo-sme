'use client';

import { Search, Bell, Menu, ArrowUpRight, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import NotificationCenter from './NotificationCenter';
import { useTenant } from '@/context/TenantContext';
import { useTheme } from '@/context/ThemeContext';
import styles from './TopBar.module.css';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
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
          aria-label="Toggle menu"
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        <div className={styles.liveChip}>
          <span className={styles.liveDot} />
          <span className={styles.liveText}>Live</span>
        </div>

        <div className={styles.search}>
          <Search className={styles.searchIcon} size={15} strokeWidth={2} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search orders, products… (⌘K)"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            readOnly
          />
        </div>
      </div>

      <div className={styles.right}>
        <Link
          href={`/store/${subdomain || tenantId || 'demo'}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewStoreBtn}
        >
          <span>View Store</span>
          <ArrowUpRight size={13} strokeWidth={2.5} />
        </Link>

        <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
        </button>

        <button className={styles.iconBtn} title="Notifications">
          <Bell size={17} strokeWidth={2} />
          <span className={styles.notifBadge} />
        </button>

        <div className={styles.divider} />

        <div className={styles.userProfile}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName || 'Store Owner'}</span>
            <span className={styles.userRole}>Owner</span>
          </div>
          <div className={styles.avatar}>{initials}</div>
        </div>
      </div>
    </header>
  );
}
