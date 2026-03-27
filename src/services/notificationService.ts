import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './baseService';

export interface Notification {
    id: string;
    type: 'order' | 'inventory' | 'customer' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    link?: string;
}

export class NotificationService extends BaseService {
    static async getNotifications(tenantId: string, client?: SupabaseClient): Promise<Notification[]> {
        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            this.error('getNotifications', error, { tenantId });
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

    static async getUnreadCount(tenantId: string, client?: SupabaseClient): Promise<number> {
        const supabase = await this.getClient(client);
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('read', false);

        if (error) {
            this.error('getUnreadCount', error, { tenantId });
            return 0;
        }

        return count || 0;
    }

    static async markAsRead(id: string, client?: SupabaseClient): Promise<void> {
        const supabase = await this.getClient(client);
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
        
        if (error) {
            this.error('markAsRead', error, { id });
        }
    }

    static async markAllAsRead(tenantId: string, client?: SupabaseClient): Promise<void> {
        const supabase = await this.getClient(client);
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('tenant_id', tenantId)
            .eq('read', false);
        
        if (error) {
            this.error('markAllAsRead', error, { tenantId });
        }
    }

    static async subscribeToNotifications(tenantId: string, callback: (n: Notification) => void, client?: SupabaseClient) {
        const supabase = await this.getClient(client);
        const channel = supabase
            .channel(`public:notifications:${tenantId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `tenant_id=eq.${tenantId}`
                },
                payload => {
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
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
}
