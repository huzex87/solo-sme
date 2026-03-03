import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
    static async getNotifications(): Promise<Notification[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }

        return (data || []).map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            timestamp: new Date(n.created_at),
            read: n.read,
            link: n.link
        }));
    }

    static async getUnreadCount(): Promise<number> {
        if (!isSupabaseConfigured) return 0;

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('read', false);

        if (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }

        return count || 0;
    }

    static async markAsRead(id: string): Promise<void> {
        if (!isSupabaseConfigured) return;

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
    }

    static async markAllAsRead(): Promise<void> {
        if (!isSupabaseConfigured) return;

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('read', false);
    }

    static async subscribeToNotifications(callback: (n: Notification) => void) {
        if (!isSupabaseConfigured) return () => { };

        const channel = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
                const n = payload.new;
                callback({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    timestamp: new Date(n.created_at),
                    read: n.read,
                    link: n.link
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
}
