'use client';

import NotificationCenter from './NotificationCenter';
import styles from './TopBar.module.css';

interface TopBarProps {
    userName?: string;
}

export default function TopBar({ userName = 'Demo Owner' }: TopBarProps) {
    const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className={styles.topbar}>
            <div className={styles.left}>
                <button className={`${styles.menuToggle} btn-ghost`} type="button">
                    ☰
                </button>
                <div className={styles.search}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search products, orders, customers..."
                    />
                </div>
            </div>

            <div className={styles.right}>
                <NotificationCenter />
                <div className={styles.avatar} title={userName}>
                    {initials}
                </div>
            </div>
        </header>
    );
}
