import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { InventoryService } from './inventoryService';

export interface Order {
    id: string;
    tenant_id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    items: { id?: string; name?: string; price?: number; quantity?: number;[key: string]: unknown }[];
    channel?: 'online' | 'pos' | 'marketplace';
    created_at: string;
}

// Production data only

export class OrderService {
    static async getOrders(tenantId: string): Promise<Order[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        return data || [];
    }

    static async getOrder(id: string): Promise<Order | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching order:', error);
            return null;
        }

        return data;
    }

    static async createOrder(order: Partial<Order>): Promise<Order | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('orders')
            .insert(order)
            .select()
            .single();

        if (error) {
            console.error('Error creating order:', error);
            return null;
        }

        // Record inventory movements
        if (data && data.items) {
            for (const item of (data.items as any[])) {
                if (item.id) {
                    await InventoryService.recordMovement(data.tenant_id, {
                        product_id: item.id,
                        delta: -(item.quantity || 1),
                        type: 'sale',
                        channel: data.channel || 'online',
                        reference_id: data.id,
                        notes: `${data.channel === 'pos' ? 'POS' : 'Online'} order #${data.id.slice(0, 8)}`
                    });
                }
            }
        }

        return data;
    }

    static async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.error('Error updating order status:', error);
            return false;
        }

        return true;
    }
}
