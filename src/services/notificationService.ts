export interface Notification {
    id: string;
    type: 'order' | 'inventory' | 'customer' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    link?: string;
}

export class NotificationService {
    private static notifications: Notification[] = [
        {
            id: '1',
            type: 'order',
            title: 'New Order Received',
            message: 'Fatima Ibrahim placed a new order for ₦199.99',
            timestamp: new Date(),
            read: false,
            link: '/dashboard/orders/ord-003'
        },
        {
            id: '2',
            type: 'inventory',
            title: 'Critical Stock Alert',
            message: 'Premium Wireless Headphones are out of stock!',
            timestamp: new Date(Date.now() - 3600000),
            read: false,
            link: '/dashboard/products'
        }
    ];

    static async getNotifications(): Promise<Notification[]> {
        // In a real app, this would fetch from Supabase
        return [...this.notifications];
    }

    static async markAsRead(id: string): Promise<void> {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            this.notifications[index].read = true;
        }
    }

    static async markAllAsRead(): Promise<void> {
        this.notifications.forEach(n => n.read = true);
    }

    static getUnreadCount(): number {
        return this.notifications.filter(n => !n.read).length;
    }

    // Real-time simulation
    static subscribeToNotifications(callback: (n: Notification) => void) {
        // Mocking a new notification after 30 seconds
        const timer = setTimeout(() => {
            const newNotif: Notification = {
                id: Date.now().toString(),
                type: 'customer',
                title: 'New Inquiry',
                message: 'A customer is asking about "Minimalist Desk Lamp" via Sales Assistant.',
                timestamp: new Date(),
                read: false,
                link: '/dashboard/hub'
            };
            this.notifications.unshift(newNotif);
            callback(newNotif);
        }, 30000);

        return () => clearTimeout(timer);
    }
}
