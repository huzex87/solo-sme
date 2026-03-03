'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/context/TenantContext';
import styles from './NotificationPulse.module.css';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'order' | 'message';
    timestamp: string;
}

export default function NotificationPulse() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { tenantId } = useTenant();

    const addNotification = (n: Notification) => {
        setNotifications(prev => [n, ...prev].slice(0, 3));

        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter((item: Notification) => item.id !== n.id));
        }, 5000);
    };

    useEffect(() => {
        if (!tenantId) return;

        // Listen for new orders
        const ordersSub = supabase
            .channel('public:orders')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'orders',
                filter: `tenant_id=eq.${tenantId}`
            }, (payload) => {
                addNotification({
                    id: Math.random().toString(),
                    title: 'New Order Received',
                    message: `A new order has been placed for ₦${payload.new.total_amount.toLocaleString()}`,
                    type: 'order',
                    timestamp: 'Just now'
                });
            })
            .subscribe();

        // Listen for new chat messages
        const chatSub = supabase
            .channel('public:chat_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `tenant_id=eq.${tenantId}`
            }, (payload) => {
                // Don't notify if user is the sender (business side)
                if (payload.new.sender_id !== tenantId) {
                    addNotification({
                        id: Math.random().toString(),
                        title: 'New Message',
                        message: payload.new.message_text.substring(0, 50) + (payload.new.message_text.length > 50 ? '...' : ''),
                        type: 'message',
                        timestamp: 'Just now'
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ordersSub);
            supabase.removeChannel(chatSub);
        };
    }, [tenantId]);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter((item: Notification) => item.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className={styles.container}>
            {notifications.map(n => (
                <div key={n.id} className={styles.toast} onClick={() => removeNotification(n.id)}>
                    <div className={styles.icon}>
                        {n.type === 'order' ? <ShoppingBag size={20} /> : <MessageSquare size={20} />}
                    </div>
                    <div className={styles.content}>
                        <span className={styles.title}>{n.title}</span>
                        <p className={styles.message}>{n.message}</p>
                        <span className={styles.time}>{n.timestamp}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
