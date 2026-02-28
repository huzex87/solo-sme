import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Order {
    id: string;
    tenant_id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    items: any[];
    created_at: string;
}

const DEMO_ORDERS: Order[] = [
    {
        id: 'ord_1',
        tenant_id: 't1',
        customer_name: 'Adaeze Okonkwo',
        customer_email: 'adaeze@example.com',
        total_amount: 35000,
        status: 'paid',
        items: [
            { id: 'p1', name: 'Midnight Silk Scarf', price: 15500, quantity: 1 },
            { id: 'p3', name: 'Gilded Moon Earrings', price: 22000, quantity: 1 }
        ],
        created_at: '2026-02-27 10:30'
    },
    {
        id: 'ord_2',
        tenant_id: 't1',
        customer_name: 'Chidi Nnamdi',
        customer_email: 'chidi@example.com',
        total_amount: 17000,
        status: 'pending',
        items: [
            { id: 'p2', name: 'Ceramic Horizon Mug', price: 8500, quantity: 2 }
        ],
        created_at: '2026-02-28 09:15'
    }
];

export class OrderService {
    static async getOrders(tenantId: string): Promise<Order[]> {
        if (!isSupabaseConfigured) {
            return DEMO_ORDERS;
        }

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return DEMO_ORDERS;
        }

        return data || [];
    }

    static async getOrder(id: string): Promise<Order | null> {
        if (!isSupabaseConfigured) {
            return DEMO_ORDERS.find(o => o.id === id) || DEMO_ORDERS[0];
        }

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
        if (!isSupabaseConfigured) {
            console.log('[OrderService] Demo mode: Order created locally (simulated)');
            return {
                id: `ord_${Math.random().toString(36).substr(2, 5)}`,
                tenant_id: order.tenant_id || 't1',
                customer_name: order.customer_name || 'Anonymous',
                customer_email: order.customer_email || '',
                total_amount: order.total_amount || 0,
                status: 'pending',
                items: order.items || [],
                created_at: new Date().toISOString()
            };
        }

        const { data, error } = await supabase
            .from('orders')
            .insert(order)
            .select()
            .single();

        if (error) {
            console.error('Error creating order:', error);
            return null;
        }

        return data;
    }

    static async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
        if (!isSupabaseConfigured) {
            console.log(`[OrderService] Demo mode: Order ${id} status updated to ${status}`);
            return true;
        }

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
