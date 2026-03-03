'use client';

import { useEffect, useState, useRef } from 'react';
import { Notification, NotificationService } from '@/services/notificationService';
import styles from './NotificationCenter.module.css';
import Link from 'next/link';

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const setup = async () => {
            const data = await NotificationService.getNotifications();
            setNotifications(data);
            const count = await NotificationService.getUnreadCount();
            setUnreadCount(count);

            unsubscribe = await NotificationService.subscribeToNotifications((newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        };

        setup();

        // Close on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            if (unsubscribe) unsubscribe();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const markAsRead = async (id: string) => {
        await NotificationService.markAsRead(id);
        const data = await NotificationService.getNotifications();
        setNotifications(data);
        const count = await NotificationService.getUnreadCount();
        setUnreadCount(count);
    };

    const markAllAsRead = async () => {
        await NotificationService.markAllAsRead();
        const data = await NotificationService.getNotifications();
        setNotifications(data);
        const count = await NotificationService.getUnreadCount();
        setUnreadCount(count);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return '🛍️';
            case 'inventory': return '⚠️';
            case 'customer': return '💬';
            case 'system': return '⚙️';
            default: return '🔔';
        }
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.notifBtn}
                onClick={toggleDropdown}
                type="button"
                aria-label="Notifications"
            >
                🔔
                {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className={styles.markAll} onClick={markAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>No notifications yet</div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`${styles.item} ${notif.read ? styles.read : styles.unread}`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className={styles.itemIcon}>{getIcon(notif.type)}</div>
                                    <div className={styles.itemContent}>
                                        <p className={styles.itemTitle}>{notif.title}</p>
                                        <p className={styles.itemMessage}>{notif.message}</p>
                                        <span className={styles.itemTime}>
                                            {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {notif.link && (
                                        <Link href={notif.link} className={styles.itemLink} onClick={() => setIsOpen(false)}>
                                            →
                                        </Link>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
